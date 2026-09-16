/**
 * 题目详情页（核心页面）：左侧题目描述，右侧代码编辑 + 运行 + 评测。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  Divider,
  Input,
  Modal,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  CodeOutlined,
  ExperimentOutlined,
  LockOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  ReloadOutlined,
  SendOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DIFFICULTY_COLOR,
  getNeighbours,
  getProblemEntry,
  getProblemStatus,
  isProblemUnlocked,
} from '../data';
import { useProgressStore } from '../store/useProgressStore';
import { MarkdownView } from '../components/MarkdownView';
import { CodeEditor, type CodeEditorHandle } from '../components/CodeEditor';
import { OutputPanel } from '../components/OutputPanel';
import { TestCasePanel } from '../components/TestCasePanel';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { ToolchainAlert } from '../components/ToolchainAlert';
import { compilerService, type SubmissionResult, type TestCaseResult } from '../compiler/client';
import { parseDiagnostics, type Diagnostic } from '../compiler/diagnostics';
import { useCompilerStatus, warmUpCompiler } from '../hooks/useCompiler';
import { useDeveloperMode } from '../hooks/useDeveloperMode';
import type { RunOutcome, TestCase } from '../types/problem';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export function ProblemPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  // 使用 App 上下文里的 message / modal，才能正确继承主题与国际化配置
  const { message: messageApi, modal } = AntApp.useApp();
  const entry = getProblemEntry(problemId);
  const problem = entry?.problem ?? null;

  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);
  const setDraft = useProgressStore((state) => state.setDraft);
  const clearDraft = useProgressStore((state) => state.clearDraft);
  const markCompleted = useProgressStore((state) => state.markCompleted);
  const markAttempted = useProgressStore((state) => state.markAttempted);
  const setLastVisited = useProgressStore((state) => state.setLastVisited);
  // 开发者模式：解锁全部题目、可直接看题解、显示调试面板
  const { developerMode } = useDeveloperMode();

  const compilerStatus = useCompilerStatus();

  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'run' | 'submit'>('run');
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [bottomTab, setBottomTab] = useState<'stdin' | 'output'>('output');

  const draftTimer = useRef<number | undefined>(undefined);
  const editorRef = useRef<CodeEditorHandle | null>(null);

  const previous = entry ? getNeighbours(entry.problem.id).prev : null;
  const next = entry ? getNeighbours(entry.problem.id).next : null;

  const unlocked = useMemo(
    () =>
      problem
        ? isProblemUnlocked(problem.id, completed, developerMode)
        : false,
    [problem, completed, developerMode],
  );

  /** 切换题目时重置状态 */
  useEffect(() => {
    if (!problem) return;
    const draft = useProgressStore.getState().drafts[problem.id];
    setCode(draft ?? problem.starter_code);
    setStdin(problem.test_cases[0]?.input ?? '');
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    setDiagnostics([]);
    setSolutionVisible(false);
    setBottomTab('output');
    if (isProblemUnlocked(problem.id, completed, developerMode)) {
      setLastVisited(problem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  /** 进入页面就预热编译器（后台下载 clang/lld） */
  useEffect(() => {
    if (!unlocked) return;
    void warmUpCompiler().catch(() => {
      /* 错误已经记录在 compilerService 的状态里 */
    });
  }, [unlocked]);

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      if (!problem) return;
      window.clearTimeout(draftTimer.current);
      draftTimer.current = window.setTimeout(() => {
        setDraft(problem.id, value);
      }, 600);
    },
    [problem, setDraft],
  );

  if (!problem || !entry) {
    return (
      <div className="page">
        <Card>
          <Title level={4}>找不到这道题目</Title>
          <Link to="/">返回首页</Link>
        </Card>
      </div>
    );
  }

  if (!unlocked) {
    const previousProblem = previous?.problem;
    return (
      <div className="page">
        <Card>
          <Space direction="vertical" size={12}>
            <Title level={4} style={{ margin: 0 }}>
              <LockOutlined /> 这道题还没有解锁
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              题目需要按顺序完成：通过上一题，才能解锁本题。
              {previousProblem && (
                <>
                  {' '}
                  上一题是：<Text strong>{previousProblem.title}</Text>。
                </>
              )}
            </Paragraph>
            <Space wrap>
              {previousProblem && (
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(`/problem/${previousProblem.id}`)}
                >
                  去做上一题《{previousProblem.title}》
                </Button>
              )}
              <Button onClick={() => navigate('/')}>回到题目列表</Button>
              <Button onClick={() => navigate('/guide')}>看新手指南</Button>
            </Space>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              题库作者 / 开发者需要直接查看本题时，可开启开发者模式：
              在地址栏加 <Text code>?dev=1</Text>，或按{' '}
              <Text code>Ctrl + Shift + D</Text>。
            </Paragraph>
          </Space>
        </Card>
      </div>
    );
  }

  const status = getProblemStatus(problem.id, completed, attempted);

  const handleRun = async () => {
    setBusy(true);
    setMode('run');
    setSubmission(null);
    setResults(null);
    try {
      const result = await compilerService.runOnce(code, stdin);
      setOutcome(result);
      setDiagnostics(parseDiagnostics(result.diagnostics));
      setBottomTab('output');
    } catch (error) {
      messageApi.error(
        `运行失败：${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const evaluateAll = async (official: boolean) => {
    setBusy(true);
    setMode(official ? 'submit' : 'run');
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    try {
      const result = await compilerService.submit(
        code,
        problem.test_cases,
        {},
        (caseResult) => {
          setResults((prev) => {
            const list = prev ? [...prev] : [];
            list[caseResult.index] = caseResult;
            return list;
          });
        },
      );
      setSubmission(result);
      setResults(result.cases);
      setDiagnostics(parseDiagnostics(result.diagnostics));
      setBottomTab('output');

      if (result.compileOk) {
        if (result.passed === result.total && result.total > 0) {
          const firstTime = !completed.includes(problem.id);
          markCompleted(problem.id);
          if (firstTime) {
            modal.success({
              title: '恭喜通过！🎉',
              content: (
                <div>
                  <Paragraph style={{ marginBottom: 8 }}>
                    你用 {result.total} 个测试用例全部通过了
                    《{problem.title}》。
                  </Paragraph>
                  {next ? (
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      下一题：《{next.problem.title}》
                    </Paragraph>
                  ) : (
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      你已经完成了全部题目，太厉害了！
                    </Paragraph>
                  )}
                </div>
              ),
              okText: next ? '去做下一题' : '好的',
              cancelText: '留在本题',
              onOk: () => {
                if (next) navigate(`/problem/${next.problem.id}`);
              },
            });
          }
        } else {
          markAttempted(problem.id);
        }
      }
    } catch (error) {
      messageApi.error(
        `评测失败：${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    modal.confirm({
      title: '重置为初始代码？',
      content: '你在本题中修改的代码会被清空，此操作不可撤销。',
      okText: '重置',
      cancelText: '取消',
      onOk: () => {
        setCode(problem.starter_code);
        clearDraft(problem.id);
        setOutcome(null);
        setSubmission(null);
        setResults(null);
        setDiagnostics([]);
      },
    });
  };

  const useCaseAsInput = (testCase: TestCase) => {
    setStdin(testCase.input);
    setBottomTab('stdin');
    messageApi.success('已把该用例的输入填入标准输入框');
  };

  return (
    <div className="problem-page">
      {/* ---------------- 左侧：题目描述 ---------------- */}
      <div className="problem-left">
        {(entry.stage.stage === 1 || completed.length === 0) && (
          <Alert
            type="info"
            showIcon
            closable
            icon={<ReadOutlined />}
            style={{ marginBottom: 12 }}
            message="第一次写代码？先花 10 分钟看「新手指南 · 第零课」"
            description={
              <Space direction="vertical" size={6}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  里面讲清楚了：代码为什么长这样、每个符号是什么意思、报错怎么读、
                  以及中文标点这个最大的坑。
                </Text>
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    icon={<ReadOutlined />}
                    onClick={() => navigate('/guide')}
                  >
                    打开新手指南
                  </Button>
                  <Button
                    size="small"
                    icon={<AimOutlined />}
                    onClick={() => {
                      const found = editorRef.current?.jumpToFirstTodo();
                      messageApi.info(
                        found
                          ? '光标已跳到 TODO 那一行，把代码写在这里'
                          : '这段代码里没有 TODO 标记，请按题目说明修改',
                      );
                    }}
                  >
                    光标跳到该写代码的地方
                  </Button>
                </Space>
              </Space>
            }
          />
        )}

        <Card variant="borderless" className="problem-desc-card">
          <Space wrap size={6} style={{ marginBottom: 8 }}>
            <Tag color={DIFFICULTY_COLOR[problem.difficulty]}>
              {problem.difficulty}
            </Tag>
            <Tag color="geekblue">{problem.knowledge_point}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {problem.id}
            </Text>
          </Space>
          <Title level={3} style={{ marginTop: 4 }}>
            {problem.title}
          </Title>
          <Divider style={{ margin: '12px 0' }} />
          <MarkdownView content={problem.description} />

          {problem.hints.length > 0 && (
            <Collapse
              ghost
              style={{ marginTop: 16 }}
              items={[
                {
                  key: 'hints',
                  label: (
                    <Space>
                      <BulbOutlined style={{ color: '#faad14' }} />
                      <Text strong>提示（想不出来再看）</Text>
                    </Space>
                  ),
                  children: (
                    <div className="markdown-body">
                      <ul>
                        {problem.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
              ]}
            />
          )}

          <div style={{ marginTop: 16 }}>
            <Button
              block
              icon={<CodeOutlined />}
              onClick={() => setSolutionVisible(true)}
              disabled={status !== 'passed' && !developerMode}
            >
              {status === 'passed' || developerMode
                ? '查看参考题解'
                : '通过本题后可查看参考题解'}
            </Button>
          </div>

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              disabled={!previous}
              onClick={() => previous && navigate(`/problem/${previous.problem.id}`)}
            >
              上一题
            </Button>
            <Button
              type="primary"
              disabled={!next}
              onClick={() => next && navigate(`/problem/${next.problem.id}`)}
            >
              下一题
              <ArrowRightOutlined />
            </Button>
          </Space>
          {previous && (
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
              上一题：《{previous.problem.title}》
            </Paragraph>
          )}
          {next && (
            <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
              下一题：《{next.problem.title}》
            </Paragraph>
          )}
        </Card>
      </div>

      {/* ---------------- 右侧：代码编辑与运行 ---------------- */}
      <div className="problem-right">
        <ToolchainAlert
          status={compilerStatus}
          onRetry={() => {
            void warmUpCompiler().catch(() => undefined);
          }}
        />

        <Card variant="borderless" styles={{ body: { padding: 12 } }}>
          <Space
            className="editor-toolbar"
            style={{ width: '100%', justifyContent: 'space-between' }}
            wrap
          >
            <Space size={8}>
              <Tag icon={<CodeOutlined />}>C++ 20</Tag>
              <Tooltip title="编译参数固定为 -std=c++20 -O0 -Wall，在浏览器本地编译">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  clang → WebAssembly
                </Text>
              </Tooltip>
            </Space>
            <Space>
              <Tooltip title="把光标移动到 // TODO 那一行（不知道该在哪写代码时点它）">
                <Button
                  icon={<AimOutlined />}
                  onClick={() => {
                    const found = editorRef.current?.jumpToFirstTodo();
                    messageApi.info(
                      found
                        ? '光标已跳到 TODO 那一行，把代码写在这里'
                        : '这段代码里没有 TODO 标记，请按题目说明修改',
                    );
                  }}
                  disabled={busy}
                >
                  写到哪？
                </Button>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={busy}>
                重置代码
              </Button>
              <Button
                icon={<PlayCircleOutlined />}
                onClick={handleRun}
                loading={busy && mode === 'run' && !submission}
                disabled={busy}
              >
                运行
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => evaluateAll(true)}
                loading={busy && mode === 'submit'}
                disabled={busy}
              >
                提交
              </Button>
            </Space>
          </Space>

          <div className="editor-wrapper">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              diagnostics={diagnostics}
              height={400}
            />
          </div>
        </Card>

        <Card variant="borderless" styles={{ body: { padding: 12 } }} style={{ marginTop: 12 }}>
          <Segmented
            value={bottomTab}
            onChange={(value) => setBottomTab(value as 'stdin' | 'output')}
            options={[
              { value: 'stdin', label: '标准输入 (stdin)' },
              { value: 'output', label: '运行结果' },
            ]}
            style={{ marginBottom: 8 }}
          />
          {bottomTab === 'stdin' ? (
            <div>
              <TextArea
                value={stdin}
                onChange={(event) => setStdin(event.target.value)}
                rows={7}
                placeholder="在这里输入程序的测试数据（相当于键盘输入）"
                style={{
                  fontFamily: 'Consolas, "Courier New", monospace',
                  fontSize: 13,
                }}
              />
              <Space style={{ marginTop: 8 }} wrap>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  每个测试用例的输入都可以一键填入：
                </Text>
                {problem.test_cases.map((testCase, index) => (
                  <Button
                    key={index}
                    size="small"
                    onClick={() => useCaseAsInput(testCase)}
                  >
                    样例 {index + 1}
                  </Button>
                ))}
              </Space>
            </div>
          ) : (
            <OutputPanel
              outcome={outcome}
              submission={submission}
              busy={busy}
              mode={mode}
              code={code}
              onJumpToLine={(line) => editorRef.current?.jumpToLine(line)}
            />
          )}
        </Card>

        <Card variant="borderless" styles={{ body: { padding: 12 } }} style={{ marginTop: 12 }}>
          <TestCasePanel
            testCases={problem.test_cases}
            results={results}
            running={busy}
            onRunAll={() => evaluateAll(false)}
            onUseAsInput={useCaseAsInput}
          />
        </Card>

        <Alert
          type="info"
          showIcon
          icon={<ExperimentOutlined />}
          style={{ marginTop: 12 }}
          message="小提示"
          description={
            <Text type="secondary" style={{ fontSize: 12 }}>
              「运行」只用标准输入框里的数据跑一次，适合边写边试；
              「提交」会把这道题的全部测试用例依次跑一遍并逐个比对输出，
              全部通过才算完成。评测会忽略每行行尾的多余空格和末尾空行。
            </Text>
          }
        />

        {developerMode && (
          <DeveloperPanel
            problem={problem}
            entryStage={entry.stage.stage}
            compilerStatus={compilerStatus}
            outcome={outcome}
            submission={submission}
            code={code}
            onFillSolution={() => {
              setCode(problem.solution_code);
              setDraft(problem.id, problem.solution_code);
              setOutcome(null);
              setSubmission(null);
              setResults(null);
              setDiagnostics([]);
              messageApi.success('已把参考题解填入编辑器');
            }}
          />
        )}
      </div>

      <Modal
        open={solutionVisible}
        title={`参考题解 · ${problem.title}`}
        footer={null}
        width={720}
        onCancel={() => setSolutionVisible(false)}
      >
        <Paragraph type="secondary">
          建议先自己写出来再看答案；看懂之后，试着不看答案重写一遍。
        </Paragraph>
        <pre className="output-pre solution-pre">{problem.solution_code}</pre>
      </Modal>
    </div>
  );
}
