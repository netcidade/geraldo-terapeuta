import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69ce5dec001dbdbfcac3')
    .setKey('standard_82b66028e85465780e1d16bf5eba4d5f7601ae8fece08ef1db9b0db194238e8a8e375b0a459e06db68492ebfec7b224678787cf4d4c145af8ff2a2f740e0f4ba4d33b6632e85f908e924e3b594c9db88177f45e7af6df12033afbed608b108a640f8486d60cab9cfdae1bb3b607e3e5822d393e17dead89b8fa946c2123beebf');

const databases = new Databases(client);
const DB_ID = '69ce615f0021b49bf407';

async function run() {
    try {
        console.log('Cleaning up products...');
        const productsRes = await databases.listDocuments(DB_ID, 'products', [Query.limit(100)]);
        const seenProducts = new Set();
        for (const doc of productsRes.documents) {
            if (seenProducts.has(doc.slug)) {
                await databases.deleteDocument(DB_ID, 'products', doc.$id);
                console.log('Deleted duplicate product:', doc.slug);
            } else {
                seenProducts.add(doc.slug);
            }
        }

        console.log('Cleaning up pages...');
        const pagesRes = await databases.listDocuments(DB_ID, 'site_content', [Query.limit(100)]);
        const seenPages = new Set();
        for (const doc of pagesRes.documents) {
            if (seenPages.has(doc.key)) {
                await databases.deleteDocument(DB_ID, 'site_content', doc.$id);
                console.log('Deleted duplicate page config:', doc.key);
            } else {
                seenPages.add(doc.key);
            }
        }

        console.log('Done.');
    } catch (err) {
        console.error('Error cleanup', err.message);
    }
}

run();
