import { useEffect, useRef, useState } from 'react';
import { Alert, App as AntApp, Button, Card, Collapse, Divider, Input, Modal, Segmented, Space, Tag, Tooltip, Typography } from 'antd';
import { AimOutlined, ArrowLeftOutlined, ArrowRightOutlined, BulbOutlined, CodeOutlined, ExperimentOutlined, LockOutlined, PlayCircleOutlined, ReadOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPythonNeighbours, getPythonProblemEntry, getPythonProblemStatus, isPythonProblemUnlocked, PYTHON_DIFFICULTY_COLOR } from '../python/data';
import { pythonCompiler, type PythonRuntimeStatus } from '../python/compiler';
import { usePythonProgressStore } from '../python/usePythonProgressStore';
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

export function PythonProblemPage() {
  const { problemId } = useParams(); const navigate = useNavigate(); const { modal, message: messageApi } = AntApp.useApp();
  const entry = getPythonProblemEntry(problemId); const problem = entry?.problem ?? null;
  const completed = usePythonProgressStore((state) => state.completedProblems); const attempted = usePythonProgressStore((state) => state.attemptedProblems);
  const { markCompleted, markAttempted, setLastVisited, setDraft, clearDraft } = usePythonProgressStore(); const { developerMode } = useDeveloperMode();
  const [code, setCode] = useState(''); const [stdin, setStdin] = useState(''); const [outcome, setOutcome] = useState<RunOutcome | null>(null); const [submission, setSubmission] = useState<SubmissionResult | null>(null); const [results, setResults] = useState<TestCaseResult[] | null>(null); const [busy, setBusy] = useState(false); const [mode, setMode] = useState<'run' | 'submit'>('run'); const [bottomTab, setBottomTab] = useState<'stdin' | 'output'>('output'); const [solutionVisible, setSolutionVisible] = useState(false); const [runtime, setRuntime] = useState<PythonRuntimeStatus>(pythonCompiler.getStatus());
  const draftTimer = useRef<number | undefined>(); const editorRef = useRef<CodeEditorHandle | null>(null);
  const unlocked = Boolean(problem && isPythonProblemUnlocked(problem.id, completed, developerMode));
  const neighbours = problem ? getPythonNeighbours(problem.id) : { prev: null, next: null };

  useEffect(() => pythonCompiler.subscribe(setRuntime), []);
  useEffect(() => { if (!problem) return; const draft = usePythonProgressStore.getState().drafts[problem.id]; setCode(draft ?? problem.starter_code); setStdin(problem.test_cases[0]?.input ?? ''); setOutcome(null); setSubmission(null); setResults(null); setBottomTab('output'); setSolutionVisible(false); if (isPythonProblemUnlocked(problem.id, completed, developerMode)) setLastVisited(problem.id); }, [problem?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (unlocked) void pythonCompiler.runOnce('', '').catch(() => undefined); }, [unlocked]);

  if (!problem || !entry) return <div className="page"><Card><Title level={4}>找不到这道 Python 题目</Title><Link to="/python">返回 Python 靶场</Link></Card></div>;
  if (!unlocked) return <div className="page"><Card><Space direction="vertical"><Title level={4}><LockOutlined /> 这道题还没有解锁</Title><Text type="secondary">通过上一题后才可以继续闯关。</Text><Space><Button type="primary" onClick={() => neighbours.prev && navigate(`/python/problem/${neighbours.prev.problem.id}`)}>去做上一题</Button><Button onClick={() => navigate('/python')}>回到 Python 靶场</Button></Space></Space></Card></div>;
  const status = getPythonProblemStatus(problem.id, completed, attempted);
  const onCodeChange = (value: string) => { setCode(value); window.clearTimeout(draftTimer.current); draftTimer.current = window.setTimeout(() => setDraft(problem.id, value), 500); };
  const run = async () => { setBusy(true); setMode('run'); setSubmission(null); setResults(null); try { const result = await pythonCompiler.runOnce(code, stdin); setOutcome(result); setBottomTab('output'); } catch (error) { messageApi.error(`运行失败：${error instanceof Error ? error.message : String(error)}`); } finally { setBusy(false); } };
  const evaluate = async (official: boolean) => { setBusy(true); setMode(official ? 'submit' : 'run'); setOutcome(null); setSubmission(null); setResults(null); try { const result = await pythonCompiler.submit(code, problem.test_cases, (item) => setResults((previous) => { const next = previous ? [...previous] : []; next[item.index] = item; return next; })); setSubmission(result); setResults(result.cases); setBottomTab('output'); if (result.compileOk && result.passed === result.total && result.total > 0) { const first = !completed.includes(problem.id); markCompleted(problem.id); if (first) modal.success({ title: '恭喜通过！🎉', content: <Paragraph>你用 {result.total} 个测试用例全部通过了《{problem.title}》。</Paragraph>, okText: neighbours.next ? '去做下一题' : '好的', onOk: () => neighbours.next && navigate(`/python/problem/${neighbours.next.problem.id}`) }); } else if (result.compileOk) markAttempted(problem.id); } catch (error) { messageApi.error(`评测失败：${error instanceof Error ? error.message : String(error)}`); } finally { setBusy(false); } };
  const reset = () => modal.confirm({ title: '重置为初始代码？', content: '你写的修改会被清空。', okText: '重置', onOk: () => { setCode(problem.starter_code); clearDraft(problem.id); setOutcome(null); setSubmission(null); setResults(null); } });
  const useCase = (testCase: TestCase) => { setStdin(testCase.input); setBottomTab('stdin'); messageApi.success('已填入该用例的输入'); };
  const jumpTodo = () => { const found = editorRef.current?.jumpToFirstTodo(); messageApi.info(found ? '光标已跳到 TODO，代码写在这里。' : '代码里没有 TODO，请按题目说明修改。'); };

  return <div className="problem-page">
    <div className="problem-left">
      {(entry.stage.stage === 1 || completed.length === 0) && <Alert type="info" showIcon icon={<ReadOutlined />} style={{ marginBottom: 12 }} message="第一次写 Python？先看 Python 新手指南" description={<Button size="small" type="primary" style={{ marginTop: 8 }} onClick={() => navigate('/python/guide')}>打开 Python 指南</Button>} />}
      <Card variant="borderless" className="problem-desc-card"><Space wrap size={6}><Tag color={PYTHON_DIFFICULTY_COLOR[problem.difficulty]}>{problem.difficulty}</Tag><Tag color="purple">{problem.knowledge_point}</Tag><Text type="secondary" style={{ fontSize: 12 }}>{problem.id}</Text></Space><Title level={3}>{problem.title}</Title><Divider style={{ margin: '12px 0' }} /><MarkdownView content={problem.description} />
        {problem.hints.length > 0 && <Collapse ghost style={{ marginTop: 16 }} items={[{ key: 'hints', label: <Space><BulbOutlined style={{ color: '#faad14' }} /><Text strong>提示（想不出来再看）</Text></Space>, children: <div className="markdown-body"><ul>{problem.hints.map((hint, index) => <li key={index}>{hint}</li>)}</ul></div> }]} />}
        <Button block icon={<CodeOutlined />} style={{ marginTop: 16 }} disabled={status !== 'passed' && !developerMode} onClick={() => setSolutionVisible(true)}>{status === 'passed' || developerMode ? '查看参考题解' : '通过本题后可查看参考题解'}</Button>
        <Divider style={{ margin: '16px 0 12px' }} /><LuoguSubmitPanel problemId={problem.id} defaultPid={problem.luogu_code} code={code} track="python" disabled={!unlocked} disabledReason="通过本题（或开启开发者模式）后即可提交到洛谷" />
        <Divider /><Space style={{ width: '100%', justifyContent: 'space-between' }}><Button icon={<ArrowLeftOutlined />} disabled={!neighbours.prev} onClick={() => neighbours.prev && navigate(`/python/problem/${neighbours.prev.problem.id}`)}>上一题</Button><Button type="primary" disabled={!neighbours.next} onClick={() => neighbours.next && navigate(`/python/problem/${neighbours.next.problem.id}`)}>下一题<ArrowRightOutlined /></Button></Space>
      </Card>
    </div>
    <div className="problem-right">
      <Alert type={runtime.phase === 'failed' ? 'error' : runtime.phase === 'ready' ? 'success' : 'info'} showIcon style={{ marginBottom: 12 }} message={runtime.message} />
      <Card variant="borderless" styles={{ body: { padding: 12 } }}><Space className="editor-toolbar" style={{ width: '100%', justifyContent: 'space-between' }} wrap><Space><Tag icon={<CodeOutlined />} color="purple">Python 3.12</Tag><Text type="secondary" style={{ fontSize: 12 }}>Pyodide → WebAssembly</Text></Space><Space><Tooltip title="把光标移动到 # TODO 那一行"><Button icon={<AimOutlined />} onClick={jumpTodo} disabled={busy}>写到哪？</Button></Tooltip><Button icon={<ReloadOutlined />} onClick={reset} disabled={busy}>重置代码</Button><Button icon={<PlayCircleOutlined />} onClick={run} loading={busy && mode === 'run'} disabled={busy}>运行</Button><Button type="primary" icon={<SendOutlined />} onClick={() => evaluate(true)} loading={busy && mode === 'submit'} disabled={busy}>提交</Button></Space></Space><div className="editor-wrapper"><CodeEditor ref={editorRef} language="python" value={code} onChange={onCodeChange} height={400} /></div></Card>
      <Card variant="borderless" styles={{ body: { padding: 12 } }} style={{ marginTop: 12 }}><Segmented value={bottomTab} onChange={(value) => setBottomTab(value as 'stdin' | 'output')} options={[{ value: 'stdin', label: '标准输入 (stdin)' }, { value: 'output', label: '运行结果' }]} style={{ marginBottom: 8 }} />{bottomTab === 'stdin' ? <div><TextArea value={stdin} onChange={(event) => setStdin(event.target.value)} rows={7} placeholder="在这里输入程序的测试数据" style={{ fontFamily: 'Consolas, monospace' }} /><Space style={{ marginTop: 8 }} wrap>{problem.test_cases.map((item, index) => <Button size="small" key={index} onClick={() => useCase(item)}>样例 {index + 1}</Button>)}</Space></div> : <OutputPanel outcome={outcome} submission={submission} busy={busy} mode={mode} code={code} language="python" onJumpToLine={(line) => editorRef.current?.jumpToLine(line)} />}</Card>
      <Card variant="borderless" styles={{ body: { padding: 12 } }} style={{ marginTop: 12 }}><TestCasePanel testCases={problem.test_cases} results={results} running={busy} onRunAll={() => evaluate(false)} onUseAsInput={useCase} /></Card>
      <Alert type="info" showIcon icon={<ExperimentOutlined />} style={{ marginTop: 12 }} message="小提示" description="「运行」只使用标准输入框的数据执行一次；「提交」会评测本题的全部测试用例，全部通过才能解锁下一题。" />
    </div>
    <Modal open={solutionVisible} title={`参考题解 · ${problem.title}`} footer={null} width={720} onCancel={() => setSolutionVisible(false)}><Paragraph type="secondary">先自己试一试；看懂答案后，再不看答案重写一遍。</Paragraph><pre className="output-pre solution-pre">{problem.solution_code}</pre></Modal>
  </div>;
}
