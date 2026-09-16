/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 自定义工具链地址（默认：优先同源 /toolchain，其次 jsDelivr CDN） */
  readonly VITE_TOOLCHAIN_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
