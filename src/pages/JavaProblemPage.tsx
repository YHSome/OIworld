/**
 * Java 题目页：与 C++ / Python 靶场完全一致的布局
 * —— 左侧题目描述（含提示 / 题解 / 上下题），右侧编辑器 + 标准输入 / 运行结果 + 测试用例。
 */

import { useEffect, useRef, useState } from 'react';
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
  AimOutlined,
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
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  JAVA_DIFFICULTY_COLOR,
  getJavaNeighbours,
  getJavaProblemEntry,
  getJavaProblemStatus,
  isJavaProblemUnlocked,
} from '../java/data';
import { javaService, type JavaRuntimeStatus } from '../java/service';
import { useJavaProgressStore } from '../java/useJavaProgressStore';
import { JAVA_RUNTIME_LOADING_HINT, JAVA_RUNTIME_TOOLBAR } from '../java/runtimeInfo';
import { useDeveloperMode } from '../hooks/useDeveloperMode';
import { MarkdownView } from '../components/MarkdownView';
import { CodeEditor, type CodeEditorHandle } from '../components/CodeEditor';
import { OutputPanel } from '../components/OutputPanel';
import { TestCasePanel } from '../components/TestCasePanel';
import { LuoguSubmitPanel } from '../components/LuoguSubmitPanel';
import type { SubmissionResult, TestCaseResult } from '../compiler/client';
import type { RunOutcome, TestCase } from '../types/problem';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export function JavaProblemPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { modal, message: messageApi } = AntApp.useApp();

  const entry = getJavaProblemEntry(problemId);
  const problem = entry?.problem ?? null;

  const completed = useJavaProgressStore((state) => state.completedProblems);
  const attempted = useJavaProgressStore((state) => state.attemptedProblems);
  const { markCompleted, markAttempted, setLastVisited, setDraft, clearDraft } =
    useJavaProgressStore();
  const { developerMode } = useDeveloperMode();

  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'run' | 'submit'>('run');
  const [bottomTab, setBottomTab] = useState<'stdin' | 'output'>('output');
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [runtime, setRuntime] = useState<JavaRuntimeStatus>(javaService.getStatus());

  const draftTimer = useRef<number | undefined>(undefined);
  const editorRef = useRef<CodeEditorHandle | null>(null);

  const unlocked = Boolean(
    problem && isJavaProblemUnlocked(problem.id, completed, developerMode),
  );
  const neighbours = problem
    ? getJavaNeighbours(problem.id)
    : { prev: null, next: null };

  useEffect(() => javaService.subscribe(setRuntime), []);

  /** 切换题目时重置页面状态 */
  useEffect(() => {
    if (!problem) return;
    const draft = useJavaProgressStore.getState().drafts[problem.id];
    setCode(draft ?? problem.starter_code);
    setStdin(problem.test_cases[0]?.input ?? '');
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    setBottomTab('output');
    setSolutionVisible(false);
    if (isJavaProblemUnlocked(problem.id, completed, developerMode)) {
      setLastVisited(problem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  /** 进入题目页就预热 Java 运行环境（后台加载，避免第一次运行干等） */
  useEffect(() => {
    if (!unlocked) return;
    void javaService.warmUp().catch(() => undefined);
  }, [unlocked]);

  if (!problem || !entry) {
    return (
      <div className="page">
        <Card>
          <Title level={4}>找不到这道 Java 题目</Title>
          <Link to="/java">返回 Java 靶场</Link>
        </Card>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="page">
        <Card>
          <Space direction="vertical" size={12}>
            <Title level={4} style={{ margin: 0 }}>
              <LockOutlined /> 这道题还没有解锁
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              题目需要按顺序完成：通过上一题，才能解锁本题。
              {neighbours.prev && (
                <>
                  {' '}
                  上一题是：<Text strong>{neighbours.prev.problem.title}</Text>。
                </>
              )}
            </Paragraph>
            <Space wrap>
              {neighbours.prev && (
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() =>
                    navigate(`/java/problem/${neighbours.prev?.problem.id}`)
                  }
                >
                  去做上一题《{neighbours.prev.problem.title}》
                </Button>
              )}
              <Button onClick={() => navigate('/java')}>回到 Java 靶场</Button>
              <Button onClick={() => navigate('/java/guide')}>看 Java 指南</Button>
            </Space>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              开发者需要直接查看本题时，可在地址栏加 <Text code>?dev=1</Text>，
              或按 <Text code>Ctrl + Shift + D</Text>。
            </Paragraph>
          </Space>
        </Card>
      </div>
    );
  }

  const status = getJavaProblemStatus(problem.id, completed, attempted);

  const onCodeChange = (value: string) => {
    setCode(value);
    window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => setDraft(problem.id, value), 500);
  };

  const run = async () => {
    setBusy(true);
    setMode('run');
    setSubmission(null);
    setResults(null);
    try {
      const result = await javaService.runOnce(code, stdin);
      setOutcome(result);
      setBottomTab('output');
    } catch (error) {
      messageApi.error(
        `运行失败：${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const evaluate = async (official: boolean) => {
    setBusy(true);
    setMode(official ? 'submit' : 'run');
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    try {
      const result = await javaService.submit(code, problem.test_cases, (item) =>
        setResults((previous) => {
          const next = previous ? [...previous] : [];
          next[item.index] = item;
          return next;
        }),
      );
      setSubmission(result);
      setResults(result.cases);
      setBottomTab('output');

      if (result.compileOk && result.passed === result.total && result.total > 0) {
        const first = !completed.includes(problem.id);
        markCompleted(problem.id);
        if (first) {
          modal.success({
            title: '恭喜通过！🎉',
            content: (
              <Paragraph style={{ marginBottom: 0 }}>
                你用 {result.total} 个测试用例全部通过了《{problem.title}》。
              </Paragraph>
            ),
            okText: neighbours.next ? '去做下一题' : '好的',
            cancelText: '留在本题',
            onOk: () => {
              if (neighbours.next) {
                navigate(`/java/problem/${neighbours.next.problem.id}`);
              }
            },
          });
        }
      } else if (result.compileOk) {
        markAttempted(problem.id);
      }
    } catch (error) {
      messageApi.error(
        `评测失败：${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  const reset = () =>
    modal.confirm({
      title: '重置为初始代码？',
      content: '你在本题中修改的代码会被清空。',
      okText: '重置',
      cancelText: '取消',
      onOk: () => {
        setCode(problem.starter_code);
        clearDraft(problem.id);
        setOutcome(null);
        setSubmission(null);
        setResults(null);
      },
    });

  const useCase = (testCase: TestCase) => {
    setStdin(testCase.input);
    setBottomTab('stdin');
    messageApi.success('已填入该用例的输入');
  };

  const jumpTodo = () => {
    const found = editorRef.current?.jumpToFirstTodo();
    messageApi.info(
      found ? '光标已跳到 TODO，代码写在这里。' : '代码里没有 TODO，请按题目说明修改。',
    );
  };

  /** 开发者模式：把参考题解直接放进编辑器（用于快速验证题目与判题数据） */
  const fillSolution = () => {
    setCode(problem.solution_code);
    setDraft(problem.id, problem.solution_code);
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    messageApi.success('已填入参考题解，点「提交」即可验证这道题');
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
            message="第一次写 Java？先看 Java 新手指南"
            description={
              <Button
                size="small"
                type="primary"
                style={{ marginTop: 8 }}
                onClick={() => navigate('/java/guide')}
              >
                打开 Java 指南
              </Button>
            }
          />
        )}

        <Card variant="borderless" className="problem-desc-card">
          <Space wrap size={6} style={{ marginBottom: 8 }}>
            <Tag color={JAVA_DIFFICULTY_COLOR[problem.difficulty]}>
              {problem.difficulty}
            </Tag>
            <Tag color="orange">{problem.knowledge_point}</Tag>
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
              disabled={status !== 'passed' && !developerMode}
              onClick={() => setSolutionVisible(true)}
            >
              {status === 'passed' || developerMode
                ? '查看参考题解'
                : '通过本题后可查看参考题解'}
            </Button>
            {developerMode && (
              <Button
                block
                style={{ marginTop: 8 }}
                icon={<ExperimentOutlined />}
                onClick={fillSolution}
              >
                填入参考题解并评测（开发者）
              </Button>
            )}
          </div>

          <Divider style={{ margin: '16px 0 12px' }} />
          <LuoguSubmitPanel
            problemId={problem.id}
            defaultPid={problem.luogu_code}
            code={code}
            track="java"
            disabled={!unlocked}
            disabledReason="通过本题（或开启开发者模式）后即可提交到洛谷"
          />

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              disabled={!neighbours.prev}
              onClick={() =>
                neighbours.prev &&
                navigate(`/java/problem/${neighbours.prev.problem.id}`)
              }
            >
              上一题
            </Button>
            <Button
              type="primary"
              disabled={!neighbours.next}
              onClick={() =>
                neighbours.next &&
                navigate(`/java/problem/${neighbours.next.problem.id}`)
              }
            >
              下一题
              <ArrowRightOutlined />
            </Button>
          </Space>
        </Card>
      </div>

      {/* ---------------- 右侧：代码编辑与运行 ---------------- */}
      <div className="problem-right">
        <Alert
          type={
            runtime.phase === 'failed'
              ? 'error'
              : runtime.phase === 'ready'
                ? 'success'
                : 'info'
          }
          showIcon
          style={{ marginBottom: 12 }}
          message={runtime.message}
          description={
            runtime.phase === 'ready' || runtime.phase === 'failed'
              ? undefined
              : JAVA_RUNTIME_LOADING_HINT
          }
        />

        <Card variant="borderless" styles={{ body: { padding: 12 } }}>
          <Space
            className="editor-toolbar"
            style={{ width: '100%', justifyContent: 'space-between' }}
            wrap
          >
            <Space>
              <Tag icon={<CodeOutlined />} color="orange">
                Java 8
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {JAVA_RUNTIME_TOOLBAR}
              </Text>
            </Space>
            <Space>
              <Tooltip title="把光标移动到 // TODO 那一行">
                <Button icon={<AimOutlined />} onClick={jumpTodo} disabled={busy}>
                  写到哪？
                </Button>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={reset} disabled={busy}>
                重置代码
              </Button>
              <Button
                icon={<PlayCircleOutlined />}
                onClick={run}
                loading={busy && mode === 'run' && !submission}
                disabled={busy}
              >
                运行
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => evaluate(true)}
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
              language="java"
              value={code}
              onChange={onCodeChange}
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
                style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
              />
              <Space style={{ marginTop: 8 }} wrap>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  每个测试用例的输入都可以一键填入：
                </Text>
                {problem.test_cases.map((testCase, index) => (
                  <Button key={index} size="small" onClick={() => useCase(testCase)}>
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
              language="java"
              onJumpToLine={(line) => editorRef.current?.jumpToLine(line)}
            />
          )}
        </Card>

        <Card variant="borderless" styles={{ body: { padding: 12 } }} style={{ marginTop: 12 }}>
          <TestCasePanel
            testCases={problem.test_cases}
            results={results}
            running={busy}
            onRunAll={() => evaluate(false)}
            onUseAsInput={useCase}
          />
        </Card>

        <Alert
          type="info"
          showIcon
          icon={<ExperimentOutlined />}
          style={{ marginTop: 12 }}
          message="小提示"
          description="「运行」只用标准输入框里的数据跑一次；「提交」会评测本题的全部测试用例，全部通过才算完成并解锁下一题。"
        />
      </div>

      <Modal
        open={solutionVisible}
        title={`参考题解 · ${problem.title}`}
        footer={null}
        width={720}
        onCancel={() => setSolutionVisible(false)}
      >
        <Paragraph type="secondary">
          先自己试一试；看懂答案后，再不看答案重写一遍。
        </Paragraph>
        <pre className="output-pre solution-pre">{problem.solution_code}</pre>
      </Modal>
    </div>
  );
}
