/* Scuola facile — rigenera indice.json leggendo le cartelle di materie/.
   Le materie, i loro colori e il loro ordine restano quelli già scritti in indice.json.
   Il titolo di un argomento è il campo "argomento" del suo meta.json.
   Uso: npm run indice */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const radice = new URL('..', import.meta.url).pathname;
const file = join(radice, 'indice.json');
const indice = JSON.parse(readFileSync(file, 'utf8'));

const argomenti = [];
for (const m of indice.materie) {
  const dir = join(radice, 'materie', m.id);
  if (!existsSync(dir)) continue;
  for (const cartella of readdirSync(dir).filter(f => !f.startsWith('.'))) {
    const d = join(dir, cartella);
    const metaFile = join(d, 'meta.json');
    if (!existsSync(metaFile)) continue;
    const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
    const prove = [];
    if (existsSync(join(d, 'verifiche'))) {
      for (const f of readdirSync(join(d, 'verifiche')).filter(x => x.endsWith('.json')).sort()) {
        const p = JSON.parse(readFileSync(join(d, 'verifiche', f), 'utf8'));
        prove.push({
          file: f,
          titolo: p.titolo,
          sotto: p.sotto || '',
          esercizi: (p.esercizi || []).length,
          punti: (p.esercizi || []).reduce((a, e) => a + (e.punti || 0), 0),
        });
      }
    }
    argomenti.push({
      materia: m.id,
      cartella,
      titolo: meta.argomento || cartella,
      ha: {
        ripasso: existsSync(join(d, 'ripasso.json')),
        schema: existsSync(join(d, 'schema.json')),
        verifiche: prove.length,
      },
      prove,
    });
  }
}

indice.argomenti = argomenti;
writeFileSync(file, JSON.stringify(indice, null, 2) + '\n');
console.log(`indice.json: ${argomenti.length} argomenti`);
