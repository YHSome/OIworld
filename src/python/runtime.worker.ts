import { loadPyodide, type PyodideInterface } from 'pyodide';

type Request =
  | { type: 'init'; base: string }
  | { type: 'run'; id: number; code: string; stdin: string; outputLimit: number };

let pyodide: PyodideInterface | null = null;

function append(current: string, text: string, limit: number) {
  return current.length >= limit ? current : `${current}${text}`.slice(0, limit);
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data;
  if (request.type === 'init') {
    try {
      pyodide = await loadPyodide({ indexURL: request.base });
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'init-error', message: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (!pyodide) {
    self.postMessage({ type: 'result', id: request.id, kind: 'runtime-error', stdout: '', stderr: '', diagnostics: 'Python 运行环境尚未就绪。', durationMs: 0 });
    return;
  }

  const started = performance.now();
  let stdout = '';
  let stderr = '';
  const lines = request.stdin.replace(/\r\n?/g, '\n').split('\n');
  if (lines.at(-1) === '') lines.pop();
  let lineIndex = 0;
  try {
    pyodide.setStdout({ batched: (text) => { stdout = append(stdout, `${text}\n`, request.outputLimit); } });
    pyodide.setStderr({ batched: (text) => { stderr = append(stderr, `${text}\n`, request.outputLimit); } });
    pyodide.setStdin({ stdin: () => lines[lineIndex++] });
    const globals = pyodide.toPy({ __name__: '__main__' });
    try {
      await pyodide.runPythonAsync(request.code, { globals });
    } finally {
      globals.destroy();
    }
    self.postMessage({ type: 'result', id: request.id, kind: 'passed', stdout, stderr, diagnostics: '', durationMs: performance.now() - started });
  } catch (error) {
    const diagnostics = error instanceof Error ? error.message : String(error);
    const kind = /SyntaxError|IndentationError|TabError/.test(diagnostics) ? 'compile-error' : 'runtime-error';
    self.postMessage({ type: 'result', id: request.id, kind, stdout, stderr, diagnostics, durationMs: performance.now() - started });
  }
};
