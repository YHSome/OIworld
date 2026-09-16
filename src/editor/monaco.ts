/**
 * Monaco Editor 本地化配置。
 *
 * 默认情况下 @monaco-editor/react 会从 CDN 拉取 monaco，
 * 这里改为直接使用 npm 包自带的 monaco，并让 Web Worker 由 Vite 打包，
 * 从而做到完全离线可用。
 */

import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { loader } from '@monaco-editor/react';

interface MonacoEnvironment {
  getWorker: (moduleId: string, label: string) => Worker;
}

// C++ 只需要基础的编辑器 worker（不需要语言服务）
(self as unknown as { MonacoEnvironment: MonacoEnvironment }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });

export { monaco };
