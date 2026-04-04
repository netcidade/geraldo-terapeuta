// Atualiza o frontmatter do admin/index.astro para usar Appwrite
import fs from 'node:fs';

const file = 'src/pages/admin/index.astro';
let content = fs.readFileSync(file, 'utf8');

const OLD = `---
export const prerender = false;
import fs from 'node:fs';
import path from 'node:path';

const productsPath = path.join(process.cwd(), 'src/content/products.json');
const pagesPath = path.join(process.cwd(), 'src/content/pages.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const content = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
---`;

const NEW = `---
export const prerender = false;
import { getDatabases, DB_ID, COL_CONTENT, COL_PRODUCTS } from '../../lib/appwrite';
import { Query } from 'node-appwrite';

const db = getDatabases();

// Carrega páginas do Appwrite
const pagesRes = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
const pagesDoc = pagesRes.documents[0];
const content = pagesDoc ? JSON.parse(pagesDoc.data) : {};

// Carrega produtos do Appwrite
const productsRes = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
const products = productsRes.documents.map(d => JSON.parse(d.data));
---`;

if (!content.includes('import fs from')) {
  console.log('⚠️  Frontmatter já foi alterado anteriormente ou não contém o padrão esperado.');
} else {
  content = content.replace(OLD, NEW);
  fs.writeFileSync(file, content);
  console.log('✅ admin/index.astro frontmatter atualizado com sucesso!');
}
