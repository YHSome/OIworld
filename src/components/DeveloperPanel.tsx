/**
 * 开发者面板（只在开发者模式下显示）。
 *
 * 给题库作者和前端开发者用：
 *  - 一眼看到这道题的元信息与编译参数
 *  - 复制题目 JSON（方便贴到 issue / 快速改题）
 *  - 一键把参考题解填进编辑器（省去手工复制）
 *  - 查看工具链来源、耗时和编译器的原始输出
 */

import { useState } from 'react';
import { Button, Card, Descriptions, Space, Tag, Tooltip, Typography } from 'antd';
import {
  BugOutlined,
  CheckOutlined,
  CopyOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { CompilerStatus, SubmissionResult } from '../compiler/client';
import { COMPILE_FLAGS } from '../compiler/client';
import { cleanCompilerOutput } from '../compiler/diagnostics';
import type { Problem, RunOutcome } from '../types/problem';

const { Text } = Typography;

interface DeveloperPanelProps {
  problem: Problem;
  entryStage: number;
  compilerStatus: CompilerStatus;
  outcome: RunOutcome | null;
  submission: SubmissionResult | null;
  code: string;
  onFillSolution: () => void;
}

const SOURCE_TEXT: Record<CompilerStatus['source'], string> = {
  env: 'VITE_TOOLCHAIN_BASE（自定义）',
  local: '/toolchain（同源静态资源）',
  cdn: 'jsDelivr CDN（browsercc）',
  unknown: '未知',
};

export function DeveloperPanel({
  problem,
  entryStage,
  compilerStatus,
  outcome,
  submission,
  code,
  onFillSolution,
}: DeveloperPanelProps) {
  const [copied, setCopied] = useState<'none' | 'problem' | 'code'>('none');

  const rawDiagnostics = cleanCompilerOutput(
    submission?.diagnostics ?? outcome?.diagnostics ?? '',
  );

  const copy = async (kind: 'problem' | 'code') => {
    const text =
      kind === 'problem'
        ? JSON.stringify(problem, null, 2)
        : problem.solution_code;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied('none'), 1500);
    } catch {
      /* 剪贴板不可用时忽略 */
    }
  };

  const downloadProblem = () => {
    const blob = new Blob([JSON.stringify(problem, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${problem.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      size="small"
      className="developer-panel"
      title={
        <Space>
          <BugOutlined />
          <span>开发者面板</span>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            Ctrl+Shift+D 关闭
          </Text>
        </Space>
      }
      style={{ marginTop: 12 }}
    >
      <Descriptions size="small" column={1} bordered items={[
        {
          key: 'id',
          label: '题目',
          children: (
            <Space wrap>
              <Text code>{problem.id}</Text>
              <Tag>阶段 {entryStage}</Tag>
              <Tag>{problem.difficulty}</Tag>
              <Tag color="geekblue">{problem.knowledge_point}</Tag>
              <Text type="secondary">
                {problem.test_cases.length} 个测试用例 · 代码{' '}
                {code.split('\n').length} 行
              </Text>
            </Space>
          ),
        },
        {
          key: 'flags',
          label: '编译参数',
          children: (
            <Text code style={{ fontSize: 12 }}>
              {COMPILE_FLAGS.join(' ')}
            </Text>
          ),
        },
        {
          key: 'toolchain',
          label: '工具链',
          children: (
            <Space wrap>
              <Text code style={{ fontSize: 12 }}>
                {compilerStatus.base || '（尚未解析）'}
              </Text>
              <Tag>{SOURCE_TEXT[compilerStatus.source]}</Tag>
              {compilerStatus.version && <Tag>v{compilerStatus.version}</Tag>}
              <Tag color={compilerStatus.phase === 'ready' ? 'success' : 'default'}>
                {compilerStatus.phase}
              </Tag>
            </Space>
          ),
        },
        {
          key: 'timing',
          label: '上次耗时',
          children: submission ? (
            <Text type="secondary">
              编译 {Math.round(submission.compileMs)} ms · 评测{' '}
              {submission.total} 个用例：通过 {submission.passed} / 失败{' '}
              {submission.total - submission.passed} · 用例耗时合计{' '}
              {Math.round(
                submission.cases.reduce((sum, item) => sum + item.durationMs, 0),
              )}{' '}
              ms
            </Text>
          ) : outcome ? (
            <Text type="secondary">
              编译 {Math.round(outcome.compileMs)} ms · 运行{' '}
              {Math.round(outcome.runMs)} ms{outcome.exitCode !== null && ` · 退出码 ${outcome.exitCode}`}
            </Text>
          ) : (
            <Text type="secondary">还没有运行记录</Text>
          ),
        },
      ]} />

      <Space wrap style={{ marginTop: 12 }}>
        <Button
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={onFillSolution}
        >
          把参考题解填进编辑器
        </Button>
        <Tooltip title="复制这道题的完整 JSON（可直接改题库）">
          <Button
            size="small"
            icon={copied === 'problem' ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => void copy('problem')}
          >
            复制题目 JSON
          </Button>
        </Tooltip>
        <Tooltip title="复制参考题解代码">
          <Button
            size="small"
            icon={copied === 'code' ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => void copy('code')}
          >
            复制题解代码
          </Button>
        </Tooltip>
        <Button size="small" icon={<DownloadOutlined />} onClick={downloadProblem}>
          下载 {problem.id}.json
        </Button>
      </Space>

      {rawDiagnostics && (
        <details className="compiler-warnings" style={{ marginTop: 12 }}>
          <summary>编译器原始输出（stderr）</summary>
          <pre className="output-pre">{rawDiagnostics}</pre>
        </details>
      )}
    </Card>
  );
}
