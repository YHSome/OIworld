/** 把 Pyodide 的浏览器运行文件复制到 public/python-runtime/。 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.dirname(require.resolve('pyodide/package.json'));
const targetDir = path.join(root, 'public', 'python-runtime');
const files = ['pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

fs.mkdirSync(targetDir, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
