/**
 * 输出 / 结果面板：
 *  - 编译失败：红色提示 + clang 的完整诊断（带行号）
 *  - 运行错误 / 超时 / 输出过多：红色提示 + 具体原因
 *  - 运行成功：绿色提示 + 标准输出
 */

import { Alert, Card, Empty, Space, Spin, Tag, Typography } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import type { RunOutcome, RunStatus } from '../types/problem';
import type { SubmissionResult } from '../compiler/client';
import {
  beginnerTips,
  cleanCompilerOutput,
  parseDiagnostics,
  type BeginnerTip,
} from '../compiler/diagnostics';

const { Text } = Typography;

interface OutputPanelProps {
  outcome: RunOutcome | null;
  submission: SubmissionResult | null;
  /** 正在运行 / 正在评测 */
  busy: boolean;
  /** 本次操作是“运行”还是“提交” */
  mode: 'run' | 'submit';
  /** 编辑器里的代码，用于生成新手自查提示（例如中文标点检测） */
  code?: string;
  onJumpToLine?: (line: number) => void;
}

/** 新手自查提示：把 clang 的报错翻译成人话 */
function BeginnerTipList({
  tips,
  onJumpToLine,
}: {
  tips: BeginnerTip[];
  onJumpToLine?: (line: number) => void;
}) {
  if (tips.length === 0) return null;
  return (
    <Card
      size="small"
      className="beginner-tips"
      title={
        <span>
          <BulbOutlined /> 零基础自查提示（先看这里）
        </span>
      }
    >
      {tips.map((tip, index) => (
        <div key={index} className="beginner-tip">
          <div className="beginner-tip-title">
            {tip.line !== undefined && (
              <Tag
                color="orange"
                style={{ cursor: onJumpToLine ? 'pointer' : 'default' }}
                onClick={() => onJumpToLine?.(tip.line as number)}
              >
                第 {tip.line} 行
              </Tag>
            )}
            {tip.title}
          </div>
          <pre className="beginner-tip-detail">{tip.detail}</pre>
        </div>
      ))}
    </Card>
  );
}

const STATUS_TEXT: Record<RunStatus, string> = {
  passed: '通过',
  'wrong-answer': '答案错误',
  'compile-error': '编译错误',
  'runtime-error': '运行错误',
  timeout: '运行超时',
  'output-limit': '输出过多',
  crashed: '运行环境异常',
};

function OutputBlock({
  title,
  content,
  tone,
}: {
  title: string;
  content: string;
  tone?: 'error' | 'normal';
}) {
  return (
    <div className="output-block">
      <div className="output-block-title">{title}</div>
      <pre className={`output-pre${tone === 'error' ? ' output-pre-error' : ''}`}>
        {content}
      </pre>
    </div>
  );
}

