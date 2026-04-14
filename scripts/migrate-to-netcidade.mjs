
import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';

// Credenciais ORIGEM (NYC Cloud)
const SRC = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    project: '69ce9047000365754c92',
    key: 'standard_793bdeb1ef800eb0b88804311d1d513ac169719cb0ff13b45219867c8e42b499142cd79dfd474172e5d84ae44dd4ac9e8afa9d7d4fa66dd256f295b5322a55e8bf32b8b32b531ca9cc94bbdf38d801fd48900cb4469c278ed1f335e8f6f8ac4665e2bd991e592ecc9be8c2bd1edcd334d947289ada6b86de5206ab4f3bd5ffec',
    dbId: '69ce90680013f47be034'
};

// Credenciais DESTINO (Netcidade)
const DST = {
    endpoint: 'https://appwrite.netcidade.com/v1',
    project: '69dbb21c002996133a6c',
    key: 'standard_5f51ef0af30794877c7805df837d53349a9d18e439103ea832ff9bbea643aa48b79a5a447549183b260d6a314592a4d192f3a2214e5436fca76ec781c336461382558850ddbe069e96bec19d7ffc563ea19d903ed3143666bec33d43b8939b3a3fbe3800c37d591d81e2d061c26d8fb66c99b56ec043f7a3394ed97ca0d37584',
    dbId: '69dbb32f0039e83d45a7'
};

const srcClient = new Client().setEndpoint(SRC.endpoint).setProject(SRC.project).setKey(SRC.key);
const dstClient = new Client().setEndpoint(DST.endpoint).setProject(DST.project).setKey(DST.key);

const srcDb = new Databases(srcClient);
const dstDb = new Databases(dstClient);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function createCollectionSafe(name, id, attributes) {
    console.log(`\n📁 Preparando coleção: ${name} (${id})...`);
    try {
        await dstDb.createCollection(DST.dbId, id, name, [Permission.read(Role.any())]);
        console.log(`   ✅ Coleção ${name} criada.`);
        
        for (const attr of attributes) {
            console.log(`   🔸 Criando atributo: ${attr.key}...`);
            await dstDb.createStringAttribute(DST.dbId, id, attr.key, attr.size, attr.required);
            await sleep(1000);
        }
        
        console.log(`   ⏳ Aguardando índices (10s)...`);
        await sleep(10000);
    } catch (e) {
        if (e.code === 409) {
            console.log(`   ℹ️ Coleção ${name} já existe.`);
        } else {
            console.error(`   ❌ Erro ao criar coleção ${name}:`, e.message);
        }
    }
}

async function migrateCollection(id, attributes) {
    console.log(`\n🚀 Migrando dados de: ${id}...`);
    try {
        // 1. Buscar da Origem
        const res = await srcDb.listDocuments(SRC.dbId, id, [Query.limit(100)]);
        console.log(`   📥 Encontrados ${res.total} documentos na origem.`);
        
        // 2. Limpar Destino (Opcional, mas seguro para 'completar')
        const existing = await dstDb.listDocuments(DST.dbId, id, [Query.limit(100)]);
        for (const doc of existing.documents) {
            await dstDb.deleteDocument(DST.dbId, id, doc.$id);
        }
        if (existing.total > 0) console.log(`   🧹 Limpeza de documentos antigos concluída.`);

        // 3. Injetar no Destino
        for (const doc of res.documents) {
            const data = {};
            attributes.forEach(attr => {
                data[attr.key] = doc[attr.key];
            });
            await dstDb.createDocument(DST.dbId, id, ID.unique(), data);
            console.log(`   ✅ Documento migrado: ${data.key || data.slug || doc.$id}`);
        }
    } catch (e) {
        console.error(`   ❌ Erro na migração de ${id}:`, e.message);
    }
}

async function main() {
    console.log('=== INICIANDO MIGRAÇÃO GERALDO TERAPEUTA ===');
    console.log(`De: ${SRC.endpoint}`);
    console.log(`Para: ${DST.endpoint}`);

    // Configuração das coleções
    const collections = [
        { 
            id: 'site_content', 
            name: 'site_content', 
            attrs: [{ key: 'key', size: 64, required: true }, { key: 'data', size: 65535, required: true }] 
        },
        { 
            id: 'products', 
            name: 'products', 
            attrs: [{ key: 'slug', size: 128, required: true }, { key: 'data', size: 65535, required: true }] 
        },
        { 
            id: 'blog', 
            name: 'blog', 
            attrs: [{ key: 'slug', size: 128, required: true }, { key: 'data', size: 65535, required: true }] 
        }
    ];

    for (const col of collections) {
        await createCollectionSafe(col.name, col.id, col.attrs);
        await migrateCollection(col.id, col.attrs);
    }

    console.log('\n=== MIGRAÇÃO CONCLUÍDA COM SUCESSO! ===');
}

main().catch(err => console.error('\n❌ ERRO FATAL:', err));
