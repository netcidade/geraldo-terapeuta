import { Client, Databases, Permission, Role } from 'node-appwrite';

const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '69ce9047000365754c92';
const APPWRITE_DB_ID = '69ce90680013f47be034';
const APPWRITE_API_KEY = 'standard_6083afdc5b1a970d094fe499227bf54885d2d2e2341a9f129a490edfdeb45dd2fc295ba76ed0cbfd3f1a86a17b603826444073b110c7d31a9d6d70e4e35893ecde7e9ecd41df4449aa04039934b3e4977b956bd14bbc5fbe2f782ebe8c0efa795385a2806b779f80260a2714dc76891bdaf9a66f53cd4af212de0c375fb10e4c';

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function setup() {
    console.log('🚀 Iniciando configuração do Appwrite...');

    try {
        // 1. Criar Coleção
        console.log('📂 Criando coleção "blog"...');
        const collection = await databases.createCollection(
            APPWRITE_DB_ID,
            'blog',
            'blog',
            [
                Permission.read(Role.any()), // Leitura pública
                Permission.write(Role.users()), // Escrita apenas autenticados (opcional, Admin usa API Key)
            ]
        );
        console.log('✅ Coleção "blog" criada com sucesso!');

        // 2. Criar Atributos
        console.log('🏷️ Criando atributos "slug" e "data"...');
        
        await databases.createStringAttribute(
            APPWRITE_DB_ID,
            'blog',
            'slug',
            255,
            true // obrigatório
        );
        console.log('✅ Atributo "slug" criado.');

        await databases.createStringAttribute(
            APPWRITE_DB_ID,
            'blog',
            'data',
            15000,
            true // obrigatório
        );
        console.log('✅ Atributo "data" criado.');

        console.log('✨ Configuração concluída com sucesso!');
        console.log('💡 Agora você pode voltar ao Admin e salvar seus posts!');

    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️ A coleção ou atributos já existem. Verificando permissões...');
            try {
                await databases.updateCollection(
                    APPWRITE_DB_ID,
                    'blog',
                    'blog',
                    [
                        Permission.read(Role.any()),
                    ]
                );
                console.log('✅ Permissões da coleção "blog" atualizadas para leitura pública.');
            } catch (e) {
                console.error('❌ Erro ao atualizar permissões:', e.message);
            }
        } else {
            console.error('❌ Erro durante a configuração:', error.message);
        }
    }
}

setup();
