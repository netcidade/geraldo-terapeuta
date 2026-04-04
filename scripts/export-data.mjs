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

const DB_ID = env.APPWRITE_DB_ID;
const COL_CONTENT = env.APPWRITE_COLLECTION_CONTENT ?? 'site_content';
const COL_PRODUCTS = env.APPWRITE_COLLECTION_PRODUCTS ?? 'products';

async function exportData() {
    console.log('--- Iniciando BACKUP do Appwrite para Arquivos Locais ---');

    try {
        // 1. Exportar Especialidades
        console.log('📥 Baixando Especialidades...');
        const prodRes = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
        const products = prodRes.documents.map(doc => JSON.parse(doc.data));
        fs.writeFileSync(
            path.resolve(process.cwd(), 'src/content/products.json'),
            JSON.stringify(products, null, 2),
            'utf8'
        );
        console.log(`✅ ${products.length} especialidades salvas em src/content/products.json`);

        // 2. Exportar Conteúdo das Páginas (Hero, Bio, etc)
        console.log('📥 Baixando Conteúdo das Páginas...');
        const contentRes = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
        if (contentRes.documents.length > 0) {
            const pagesData = JSON.parse(contentRes.documents[0].data);
            fs.writeFileSync(
                path.resolve(process.cwd(), 'src/content/pages.json'),
                JSON.stringify(pagesData, null, 2),
                'utf8'
            );
            console.log('✅ Conteúdo das páginas salvo em src/content/pages.json');
        }

        console.log('\n--- BACKUP CONCLUÍDO COM SUCESSO! ---');
        console.log('Agora seus arquivos locais refletem exatamente o que está no banco de dados.');
    } catch (error) {
        console.error('❌ Erro durante a exportação:', error.message);
    }
}

exportData();