export function OutputPanel({
  outcome,
  submission,
  busy,
  mode,
  code = '',
  onJumpToLine,
}: OutputPanelProps) {
  if (busy) {
    return (
      <div className="panel-placeholder">
        <Spin />
        <Text type="secondary" style={{ marginLeft: 12 }}>
          {mode === 'submit' ? '正在评测所有测试用例…' : '正在编译并运行…'}
        </Text>
      </div>
    );
  }

  // 提交结果优先展示
  if (submission) {
    const allPassed = submission.passed === submission.total;
    if (!submission.compileOk) {
      return (
        <CompileErrorPanel
          code={code}
          diagnostics={submission.diagnostics}
          onJumpToLine={onJumpToLine}
        />
      );
    }
    const failedCases = submission.cases.filter((c) => c.status !== 'passed');
    const firstFailed = failedCases[0];
    return (
      <div className="output-panel">
        <Alert
          type={allPassed ? 'success' : 'error'}
          showIcon
          message={
            allPassed
              ? `🎉 恭喜通过！${submission.total} 个测试用例全部正确`
              : `通过 ${submission.passed}/${submission.total} 个测试用例`
          }
          description={
            allPassed
              ? '这道题已经标记为完成，可以去挑战下一题了。'
              : `未通过的用例编号：${failedCases
                  .map((c) => `#${c.index + 1}`)
                  .join('、')}`
          }
        />
        {!allPassed && firstFailed && (
          <div style={{ marginTop: 12 }}>
            <Text strong>
              第一个未通过的用例（#{firstFailed.index + 1}）：
            </Text>
            {firstFailed.message && (
              <div style={{ marginTop: 4 }}>
                <Tag color="error">{STATUS_TEXT[firstFailed.status]}</Tag>
                <Text type="danger">{firstFailed.message}</Text>
              </div>
            )}
            <div className="compare-grid">
              <OutputBlock
                title="期望输出"
                content={firstFailed.expected || '（空）'}
              />
              <OutputBlock
                title="实际输出"
                content={
                  firstFailed.stdout ||
                  firstFailed.stderr ||
                  '（程序没有产生任何输出）'
                }
                tone="error"
              />
            </div>
            {firstFailed.diff && (
              <Text type="secondary">
                第一处差异在第 {firstFailed.diff.line} 行。
              </Text>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!outcome) {
    return (
      <div className="panel-placeholder">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="点击「运行」执行代码，或用「提交」评测全部测试用例"
        />
      </div>
    );
  }

  // 编译错误
  if (outcome.status === 'compile-error') {
    return (
      <CompileErrorPanel
        code={code}
        diagnostics={outcome.diagnostics}
        onJumpToLine={onJumpToLine}
      />
    );
  }

  const isError = outcome.status !== 'passed';
  const metrics = `编译 ${Math.round(outcome.compileMs)} ms · 运行 ${Math.round(outcome.runMs)} ms`;
  /** 代码里还留着 // TODO，说明用户可能还没动手写 */
  const hasUnfinishedTodo = /\/\/\s*TODO/i.test(code);

  return (
    <div className="output-panel">
      <Alert
        type={isError ? 'error' : 'success'}
        showIcon
        message={
          isError
            ? `${STATUS_TEXT[outcome.status]}：程序没有正常结束`
            : '运行成功（提示：点击「提交」可以评测全部测试用例）'
        }
        description={
          <Space direction="vertical" size={2}>
            {outcome.message && <Text type="danger">{outcome.message}</Text>}
            {outcome.exitCode !== null && outcome.exitCode !== 0 && (
              <Text type="secondary">退出码：{outcome.exitCode}</Text>
            )}
            <Text type="secondary">{metrics}</Text>
          </Space>
        }
      />
      {outcome.stdout && (
        <OutputBlock title="标准输出（stdout）" content={outcome.stdout} />
      )}
      {outcome.stderr && (
        <OutputBlock
          title="标准错误（stderr）"
          content={outcome.stderr}
          tone="error"
        />
      )}
      {!outcome.stdout && !outcome.stderr && !isError && (
        <OutputBlock
          title="标准输出（stdout）"
          content={
            hasUnfinishedTodo
              ? '（程序没有输出任何内容）\n\n代码里还有 // TODO 注释没写——那正是要你动手的地方。\n点工具栏的「写到哪？」按钮，光标会自动跳到那一行。'
              : '（程序没有输出任何内容）'
          }
        />
      )}
      {outcome.diagnostics.trim() && (
        <details className="compiler-warnings">
          <summary>编译器提示（警告信息）</summary>
          <pre className="output-pre">{cleanCompilerOutput(outcome.diagnostics)}</pre>
        </details>
      )}
    </div>
  );
}

function CompileErrorPanel({
  code,
  diagnostics,
  onJumpToLine,
}: {
  code: string;
  diagnostics: string;
  onJumpToLine?: (line: number) => void;
}) {
  const parsed = parseDiagnostics(diagnostics).filter(
    (item) => item.severity === 'error',
  );
  const tips = beginnerTips(code, diagnostics);
  return (
    <div className="output-panel">
      <Alert
        type="error"
        showIcon
        message="编译失败（代码没有通过编译器的检查）"
        description="别担心，这是写代码时最平常的事。先看下面的「自查提示」，再看编译器原文。"
      />
      <BeginnerTipList tips={tips} onJumpToLine={onJumpToLine} />
      {parsed.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="output-block-title">编译器指出的错误（点一下可跳到对应行）</div>
          {parsed.map((item, index) => (
            <div
              key={`${item.line}-${item.column}-${index}`}
              className="diagnostic-line"
              onClick={() => onJumpToLine?.(item.line)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onJumpToLine?.(item.line);
              }}
            >
              <Tag color="error">
                第 {item.line} 行 : {item.column} 列
              </Tag>
              <span>{item.message}</span>
            </div>
          ))}
        </div>
      )}
      <OutputBlock
        title="编译器完整输出"
        content={cleanCompilerOutput(diagnostics) || '（没有更多信息）'}
        tone="error"
      />
    </div>
  );
}
