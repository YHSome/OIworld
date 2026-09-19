/**
 * Pro 题目页（数据结构与进阶算法）。
 *
 * 与 C++ / Python / Java 靶场的最大区别：**Pro 的题目在洛谷上评测**。
 * 题目的讲解、题解、样例都是本站自撰的，但判题交给洛谷，
 * 所以这一页没有本地编译器、没有「运行 / 提交」按钮、也没有测试用例面板，
 * 只有：题目描述 + 在线编辑器 + 「提交到洛谷」面板。
 *
 * 直接好处：打开 Pro 题目页不再需要下载约 90MB 的 clang 工具链。
 *
 * 通关规则：洛谷返回 AC 才算通过本题，并解锁下一题（其它结果记为「未通过」）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  Divider,
  Modal,
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
  CloudUploadOutlined,
  CodeOutlined,
  CopyOutlined,
  ExperimentOutlined,
  LinkOutlined,
  LockOutlined,
  ReadOutlined,
  ReloadOutlined,
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
import { LuoguSubmitPanel } from '../components/LuoguSubmitPanel';
import { isLuoguPending } from '../luogu/verdict';
import type { LuoguRecord } from '../luogu/types';

const { Title, Text, Paragraph } = Typography;

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

  const [code, setCode] = useState('');
  const [solutionVisible, setSolutionVisible] = useState(false);
  /** 这道题提交过程中最近一次洛谷结果（用于避免重复弹「通过」） */
  const handledRid = useRef<number | null>(null);

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
    setSolutionVisible(false);
    handledRid.current = null;
    if (isProProblemUnlocked(problem.id, completed, developerMode)) {
      setLastVisited(problem.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

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

  /**
   * 洛谷评测结果回调：**AC 才算通过**，其它最终结果记为未通过。
   * 只在「这一条提交」上判定，避免把记录列表里别人的 AC 当成本题通过。
   */
  const handleVerdict = useCallback(
    (record: LuoguRecord) => {
      if (!problem) return;
      const alreadyCompleted = useProProgressStore
        .getState()
        .completedProblems.includes(problem.id);

      if (record.status === 12) {
        markCompleted(problem.id);
        if (!alreadyCompleted && handledRid.current !== record.id) {
          handledRid.current = record.id;
          modal.success({
            title: '洛谷评测通过！🎉',
            content: (
              <div>
                <Paragraph style={{ marginBottom: 8 }}>
                  《{problem.title}》在洛谷上拿到了 <Text strong>AC</Text>
                  {record.time ? `，用时 ${record.time} ms` : ''}
                  {record.memory ? `、内存 ${(record.memory / 1024).toFixed(2)} MB` : ''}。
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
        }
        return;
      }

      // 还在评测队列里就先不动进度
      if (!isLuoguPending(record.status)) {
        markAttempted(problem.id);
      }
    },
    [problem, markCompleted, markAttempted, modal, navigate, next],
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
      },
    });
  };

  const jumpTodo = () => {
    const found = editorRef.current?.jumpToFirstTodo();
    messageApi.info(
      found ? '光标已跳到 TODO 那一行，把代码写在这里' : '代码里没有 TODO 标记，请按题目说明修改',
    );
  };

  /** 开发者模式：把参考题解填进编辑器（用于人工核对题目与题解） */
  const fillSolution = () => {
    if (!problem) return;
    setCode(problem.solution_code);
    setDraft(problem.id, problem.solution_code);
    messageApi.success('已填入参考题解，可以直接提交到洛谷验证');
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

  /** 洛谷跳转：优先精确题号，其次同类型题目搜索页 */
  const luoguCode = problem.luogu_code?.trim() ?? '';
  const luoguKeyword = problem.luogu_keyword?.trim() ?? '';
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
            <Tag color={PRO_DIFFICULTY_COLOR[problem.difficulty]}>
              {problem.difficulty}
            </Tag>
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
                      洛谷对应题目：
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
                    本题的描述与题解为本站自撰。判题以洛谷结果为准，AC 即通过本题。
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

      {/* ---------------- 右侧：写代码 + 提交到洛谷 ---------------- */}
      <div className="problem-right">
        <Alert
          type="info"
          showIcon
          icon={<ExperimentOutlined />}
          style={{ marginBottom: 12 }}
          message="这道题怎么交？"
          description={
            <ol style={{ margin: 0, paddingInlineStart: 20, fontSize: 12 }}>
              <li>题号已经按题库填好了（也可以改成别的洛谷题号，会记住）。</li>
              <li>在下面的编辑器里写代码。判题由洛谷完成，所以这里没有本地「运行」。</li>
              <li>
                点<Text strong>「提交到洛谷」</Text>，评测结果会显示在按钮下方；
                <Text strong>AC 即通过本题</Text>并解锁下一题。
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
                Monaco 编辑器 · 代码由你本机的桥接脚本/书签发给洛谷
              </Text>
            </Space>
            <Space>
              <Tooltip title="把光标移动到 // TODO 那一行（不知道该在哪写代码时点它）">
                <Button icon={<AimOutlined />} onClick={jumpTodo}>
                  写到哪？
                </Button>
              </Tooltip>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置代码
              </Button>
            </Space>
          </Space>

          <div className="editor-wrapper">
            <CodeEditor
              ref={editorRef}
              language="cpp"
              value={code}
              onChange={handleCodeChange}
              height={420}
            />
          </div>
        </Card>

        <Card
          variant="borderless"
          styles={{ body: { padding: 12 } }}
          style={{ marginTop: 12 }}
        >
          <LuoguSubmitPanel
            problemId={problem.id}
            defaultPid={luoguCode}
            keyword={luoguKeyword}
            code={code}
            track="cpp"
            disabled={!unlocked}
            onVerdict={handleVerdict}
          />
        </Card>

        <Alert
          type="info"
          showIcon
          icon={<CloudUploadOutlined />}
          style={{ marginTop: 12 }}
          message="为什么这题不在浏览器里判？"
          description={
            <Text style={{ fontSize: 12 }}>
              Pro 靶场的题目都来自洛谷的公开题（题号已逐题核对），所以判题直接交给洛谷：
              你得到的是洛谷官方的评测结果与提交记录，也不用再下载 90MB 的编译器。
              本题的描述、题解与样例是本站自撰的，洛谷那边只用于评测。
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
        <Paragraph type="secondary">
          先自己试一试；看懂答案后，再不看答案重写一遍。
        </Paragraph>
        <pre className="output-pre solution-pre">{problem.solution_code}</pre>
      </Modal>
    </div>
  );
}
