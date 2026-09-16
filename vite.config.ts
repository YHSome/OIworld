import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);

const MIME_TYPES: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.tar': 'application/x-tar',
  '.pch': 'application/octet-stream',
};

/**
 * 开发/预览服务器把 /toolchain/* 映射到 node_modules/browsercc/dist/*。
 *
 * 这样 `npm run dev` 开箱即用，不必先把 90MB 的工具链拷进 public/。
 * 如果用户执行过 `npm run setup:toolchain`（public/toolchain 已存在），
 * 则优先使用本地静态目录，实现完全离线。
 */
function toolchainDevServer(): Plugin {
  let distDir = '';
  let version = '0.0.0';
  let publicDir = path.resolve(process.cwd(), 'public');
  let basePath = '/';
  try {
    const pkgPath = require.resolve('browsercc/package.json');
    distDir = path.join(path.dirname(pkgPath), 'dist');
    version = (require('browsercc/package.json') as { version: string }).version;
  } catch {
    distDir = '';
  }

  const manifest = JSON.stringify(
    {
      name: 'browsercc',
      version,
      files: [
        'index.js',
        'clang.js',
        'clang.wasm',
        'lld.js',
        'lld.wasm',
        'sysroot.tar',
      ],
    },
    null,
    2,
  );

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const raw = (req.url ?? '').split('?')[0];
    // dev / preview 也支持部署用的子路径（例如 --base=/OIworld/）
    const url = basePath !== '/' && raw.startsWith(basePath)
      ? `/${raw.slice(basePath.length)}`
      : raw;
    if (!url.startsWith('/toolchain/')) {
      next();
      return;
    }
    // 本地已铺设工具链时，交给 Vite 的静态文件服务处理
    if (fs.existsSync(path.join(publicDir, 'toolchain', 'manifest.json'))) {
      next();
      return;
    }
    const rel = decodeURIComponent(url.slice('/toolchain/'.length));
    if (rel === 'manifest.json') {
      res.setHeader('Content-Type', MIME_TYPES['.json']);
      res.setHeader('Cache-Control', 'no-store');
      res.end(manifest);
      return;
    }
    if (!distDir) {
      next();
      return;
    }
    const file = path.resolve(distDir, rel);
    if (!file.startsWith(distDir) || !fs.existsSync(file)) {
      next();
      return;
    }
    const stat = fs.statSync(file);
    if (!stat.isFile()) {
      next();
      return;
    }
    res.setHeader(
      'Content-Type',
      MIME_TYPES[path.extname(file)] ?? 'application/octet-stream',
    );
    res.setHeader('Content-Length', String(stat.size));
    res.setHeader('Cache-Control', 'public, max-age=604800');
    fs.createReadStream(file).pipe(res);
  };

  return {
    name: 'oiworld-toolchain-dev-server',
    configResolved(config) {
      publicDir = config.publicDir || publicDir;
      basePath = config.base || '/';
    },
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

/**
 * 部署到 GitHub Pages 时：
 *   base 设为 /<仓库名>/（例如 /OIworld/）
 *   VITE_HASH_ROUTER=1 启用 hash 路由，避免刷新深链时 404
 * 本地开发保持 base='/'、BrowserRouter，地址栏更干净。
 */
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [react(), toolchainDevServer()],
  optimizeDeps: {
    // run.worker.ts 只在“第一次运行”时才被浏览器加载，
    // 若此时 Vite 才去预构建这个依赖，会触发依赖重优化并强制刷新页面，
    // 导致这一次运行永远拿不到结果。这里提前把它加入预构建。
    include: ['@bjorn3/browser_wasi_shim'],
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    // monaco-editor 体积较大，放宽警告阈值
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
          antd: ['antd', '@ant-design/icons'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
