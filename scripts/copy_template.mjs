import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../../nonaca-site');
const destDir = path.resolve(__dirname, '../../astro-appwrite-admin-template');

const excludeDirs = ['.git', 'node_modules', 'dist', '.astro'];

function copySync(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        const dirname = path.basename(src);
        if (excludeDirs.includes(dirname)) return;

        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const items = fs.readdirSync(src);
        for (const item of items) {
            copySync(path.join(src, item), path.join(dest, item));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log('Copying template folder...');
if (fs.existsSync(destDir)) {
    console.log('Destination exists, skipping copy...');
} else {
    copySync(srcDir, destDir);
    console.log('Template created at:', destDir);
}
