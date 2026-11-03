/* Scuola facile — rigenera indice.json leggendo le cartelle di materie/.
   Le materie e i loro colori restano quelli già scritti in indice.json.
   Uso: npm run indice */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const radice = new URL('..', import.meta.url).pathname;
const file = join(radice, 'indice.json');
const indice = JSON.parse(readFileSync(file, 'utf8'));

const verifiche = [];
for (const m of indice.materie) {
  const dir = join(radice, 'materie', m.id);
  if (!existsSync(dir)) continue;
  for (const cartella of readdirSync(dir).filter(f => !f.startsWith('.'))) {
    const d = join(dir, cartella);
    const metaFile = join(d, 'meta.json');
    if (!existsSync(metaFile)) continue;
    const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
    const prove = existsSync(join(d, 'verifiche'))
      ? readdirSync(join(d, 'verifiche')).filter(f => f.endsWith('.json')).length : 0;
    verifiche.push({
      materia: m.id,
      cartella,
      titolo: meta.titoloVerifica || (meta.argomenti || []).join(', ') || meta.titolo,
      data: (meta.verifica && meta.verifica.data) || null,
      ha: {
        ripasso: existsSync(join(d, 'ripasso.json')),
        schema: existsSync(join(d, 'schema.json')),
        verifiche: prove,
      },
    });
  }
}

indice.verifiche = verifiche;
writeFileSync(file, JSON.stringify(indice, null, 2) + '\n');
console.log(`indice.json: ${verifiche.length} verifiche`);
