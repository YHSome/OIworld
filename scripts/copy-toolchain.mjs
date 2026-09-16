/**
 * 把 browsercc 的编译器工具链复制到 public/toolchain/，
 * 让站点完全离线运行（不依赖任何 CDN）。
 *
 *   node scripts/copy-toolchain.mjs
 *   npm run setup:toolchain
 *
 * 执行后：
 *   - `npm run dev` 会优先使用 /toolchain（本地静态资源）
 *   - `npm run build` 会把工具链一起打包进 dist（产物约 95MB）
 *
 * 如果不需要离线运行，可以不执行这个脚本：
 * 开发服务器会把 /toolchain/* 映射到 node_modules/browsercc/dist/*，
 * 生产环境则自动回退到 jsDelivr CDN。
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  'index.js',
  'clang.js',
  'clang.wasm',
  'lld.js',
  'lld.wasm',
  'sysroot.tar',
];

let pkgPath;
try {
  pkgPath = require.resolve('browsercc/package.json');
} catch {
  console.error(
    '找不到 browsercc 包，请先执行 npm install 再运行本脚本。',
  );
  process.exit(1);
}

const distDir = path.join(path.dirname(pkgPath), 'dist');
const version = require('browsercc/package.json').version;
const targetDir = path.join(root, 'public', 'toolchain');

fs.mkdirSync(targetDir, { recursive: true });

let total = 0;
for (const file of FILES) {
  const source = path.join(distDir, file);
  if (!fs.existsSync(source)) {
    console.error(`缺少文件：${source}`);
    process.exit(1);
  }
  const target = path.join(targetDir, file);
  fs.copyFileSync(source, target);
  const size = fs.statSync(target).size;
  total += size;
  console.log(
    `  复制 ${file.padEnd(12)} ${(size / 1024 / 1024).toFixed(1)} MB`,
  );
}

fs.writeFileSync(
  path.join(targetDir, 'manifest.json'),
  `${JSON.stringify({ name: 'browsercc', version, files: FILES }, null, 2)}\n`,
  'utf8',
);

console.log(
  `\n完成：工具链已就绪于 public/toolchain（共 ${(total / 1024 / 1024).toFixed(1)} MB）。`,
);
console.log('现在开发与构建都会优先使用本地编译器，完全离线可用。');
console.log('提示：这些文件体积较大，建议加入 .gitignore，不要提交到代码仓库。');
