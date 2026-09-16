/**
 * Monaco Editor 封装：
 *  - C++ 语法高亮
 *  - 把 clang 的错误信息转成编辑器里的波浪线标记（行号 + 列号）
 *  - 对外暴露「跳到 TODO / 跳到指定行」的能力，方便零基础用户定位要写代码的位置
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { monaco } from '../editor/monaco';
import type { Diagnostic } from '../compiler/diagnostics';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Monaco 语法高亮语言；题目页默认仍是 C++。 */
  language?: 'cpp' | 'python';
  height?: number | string;
  diagnostics?: Diagnostic[];
  readOnly?: boolean;
}

/** 供父组件调用的编辑器能力 */
export interface CodeEditorHandle {
  /** 把光标放到第一个 TODO 注释所在的行（给零基础用户指路），没有 TODO 时返回 false */
  jumpToFirstTodo: () => boolean;
  /** 跳到指定行 */
  jumpToLine: (line: number) => void;
}

const SEVERITY: Record<Diagnostic['severity'], monaco.MarkerSeverity> = {
  error: 8, // MarkerSeverity.Error
  warning: 4, // MarkerSeverity.Warning
  info: 2, // MarkerSeverity.Info
};

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    { value, onChange, language = 'cpp', height = 420, diagnostics = [], readOnly = false },
    ref,
  ) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof monaco | null>(null);

    const applyMarkers = () => {
      const instance = editorRef.current;
      const api = monacoRef.current;
      if (!instance || !api) return;
      const model = instance.getModel();
      if (!model) return;
      const markers: monaco.editor.IMarkerData[] = diagnostics.map((item) => ({
        startLineNumber: Math.max(1, item.line),
        startColumn: Math.max(1, item.column),
        endLineNumber: Math.max(1, item.line),
        endColumn: Math.max(1, item.column) + 1,
        message: item.message,
        severity: SEVERITY[item.severity],
      }));
      api.editor.setModelMarkers(model, 'clang', markers);
    };

    useEffect(() => {
      applyMarkers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [diagnostics]);

    const focusLine = (line: number, column = 1) => {
      const instance = editorRef.current;
      const model = instance?.getModel();
      if (!instance || !model) return;
      const target = Math.min(Math.max(1, line), model.getLineCount());
      instance.revealLineInCenter(target);
      instance.setPosition({ lineNumber: target, column });
      instance.focus();
    };

    useImperativeHandle(ref, () => ({
      jumpToFirstTodo: () => {
        const instance = editorRef.current;
        const model = instance?.getModel();
        if (!instance || !model) return false;
        const matches = model.findMatches('TODO', false, false, true, null, false);
        if (matches.length === 0) return false;
        focusLine(matches[0].range.startLineNumber, matches[0].range.startColumn);
        return true;
      },
      jumpToLine: (line: number) => focusLine(line),
    }));

    const handleMount: OnMount = (instance, api) => {
      editorRef.current = instance;
      monacoRef.current = api as unknown as typeof monaco;
      applyMarkers();
    };

    return (
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(next) => onChange(next ?? '')}
        onMount={handleMount}
        options={{
          readOnly,
          fontSize: 14,
          fontFamily:
            "'JetBrains Mono', 'Cascadia Code', Consolas, 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          renderLineHighlight: 'line',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        }}
      />
    );
  },
);
