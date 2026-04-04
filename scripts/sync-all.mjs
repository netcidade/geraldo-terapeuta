import { Client, Databases, ID, Query } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

// Carregar .env manualmente
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...value] = trimmed.split('=');
        if (key && value) env[key.trim()] = value.join('=').trim();
    });
    return env;
}

const env = loadEnv();
const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = env.APPWRITE_DB_ID;
const COL_PRODUCTS = env.APPWRITE_COLLECTION_PRODUCTS || 'products';
const COL_CONTENT = env.APPWRITE_COLLECTION_CONTENT || 'site_content';

async function run() {
    console.log('--- Iniciando sincronização TOTAL do site ---');
    
    // 1. Sincronizar Páginas (Hero, Bio, etc)
    try {
        const pagesPath = path.resolve(process.cwd(), 'src/content/pages.json');
        const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
        const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
        
        if (res.documents[0]) {
            await db.updateDocument(DB_ID, COL_CONTENT, res.documents[0].$id, { data: JSON.stringify(pages) });
            console.log('✅ Páginas sincronizadas (Atualizado)');
        } else {
            await db.createDocument(DB_ID, COL_CONTENT, ID.unique(), { key: 'pages', data: JSON.stringify(pages) });
            console.log('✅ Páginas sincronizadas (Criado)');
        }
    } catch (e) {
        console.error('❌ Erro nas Páginas:', e.message);
    }

    // 2. Sincronizar Especialidades (Products)
    try {
        const productsPath = path.resolve(process.cwd(), 'src/content/products.json');
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const existing = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
        
        for (const d of existing.documents) await db.deleteDocument(DB_ID, COL_PRODUCTS, d.$id);
        for (const p of products) await db.createDocument(DB_ID, COL_PRODUCTS, ID.unique(), { slug: p.slug, data: JSON.stringify(p) });
        console.log(`✅ Especialidades sincronizadas (${products.length} itens)`);
    } catch (e) {
        console.error('❌ Erro nas Especialidades:', e.message);
    }

    console.log('--- Sincronização TOTAL concluída! ---');
}

run();
