import { Client, Databases, ID } from 'node-appwrite';
import fs from 'fs';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69ce5dec001dbdbfcac3')
    .setKey('standard_82b66028e85465780e1d16bf5eba4d5f7601ae8fece08ef1db9b0db194238e8a8e375b0a459e06db68492ebfec7b224678787cf4d4c145af8ff2a2f740e0f4ba4d33b6632e85f908e924e3b594c9db88177f45e7af6df12033afbed608b108a640f8486d60cab9cfdae1bb3b607e3e5822d393e17dead89b8fa946c2123beebf');

const databases = new Databases(client);

const DB_ID = '69ce615f0021b49bf407';

async function run() {
    const products = JSON.parse(fs.readFileSync('./src/content/products.json', 'utf8'));
    for (const p of products) {
        try {
            await databases.createDocument(DB_ID, 'products', ID.unique(), {
                slug: p.slug,
                data: JSON.stringify(p)
            });
            console.log('Inserted:', p.slug);
        } catch (err) {
            console.error('Error inserting', p.slug, err.message);
        }
    }

    try {
        const pages = JSON.parse(fs.readFileSync('./src/content/pages.json', 'utf8'));
        await databases.createDocument(DB_ID, 'site_content', ID.unique(), {
            key: 'pages',
            data: JSON.stringify(pages)
        });
        console.log('Inserted: pages');
    } catch (err) {
        console.error('Error inserting pages', err.message);
    }
}

run();
