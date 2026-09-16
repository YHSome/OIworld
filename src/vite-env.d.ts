/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 自定义工具链地址（默认：优先同源 <base>/toolchain，其次 jsDelivr CDN） */
  readonly VITE_TOOLCHAIN_BASE?: string;
  /** 设为 '1' 时改用 HashRouter（GitHub Pages 等静态托管用） */
  readonly VITE_HASH_ROUTER?: string;
  /** 构建时的 base 路径，例如 /OIworld/ */
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
