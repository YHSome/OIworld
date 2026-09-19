/**
 * Pro 题目页（数据结构与进阶算法）。
 *
 * 这一页有意做成"两条路"：
 *
 *  1. **本地小样例自查（可选）**：点「运行」或「小样例自查」时才会下载约 90MB 的
 *     clang-wasm 工具链，用**本站自撰的小样例**跑一遍，帮你确认代码没写错。
 *     它**不**决定这题是否通过 —— 那些样例不是洛谷的数据。
 *  2. **书签提交（真正的判题）**：把代码交到洛谷评测。评测结果由书签显示在洛谷页面上，
 *     并会**带回本站**（`?luoguResult=<base64>`）：本站读到 AC 就自动把本题标记为通过、
 *     解锁下一题；也可以自己点「我已在洛谷 AC · 标记本题通过」。
 *
 * 直接好处：打开 Pro 题目页不再下载任何编译器，只有你主动要自查时才下载。
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
  Popconfirm,
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
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  CopyOutlined,
  ExperimentOutlined,
  LinkOutlined,
  LockOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  PRO_DIFFICULTY_COLOR,
  getProNeighbours,
  getProProblemEntry,
  getProProblemStatus,
  isProProblemUnlocked,
} from '../pro/data';
import { useProProgressStore } from '../pro/useProProgressStore';
import { useDeveloperMode } from '../hooks/useDeveloperMode';
import { MarkdownView } from '../components/MarkdownView';
import { CodeEditor, type CodeEditorHandle } from '../components/CodeEditor';
import { OutputPanel } from '../components/OutputPanel';
import { TestCasePanel } from '../components/TestCasePanel';
import { ToolchainAlert } from '../components/ToolchainAlert';
import { LuoguSubmitPanel } from '../components/LuoguSubmitPanel';
import {
  compilerService,
  type SubmissionResult,
  type TestCaseResult,
} from '../compiler/client';
import { parseDiagnostics, type Diagnostic } from '../compiler/diagnostics';
import { useCompilerStatus, warmUpCompiler } from '../hooks/useCompiler';
import { getLuoguStatus } from '../luogu/verdict';
import { isLuoguResultPassed } from '../luogu/bookmarklet';
import { useLuoguResultStore } from '../luogu/useLuoguResult';
import type { RunOutcome, TestCase } from '../types/problem';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export function ProProblemPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { message: messageApi, modal } = AntApp.useApp();

  const entry = getProProblemEntry(problemId);
  const problem = entry?.problem ?? null;

  const completed = useProProgressStore((state) => state.completedProblems);
  const attempted = useProProgressStore((state) => state.attemptedProblems);
  const setDraft = useProProgressStore((state) => state.setDraft);
  const clearDraft = useProProgressStore((state) => state.clearDraft);
  const markCompleted = useProProgressStore((state) => state.markCompleted);
  const markAttempted = useProProgressStore((state) => state.markAttempted);
  const setLastVisited = useProProgressStore((state) => state.setLastVisited);
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
  /** 本地自查面板是否展开（也是"要不要加载编译器"的开关） */
  const [selfCheckOpen, setSelfCheckOpen] = useState(false);

  const draftTimer = useRef<number | undefined>(undefined);
  const editorRef = useRef<CodeEditorHandle | null>(null);

  const previous = entry ? getProNeighbours(entry.problem.id).prev : null;
  const next = entry ? getProNeighbours(entry.problem.id).next : null;

  const unlocked = useMemo(
    () => (problem ? isProProblemUnlocked(problem.id, completed, developerMode) : false),
    [problem, completed, developerMode],
  );

  /** 切换题目时重置页面状态 */
  useEffect(() => {
    if (!problem) return;
    const draft = useProProgressStore.getState().drafts[problem.id];
    setCode(draft ?? problem.starter_code);
    setStdin(problem.test_cases[0]?.input ?? '');
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    setDiagnostics([]);
    setSolutionVisible(false);
    setBottomTab('output');
    if (isProProblemUnlocked(problem.id, completed, developerMode)) {
      setLastVisited(problem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  /* ---------------- 本地小样例自查（可选） ---------------- */

  const ensureCompiler = () => {
    setSelfCheckOpen(true);
    return warmUpCompiler().catch(() => undefined);
  };

  const handleRun = async () => {
    setBusy(true);
    setMode('run');
    setSubmission(null);
    setResults(null);
    await ensureCompiler();
    try {
      const result = await compilerService.runOnce(code, stdin);
      setOutcome(result);
      setDiagnostics(parseDiagnostics(result.diagnostics));
      setBottomTab('output');
    } catch (error) {
      messageApi.error(`运行失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  /** 用本站自撰的小样例自查：**不**代表洛谷通过，只是帮你排除低级错误 */
  const handleSelfCheck = async () => {
    if (!problem) return;
    setBusy(true);
    setMode('submit');
    setOutcome(null);
    setSubmission(null);
    setResults(null);
    await ensureCompiler();
    try {
      const result = await compilerService.submit(code, problem.test_cases, {}, (caseResult) => {
        setResults((prev) => {
          const list = prev ? [...prev] : [];
          list[caseResult.index] = caseResult;
          return list;
        });
      });
      setSubmission(result);
      setResults(result.cases);
      setDiagnostics(parseDiagnostics(result.diagnostics));
      setBottomTab('output');

      if (!result.compileOk) {
        messageApi.error('编译没通过，先看输出面板里的报错');
        return;
      }
      markAttempted(problem.id);
      if (result.passed === result.total && result.total > 0) {
        messageApi.success(
          `小样例 ${result.passed}/${result.total} 全过 —— 但这只是本站自撰的小数据，请用「书签提交」交给洛谷评测`,
          6,
        );
      } else {
        messageApi.warning(`小样例通过 ${result.passed}/${result.total}，先修一修再交洛谷`);
      }
    } catch (error) {
      messageApi.error(`自查失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const useCaseAsInput = (testCase: TestCase) => {
    setStdin(testCase.input);
    setBottomTab('stdin');
    setSelfCheckOpen(true);
  };

  /* ---------------- 洛谷结果与进度 ---------------- */

  /**
   * 书签回传的结果（`?luoguResult=`，由题目页里的提交面板统一解析）：
   * AC 或历史分数满分即视为通过。只在"这道题"的结果上动作，避免切题时误判。
   */
  const luoguResult = useLuoguResultStore((state) => state.lastResult);

  useEffect(() => {
    if (!luoguResult || !problem) return;
    if (luoguResult.problemId && luoguResult.problemId !== problem.id) return;
    const meta = getLuoguStatus(luoguResult.status);
    if (isLuoguResultPassed(luoguResult)) {
      const firstTime = !useProProgressStore
        .getState()
        .completedProblems.includes(problem.id);
      markCompleted(problem.id);
      if (firstTime) {
        modal.success({
          title: '洛谷评测通过！🎉',
          content: (
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                《{problem.title}》在洛谷拿到了 <Text strong>AC</Text>
                {typeof luoguResult.score === 'number' ? `（${luoguResult.score} 分）` : ''}
                {luoguResult.time ? `，用时 ${luoguResult.time} ms` : ''}
                {luoguResult.memory ? `、内存 ${(luoguResult.memory / 1024).toFixed(2)} MB` : ''}。
              </Paragraph>
              {next ? (
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  下一题：《{next.problem.title}》
                </Paragraph>
              ) : (
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  你已经完成了 Pro 靶场的全部题目，太厉害了！
                </Paragraph>
              )}
            </div>
          ),
          okText: next ? '去做下一题' : '好的',
          cancelText: '留在本题',
          onOk: () => {
            if (next) navigate(`/pro/problem/${next.problem.id}`);
          },
        });
      } else {
        messageApi.success('洛谷评测通过，本题已标记为完成');
      }
      return;
    }
    markAttempted(problem.id);
    messageApi.info(`洛谷评测结果：${meta.short}（${meta.label}），本题记作"未通过"`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [luoguResult?.rid]);

  /** 点了「书签提交」：记为"已提交" */
  const handleOpenLuogu = useCallback(() => {
    if (!problem) return;
    markAttempted(problem.id);
  }, [problem, markAttempted]);

  /** 兜底：用户在洛谷确认 AC 后手动标记 */
  const handleMarkPassed = () => {
    if (!problem) return;
    const firstTime = !useProProgressStore.getState().completedProblems.includes(problem.id);
    markCompleted(problem.id);
    if (firstTime) {
      modal.success({
        title: '本题已标记为通过 🎉',
        content: (
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              你在洛谷通过了《{problem.title}》（
              <Text code>{problem.luogu_code || '洛谷对应题目'}</Text>）。
            </Paragraph>
            {next ? (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                下一题：《{next.problem.title}》
              </Paragraph>
            ) : (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                你已经完成了 Pro 靶场的全部题目，太厉害了！
              </Paragraph>
            )}
          </div>
        ),
        okText: next ? '去做下一题' : '好的',
        cancelText: '留在本题',
        onOk: () => {
          if (next) navigate(`/pro/problem/${next.problem.id}`);
        },
      });
    } else {
      messageApi.success('已标记为通过');
    }
  };

  /* ---------------- 编辑器相关 ---------------- */

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

  const handleReset = () => {
    if (!problem) return;
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
        setDiagnostics([]);
      },
    });
  };

  const jumpTodo = () => {
    const found = editorRef.current?.jumpToFirstTodo();
    messageApi.info(
      found ? '光标已跳到 TODO 那一行，把代码写在这里' : '代码里没有 TODO 标记，请按题目说明修改',
    );
  };

  const fillSolution = () => {
    if (!problem) return;
    setCode(problem.solution_code);
    setDraft(problem.id, problem.solution_code);
    messageApi.success('已填入参考题解');
  };

  const copyProblemJson = async () => {
    if (!problem) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(problem, null, 2));
      messageApi.success('题目 JSON 已复制');
    } catch {
      messageApi.warning('浏览器不允许自动复制');
    }
  };

  if (!problem || !entry) {
    return (
      <div className="page">
        <Card>
          <Title level={4}>找不到这道 Pro 题目</Title>
          <Link to="/pro">返回 Pro 靶场</Link>
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
              题目需要按顺序完成：<Text strong>上一题在洛谷拿到 AC</Text>，才能解锁本题。
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
                  onClick={() => navigate(`/pro/problem/${previousProblem.id}`)}
                >
                  去做上一题《{previousProblem.title}》
                </Button>
              )}
              <Button onClick={() => navigate('/pro')}>回到 Pro 靶场</Button>
              <Button onClick={() => navigate('/pro/progress')}>我的学习进度</Button>
            </Space>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              题库作者 / 开发者需要直接查看本题时，可开启开发者模式：
              在地址栏加 <Text code>?dev=1</Text>，或按 <Text code>Ctrl + Shift + D</Text>。
            </Paragraph>
          </Space>
        </Card>
      </div>
    );
  }

  const status = getProProblemStatus(problem.id, completed, attempted);
  const luoguCode = problem.luogu_code?.trim() ?? '';
  const luoguKeyword = problem.luogu_keyword?.trim() ?? '';
  /** 只有格式已对齐洛谷原题的题才预填题号 */
  const luoguAligned = Boolean(problem.luogu_aligned && luoguCode);
  const luoguUrl = luoguCode
    ? `https://www.luogu.com.cn/problem/${luoguCode}`
    : luoguKeyword
      ? `https://www.luogu.com.cn/problem/list?keyword=${encodeURIComponent(luoguKeyword)}`
      : '';

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
            message="Pro 靶场用 C++ 写题，判题在洛谷进行"
            description={
              <Space direction="vertical" size={6}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  还没写过 C++？先看「新手指南 · 第零课」，它讲清楚了代码为什么长这样、
                  每个符号是什么意思、报错怎么读，以及中文标点这个最大的坑。
                </Text>
                <Space wrap>
                  <Button
                    size="small"
                    type="primary"
                    icon={<ReadOutlined />}
                    onClick={() => navigate('/guide')}
                  >
                    打开新手指南
                  </Button>
                  <Button size="small" icon={<AimOutlined />} onClick={jumpTodo}>
                    光标跳到该写代码的地方
                  </Button>
                </Space>
              </Space>
            }
          />
        )}

        <Card variant="borderless" className="problem-desc-card">
          <Space wrap size={6} style={{ marginBottom: 8 }}>
            <Tag color={PRO_DIFFICULTY_COLOR[problem.difficulty]}>{problem.difficulty}</Tag>
            <Tag color="volcano">{problem.knowledge_point}</Tag>
            <Tag icon={<CloudUploadOutlined />} color="blue">
              洛谷在线评测
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {problem.id}
            </Text>
          </Space>
          <Title level={3}>{problem.title}</Title>
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
                : '在洛谷通过本题后可查看参考题解'}
            </Button>
            <Popconfirm
              title="确认已经在洛谷通过了这道题？"
              description="结果一般会由书签自动回传；这里是手动兜底（例如你直接在洛谷网站上提交并通过了）。"
              okText="标记为通过"
              cancelText="取消"
              onConfirm={handleMarkPassed}
            >
              <Button
                block
                style={{ marginTop: 8 }}
                icon={<CheckCircleOutlined />}
                disabled={completed.includes(problem.id)}
              >
                {completed.includes(problem.id) ? '本题已通过' : '我已在洛谷 AC · 标记本题通过'}
              </Button>
            </Popconfirm>
            {developerMode && (
              <Button
                block
                style={{ marginTop: 8 }}
                icon={<ExperimentOutlined />}
                onClick={fillSolution}
              >
                填入参考题解（开发者）
              </Button>
            )}
            {developerMode && (
              <Button
                block
                style={{ marginTop: 8 }}
                icon={<CopyOutlined />}
                onClick={copyProblemJson}
              >
                复制题目 JSON（开发者）
              </Button>
            )}
          </div>

          {luoguUrl && (
            <>
              <Divider style={{ margin: '16px 0 12px' }} />
              <div className="pro-luogu-block">
                <Space direction="vertical" size={6}>
                  <Text strong>
                    <LinkOutlined /> 本题在洛谷
                  </Text>
                  {luoguCode ? (
                    <Text>
                      {luoguAligned ? '洛谷对应题目：' : '洛谷同类题目：'}
                      <a
                        href={luoguUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginLeft: 4, fontWeight: 600 }}
                      >
                        {luoguCode}
                      </a>
                    </Text>
                  ) : (
                    <Text>
                      洛谷同类型题目：
                      <a
                        href={luoguUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginLeft: 4, fontWeight: 600 }}
                      >
                        {luoguKeyword}
                      </a>
                    </Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    本站<Text strong>不抓取洛谷题面</Text>：题面、数据与评测都在洛谷，
                    本题的描述与题解为本站自撰。
                    {!luoguAligned && (
                      <>
                        {' '}
                        <Text type="warning">
                          注意：本题的输入输出格式是本站自撰的，与洛谷那道题<Text strong>不一定相同</Text>
                          —— 想交洛谷请先读洛谷题面，把输入输出改成洛谷的格式。
                        </Text>
                      </>
                    )}
                  </Text>
                </Space>
              </div>
            </>
          )}

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              disabled={!previous}
              onClick={() => previous && navigate(`/pro/problem/${previous.problem.id}`)}
            >
              上一题
            </Button>
            <Button
              type="primary"
              disabled={!next}
              onClick={() => next && navigate(`/pro/problem/${next.problem.id}`)}
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

      {/* ---------------- 右侧：写代码 + 自查 + 提交到洛谷 ---------------- */}
      <div className="problem-right">
        <Alert
          type="info"
          showIcon
          icon={<ExperimentOutlined />}
          style={{ marginBottom: 12 }}
          message="这道题怎么交？"
          description={
            <ol style={{ margin: 0, paddingInlineStart: 20, fontSize: 12 }}>
              <li>
                {luoguAligned
                  ? '题号已经按题库填好了（也可以改成别的洛谷题号，会记住）。'
                  : '填上你要提交的洛谷题号（例如 P5788），填过会记住。'}
              </li>
              <li>
                在下面的编辑器里写代码。想先自查可以点「运行」或「小样例自查」（会下载约 90MB 编译器，
                只在本机跑，样例是本站自撰的）。
              </li>
              <li>
                点<Text strong>「书签提交」</Text>：自动复制代码并打开洛谷题目页，
                在那边点一下书签栏里的「OIworld 提交」，评测结果显示在洛谷页面右上角。
              </li>
              <li>
                评测结果会<Text strong>自动带回本站</Text>：洛谷 AC（或历史分数 100）即标记本题通过、解锁下一题；
                没回传成功也可以点左边的「我已在洛谷 AC · 标记本题通过」。
              </li>
            </ol>
          }
        />

        <Card variant="borderless" styles={{ body: { padding: 12 } }}>
          <Space
            className="editor-toolbar"
            style={{ width: '100%', justifyContent: 'space-between' }}
            wrap
          >
            <Space size={8}>
              <Tag icon={<CodeOutlined />} color="volcano">
                C++ 20
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Monaco 编辑器 · 代码由书签脚本在你浏览器里发给洛谷
              </Text>
            </Space>
            <Space>
              <Tooltip title="把光标移动到 // TODO 那一行（不知道该在哪写代码时点它）">
                <Button icon={<AimOutlined />} onClick={jumpTodo} disabled={busy}>
                  写到哪？
                </Button>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={busy}>
                重置代码
              </Button>
              <Tooltip title="本地编译并运行一次，用「标准输入」框里的数据（会下载约 90MB 编译器）">
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={handleRun}
                  loading={busy && mode === 'run'}
                  disabled={busy}
                >
                  运行
                </Button>
              </Tooltip>
              <Tooltip title="用本站自撰的小样例跑一遍，帮你排查低级错误（这不是洛谷的判题结果）">
                <Button
                  type="primary"
                  ghost
                  icon={<SendOutlined />}
                  onClick={handleSelfCheck}
                  loading={busy && mode === 'submit'}
                  disabled={busy}
                >
                  小样例自查
                </Button>
              </Tooltip>
            </Space>
          </Space>

          <div className="editor-wrapper">
            <CodeEditor
              ref={editorRef}
              language="cpp"
              value={code}
              onChange={handleCodeChange}
              diagnostics={diagnostics}
              height={400}
            />
          </div>
        </Card>

        <Collapse
          activeKey={selfCheckOpen ? ['self'] : []}
          onChange={(keys) => setSelfCheckOpen(keys.length > 0)}
          style={{ marginTop: 12 }}
          items={[
            {
              key: 'self',
              label: (
                <Space>
                  <ExperimentOutlined />
                  <Text strong>本地运行与自查（可选）</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    用本站自撰的小样例检查代码，不决定本题是否通过
                  </Text>
                </Space>
              ),
              children: (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <ToolchainAlert
                    status={compilerStatus}
                    onRetry={() => {
                      void warmUpCompiler().catch(() => undefined);
                    }}
                  />
                  <Segmented
                    value={bottomTab}
                    onChange={(value) => setBottomTab(value as 'stdin' | 'output')}
                    options={[
                      { value: 'stdin', label: '标准输入 (stdin)' },
                      { value: 'output', label: '运行结果' },
                    ]}
                  />
                  {bottomTab === 'stdin' ? (
                    <div>
                      <TextArea
                        value={stdin}
                        onChange={(event) => setStdin(event.target.value)}
                        rows={7}
                        placeholder="在这里输入程序的测试数据（相当于键盘输入）"
                        style={{ fontFamily: 'Consolas, "Courier New", monospace', fontSize: 13 }}
                      />
                      <Space style={{ marginTop: 8 }} wrap>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          每个小样例的输入都可以一键填入：
                        </Text>
                        {problem.test_cases.map((testCase, index) => (
                          <Button key={index} size="small" onClick={() => useCaseAsInput(testCase)}>
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
                      language="cpp"
                      onJumpToLine={(line) => editorRef.current?.jumpToLine(line)}
                    />
                  )}
                  <TestCasePanel
                    testCases={problem.test_cases}
                    results={results}
                    running={busy}
                    onRunAll={handleSelfCheck}
                    onUseAsInput={useCaseAsInput}
                  />
                </Space>
              ),
            },
          ]}
        />

        <Card
          variant="borderless"
          styles={{ body: { padding: 12 } }}
          style={{ marginTop: 12 }}
        >
          <LuoguSubmitPanel
            problemId={problem.id}
            defaultPid={luoguAligned ? luoguCode : ''}
            keyword={luoguKeyword}
            code={code}
            track="cpp"
            pidLabel={luoguAligned ? '洛谷对应题目' : '洛谷同类题目'}
            disabled={!unlocked}
            onOpenLuogu={handleOpenLuogu}
          />
        </Card>

        <Alert
          type="info"
          showIcon
          icon={<CloudUploadOutlined />}
          style={{ marginTop: 12 }}
          message="判题在洛谷，本站怎么知道结果？"
          description={
            <Text style={{ fontSize: 12 }}>
              书签在洛谷页面上拿到评测结果后，会<Text strong>打开一个带结果的 OIworld 链接</Text>
              （地址里带 <Text code>?luoguResult=…</Text>），本站读到就自动标记本题通过；
              书签浮层里那个「↩ 把结果记回 OIworld」也是同一个链接。
              如果这一步没成功（比如浏览器拦了新标签），用左边的「我已在洛谷 AC · 标记本题通过」兜底。
            </Text>
          }
        />
      </div>

      <Modal
        open={solutionVisible}
        title={`参考题解 · ${problem.title}`}
        footer={null}
        width={720}
        onCancel={() => setSolutionVisible(false)}
      >
        <Paragraph type="secondary">先自己试一试；看懂答案后，再不看答案重写一遍。</Paragraph>
        <pre className="output-pre solution-pre">{problem.solution_code}</pre>
      </Modal>
    </div>
  );
}
