import { Client, Databases, Query } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
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
const client = new Client().setEndpoint(env.APPWRITE_ENDPOINT).setProject(env.APPWRITE_PROJECT_ID).setKey(env.APPWRITE_API_KEY);
const db = new Databases(client);

async function debug() {
    console.log('--- DEBUG: Verificando dados no Appwrite ---');
    const res = await db.listDocuments(env.APPWRITE_DB_ID, env.APPWRITE_COLLECTION_PRODUCTS, [Query.limit(5)]);
    res.documents.forEach(doc => {
        const p = JSON.parse(doc.data);
        console.log(`Slug: ${p.slug}`);
        console.log(`- Categoria: ${p.category}`);
        console.log(`- Excerpt (Tamanho): ${p.excerpt?.length || 0}`);
        console.log(`- Content (Tamanho): ${p.content?.length || 0}`);
        console.log('---------------------------');
    });
}
debug();
