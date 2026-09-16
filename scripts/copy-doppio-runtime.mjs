/** 将 Doppio JVM 与它下载的 Java 8 类库铺设为同源静态资源。 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageDir = path.dirname(require.resolve('doppiojvm/package.json'));
const sourceDir = path.join(packageDir, 'dist', 'release');
const targetDir = path.join(root, 'public', 'doppio-runtime');

if (!fs.existsSync(path.join(targetDir, 'listings.json'))) {
  fs.cpSync(sourceDir, targetDir, { recursive: true, dereference: true });
  fs.copyFileSync(require.resolve('browserfs/dist/browserfs.min.js'), path.join(targetDir, 'browserfs.min.js'));
}
