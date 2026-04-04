import { Client, Databases, ID, Query } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

// Função simples para carregar .env manualmente
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

async function sync() {
    console.log('--- Iniciando sincronização de Especialidades ---');
    
    // 1. Carregar dados locais
    const productsPath = path.resolve(process.cwd(), 'src/content/products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Dados locais carregados: ${products.length} itens.`);

    // 2. Limpar banco para evitar duplicatas
    try {
        console.log('Buscando documentos existentes para limpeza...');
        const existing = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
        if (existing.total > 0) {
            console.log(`Removendo ${existing.total} documentos antigos...`);
            for (const doc of existing.documents) {
                await db.deleteDocument(DB_ID, COL_PRODUCTS, doc.$id);
            }
            console.log('Limpeza concluída.');
        } else {
            console.log('Nenhum documento antigo encontrado.');
        }
    } catch (e) {
        console.warn('Aviso ao limpar banco (pode ser a primeira carga):', e.message);
    }

    // 3. Inserir novos itens com os links oficiais das imagens
    for (const p of products) {
        try {
            await db.createDocument(DB_ID, COL_PRODUCTS, ID.unique(), {
                slug: p.slug,
                data: JSON.stringify(p)
            });
            console.log(`✅ Adicionado: ${p.title}`);
        } catch (e) {
            console.error(`❌ Erro em ${p.title}:`, e.message);
        }
    }

    console.log('--- Sincronização concluída com sucesso! ---');
}

sync();
