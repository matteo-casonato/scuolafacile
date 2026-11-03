# Scuola facile — converte un deck HTML del prototipo nei blocchi di ripasso.json.
#
# Serve solo per portare dentro l'app i ripassi fatti prima, che stanno in
# contenuti-attuali/ (cartella fuori da git: contiene i nomi dei docenti).
# Stampa l'inventario di quello che non ha saputo convertire.
#
# Uso: python3 scripts/migra-prototipo.py <ripasso_x.html> <pagine.json>
import re, sys, json

VOID = {'br','hr','img','input','circle','line','path','rect','ellipse','polygon','polyline','use','stop','text'}

def top_level(s):
    """Spezza una stringa HTML negli elementi di primo livello."""
    out, i, n = [], 0, len(s)
    while i < n:
        if s[i] != '<':
            j = s.find('<', i)
            if j == -1: j = n
            txt = s[i:j]
            if txt.strip(): out.append(('#text', txt))
            i = j
            continue
        m = re.match(r'<([a-zA-Z0-9]+)([^>]*?)(/?)>', s[i:])
        if not m:
            i += 1
            continue
        tag, attrs, selfclose = m.group(1), m.group(2), m.group(3)
        start = i
        if selfclose or tag.lower() in VOID and not re.search(rf'</{tag}>', s[i:]):
            i += m.end()
            out.append((tag, s[start:i]))
            continue
        # cerca la chiusura corrispondente contando i nidificati
        depth, k = 0, i
        pat = re.compile(rf'<(/?){tag}\b[^>]*?(/?)>', re.I)
        while True:
            mm = pat.search(s, k)
            if not mm: 
                i = n; out.append((tag, s[start:])); break
            if mm.group(1) == '/':
                depth -= 1
                if depth == 0:
                    i = mm.end(); out.append((tag, s[start:i])); break
            elif not mm.group(2):
                depth += 1
            k = mm.end()
        else:
            break
    return out

def cls(el):
    m = re.match(r'<[a-zA-Z0-9]+[^>]*?class="([^"]*)"', el)
    return m.group(1) if m else ''

def inner(el, tag):
    m = re.match(rf'<{tag}\b[^>]*?>(.*)</{tag}>\s*$', el, re.S)
    return m.group(1) if m else ''

def blocchi(corpo, inventario):
    out = []
    for tag, el in top_level(corpo):
        c = cls(el)
        if tag == '#text':
            inventario.setdefault('#text', 0); inventario['#text'] += 1
            out.append({'t': 'html', 'x': el.strip()})
        elif tag == 'p':
            x = inner(el, 'p')
            if c == 'hl': out.append({'t': 'hl', 'x': x})
            elif c: out.append({'t': 'p', 'stile': c, 'x': x})
            else: out.append({'t': 'p', 'x': x})
        elif tag == 'h3':
            b = {'t': 'h', 'x': inner(el, 'h3')}
            if c.startswith('f-'): b['colore'] = c[2:]
            out.append(b)
        elif tag == 'ol' and c == 'steps':
            voci = [inner(li, 'li') for _, li in top_level(inner(el, 'ol')) if _ == 'li']
            voci = [re.sub(r'^<span>(.*)</span>$', r'\1', v, flags=re.S) for v in voci]
            out.append({'t': 'passi', 'x': voci})
        elif tag == 'ul' and c == 'check':
            voci = [inner(li, 'li') for _, li in top_level(inner(el, 'ul')) if _ == 'li']
            voci = [re.sub(r'^<span>(.*)</span>$', r'\1', v, flags=re.S) for v in voci]
            out.append({'t': 'check', 'x': voci})
        elif tag == 'div' and c == 'sym':
            kids = top_level(inner(el, 'div'))
            sym = [k for k in kids if k[0] == 'span'][0][1]
            body = [k for k in kids if k[0] == 'div'][0][1]
            b = {'t': 'sym', 'simbolo': inner(sym, 'span'), 'x': inner(body, 'div')}
            sc = cls(sym).split()
            if 'sm' in sc: b['piccolo'] = True
            for p in sc:
                if p.startswith('f-'): b['colore'] = p[2:]
            st = re.search(r'style="([^"]*)"', sym)
            if st: b['style'] = st.group(1)
            out.append(b)
        elif tag == 'div' and c == 'vs':
            cols = [k[1] for k in top_level(inner(el, 'div')) if k[0] == 'div']
            def col(d):
                kids = top_level(inner(d, 'div'))
                tit = next((inner(k[1], 'h4') for k in kids if k[0] == 'h4'), None)
                voci = []
                for t2, e2 in kids:
                    if t2 != 'p': continue
                    c2 = cls(e2)
                    voci.append({'stile': c2, 'x': inner(e2, 'p')} if c2 else inner(e2, 'p'))
                o = {}
                if tit: o['titolo'] = tit
                o['x'] = voci
                return o
            out.append({'t': 'vs', 'a': col(cols[0]), 'b': col(cols[1])})
        elif tag == 'div' and c == 'tblwrap':
            tab = [k[1] for k in top_level(inner(el, 'div')) if k[0] == 'table'][0]
            righe = [k[1] for k in top_level(inner(tab, 'table')) if k[0] == 'tr']
            b = {'t': 'tbl', 'righe': []}
            for i, tr in enumerate(righe):
                celle = top_level(inner(tr, 'tr'))
                if i == 0 and all(k[0] == 'th' for k in celle):
                    b['intestazione'] = [inner(k[1], 'th') for k in celle]
                else:
                    if celle and celle[0][0] == 'th': b['intestazioneRighe'] = True
                    b['righe'].append([inner(k[1], k[0]) for k in celle])
            out.append(b)
        elif tag == 'details':
            i2 = inner(el, 'details')
            d = re.search(r'<summary>(.*?)</summary>', i2, re.S).group(1)
            r = re.search(r'<p>(.*)</p>\s*$', i2, re.S).group(1)
            out.append({'t': 'sol', 'd': d, 'r': r})
        elif tag == 'svg':
            vb = re.search(r'viewBox="([^"]*)"', el).group(1)
            alt = re.search(r'aria-label="([^"]*)"', el)
            body = inner(el, 'svg')
            body = re.sub(r'<defs>.*?</defs>', '', body, flags=re.S)
            b = {'t': 'svg', 'viewBox': vb, 'alt': alt.group(1) if alt else '', 'body': body.strip()}
            if cls(el): b['classe'] = cls(el)
            out.append(b)
        elif tag == 'div' and c == 'mp':
            out.append({'t': 'schema'})
        else:
            inventario.setdefault(f'{tag}.{c}', 0); inventario[f'{tag}.{c}'] += 1
            out.append({'t': 'html', 'x': el})
    return out

def leggi(path):
    h = open(path, encoding='utf-8').read()
    inv = {}
    pagine = []
    for m in re.finditer(r'<section class="slide[^"]*" data-sec="([^"]*)" data-col="([^"]*)"[^>]*>\s*'
                         r'<div class="inner"><h2>(.*?)</h2>(.*?)</div></section>', h, re.S):
        sec, col, titolo, corpo = m.groups()
        pagine.append({'sezione': sec, 'colore': col, 'titolo': titolo,
                       'blocchi': blocchi(corpo.strip(), inv)})
    return pagine, inv

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__ or 'uso: python3 scripts/migra-prototipo.py <html> <pagine.json>')
        sys.exit(1)
    pagine, inv = leggi(sys.argv[1])
    print(len(pagine), 'pagine')
    if inv:
        print('da guardare a mano:', inv)
    json.dump(pagine, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
    print('scritto', sys.argv[2])
