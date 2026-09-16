/**
 * 测试用例面板：列出这道题的全部测试用例，展示每个用例的通过状态，
 * 并支持把某个用例的输入一键填进「标准输入」框。
 */

import { Button, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { ExperimentOutlined, ImportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TestCase } from '../types/problem';
import type { TestCaseResult } from '../compiler/client';

const { Text, Paragraph } = Typography;

interface TestCasePanelProps {
  testCases: TestCase[];
  results: TestCaseResult[] | null;
  /** 是否正在评测 */
  running: boolean;
  onRunAll: () => void;
  onUseAsInput: (testCase: TestCase) => void;
}

interface Row extends TestCase {
  index: number;
  result?: TestCaseResult;
}

const PREVIEW_LENGTH = 60;

function preview(text: string): string {
  const normalized = text.replace(/\n/g, '⏎');
  if (normalized.length <= PREVIEW_LENGTH) return normalized || '（空）';
  return `${normalized.slice(0, PREVIEW_LENGTH)}…`;
}

function StatusCell({ result }: { result?: TestCaseResult }) {
  if (!result) return <Tag>未运行</Tag>;
  switch (result.status) {
    case 'passed':
      return <Tag color="success">通过</Tag>;
    case 'wrong-answer':
      return <Tag color="error">答案错误</Tag>;
    case 'runtime-error':
      return <Tag color="error">运行错误</Tag>;
    case 'timeout':
      return <Tag color="error">超时</Tag>;
    case 'output-limit':
      return <Tag color="error">输出过多</Tag>;
    case 'compile-error':
      return <Tag color="error">编译错误</Tag>;
    default:
      return <Tag color="error">未通过</Tag>;
  }
}

export function TestCasePanel({
  testCases,
  results,
  running,
  onRunAll,
  onUseAsInput,
}: TestCasePanelProps) {
  const rows: Row[] = testCases.map((testCase, index) => ({
    ...testCase,
    index,
    result: results?.[index],
  }));

  const columns: ColumnsType<Row> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 52,
      render: (value: number) => value + 1,
    },
    {
      title: '输入',
      dataIndex: 'input',
      render: (value: string, row) => (
        <Space size={4}>
          <Text code style={{ fontSize: 12 }}>
            {preview(value)}
          </Text>
          <Tooltip title="把这个用例的输入填到标准输入框">
            <Button
              size="small"
              type="text"
              icon={<ImportOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                onUseAsInput(row);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '期望输出',
      dataIndex: 'expected_output',
      render: (value: string) => (
        <Text code style={{ fontSize: 12 }}>
          {preview(value)}
        </Text>
      ),
    },
    {
      title: '实际输出',
      render: (_, row) => (
        <Text
          code
          style={{ fontSize: 12 }}
          type={row.result && row.result.status !== 'passed' ? 'danger' : undefined}
        >
          {row.result ? preview(row.result.stdout || row.result.stderr || '（空）') : '—'}
        </Text>
      ),
    },
    {
      title: '结果',
      width: 110,
      render: (_, row) => <StatusCell result={row.result} />,
    },
  ];

  return (
    <div className="testcase-panel">
      <div className="testcase-header">
        <Space>
          <Text strong>测试用例（共 {testCases.length} 个）</Text>
          {results && (
            <Tag color={results.every((r) => r.status === 'passed') ? 'success' : 'error'}>
              通过 {results.filter((r) => r.status === 'passed').length}/{results.length}
            </Tag>
          )}
        </Space>
        <Button
          icon={<ExperimentOutlined />}
          onClick={onRunAll}
          loading={running}
          disabled={running}
        >
          运行全部测试
        </Button>
      </div>
      <Table<Row>
        rowKey="index"
        size="small"
        columns={columns}
        dataSource={rows}
        pagination={false}
        expandable={{
          expandedRowRender: (row) => (
            <div className="case-detail">
              <div>
                <Text strong>输入</Text>
                <pre className="output-pre">{row.input || '（无输入）'}</pre>
              </div>
              <div>
                <Text strong>期望输出</Text>
                <pre className="output-pre">{row.expected_output}</pre>
              </div>
              {row.result && (
                <div>
                  <Text strong>实际输出</Text>
                  <pre className="output-pre output-pre-error">
                    {row.result.stdout || '（无输出）'}
                  </pre>
                  {row.result.stderr && (
                    <>
                      <Text strong>错误输出</Text>
                      <pre className="output-pre output-pre-error">{row.result.stderr}</pre>
                    </>
                  )}
                  {row.result.message && (
                    <Paragraph type="danger" style={{ marginBottom: 0 }}>
                      {row.result.message}
                    </Paragraph>
                  )}
                </div>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
}
