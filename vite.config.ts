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
  let outDir = path.resolve(process.cwd(), 'dist');
  let basePath = '/';
  let command: 'build' | 'serve' = 'serve';
  let pythonDir = '';
  try {
    const pkgPath = require.resolve('browsercc/package.json');
    distDir = path.join(path.dirname(pkgPath), 'dist');
    version = (require('browsercc/package.json') as { version: string }).version;
  } catch {
    distDir = '';
  }
  try {
    pythonDir = path.dirname(require.resolve('pyodide/package.json'));
  } catch {
    pythonDir = '';
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
    if (url.startsWith('/python-runtime/')) {
      if (fs.existsSync(path.join(publicDir, 'python-runtime', 'pyodide.asm.wasm'))) {
        next();
        return;
      }
      const rel = decodeURIComponent(url.slice('/python-runtime/'.length));
      const file = path.resolve(pythonDir, rel);
      if (!pythonDir || !file.startsWith(pythonDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        next();
        return;
      }
      res.setHeader('Content-Type', MIME_TYPES[path.extname(file)] ?? 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
      return;
    }
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

  /** 生成注入脚本的 HTML 片段 */
  const injectScript = (html: string): string => {
    const localBase = `${basePath.replace(/\/$/, '')}/toolchain`;
    const snippet = `<script>window.__OIWORLD_LOCAL_TOOLCHAIN__=${JSON.stringify(localBase)};</script>`;
    return html.replace('</head>', `  ${snippet}\n  </head>`);
  };

  return {
    name: 'oiworld-toolchain-dev-server',
    configResolved(config) {
      publicDir = config.publicDir || publicDir;
      basePath = config.base || '/';
      command = config.command;
      outDir = config.build.outDir || outDir;
    },
    /**
     * dev 模式：往 index.html 注入「同源工具链地址」。
     * （preview 不会执行这个钩子，所以下面单独处理。）
     */
    transformIndexHtml(html) {
      if (command === 'build') return html;
      return injectScript(html);
    },
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      // preview 直接读磁盘上的 dist/index.html，不会走 transformIndexHtml，
      // 所以这里自己注入一次，保证 `npm run preview` 用同源工具链（不下载 CDN）。
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        const indexPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
        if (url !== indexPath && url !== `${indexPath}index.html`) {
          next();
          return;
        }
        const file = path.join(outDir, 'index.html');
        if (!fs.existsSync(file)) {
          next();
          return;
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(injectScript(fs.readFileSync(file, 'utf8')));
      });
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

/**
 * 同源工具链是否存在，在**构建期**就定下来，注入成常量。
 * 这样运行时不需要 fetch 一个 manifest.json 去探测 —— 在 GitHub Pages 这类
 * 静态托管上，那次探测会 404 并在浏览器控制台留下一条错误。
 *
 *  - 开发 / 预览（vite serve）：中间件始终提供 <base>/toolchain，直接走同源
 *  - 构建：public/toolchain/manifest.json 存在才算有（npm run setup:toolchain 生成）
 */
function resolveLocalToolchain(command: 'build' | 'serve') {
  if (command === 'serve') {
    return { base: `${base.replace(/\/$/, '')}/toolchain`, version: '' };
  }
  const manifestPath = path.resolve(
    process.cwd(),
    'public',
    'toolchain',
    'manifest.json',
  );
  if (!fs.existsSync(manifestPath)) return { base: '', version: '' };
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      version?: string;
    };
    return {
      base: `${base.replace(/\/$/, '')}/toolchain`,
      version: manifest.version ?? '',
    };
  } catch {
    return { base: '', version: '' };
  }
}

export default defineConfig(({ command }) => {
  const localToolchain = resolveLocalToolchain(command);
  return {
    base,
    define: {
      __OIWORLD_LOCAL_TOOLCHAIN__: JSON.stringify(localToolchain.base),
      __OIWORLD_TOOLCHAIN_VERSION__: JSON.stringify(localToolchain.version),
    },
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
    worker: {
      format: 'es',
    },
  };
});
