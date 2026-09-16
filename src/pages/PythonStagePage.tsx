import { Button, Card, Progress, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PYTHON_DIFFICULTY_COLOR, PYTHON_PROBLEMS, PYTHON_STAGES, getPythonStage } from '../python/data';
import { usePythonProgressStore } from '../python/usePythonProgressStore';
import { MarkdownView } from '../components/MarkdownView';
import { PythonProblemTable } from '../components/PythonProblemTable';

const { Title, Text } = Typography;

export function PythonStagePage() {
  const { stageNumber } = useParams();
  const navigate = useNavigate();
  const stage = getPythonStage(Number(stageNumber));
  const completed = usePythonProgressStore((state) => state.completedProblems);
  const attempted = usePythonProgressStore((state) => state.attemptedProblems);
  if (!stage) return <div className="page"><Card><Title level={4}>找不到这个阶段</Title><Link to="/python">返回 Python 靶场</Link></Card></div>;
  const passed = stage.problems.filter((problem) => completed.includes(problem.id)).length;
  const failed = stage.problems.filter((problem) => !completed.includes(problem.id) && attempted.includes(problem.id)).length;
  const prevStage = PYTHON_STAGES.find((item) => item.stage === stage.stage - 1);
  const nextStage = PYTHON_STAGES.find((item) => item.stage === stage.stage + 1);
  const hardest = stage.problems.some((problem) => problem.difficulty === '中等') ? '中等' : stage.problems.some((problem) => problem.difficulty === '简单') ? '简单' : '入门';
  const entries = PYTHON_PROBLEMS.filter((entry) => entry.stage.stage === stage.stage);
  return <div className="page">
    <Card variant="borderless"><Space style={{ width: '100%', justifyContent: 'space-between' }} align="start" wrap><div><Title level={3} style={{ marginBottom: 4 }}>{stage.title}</Title><Space><Tag color={PYTHON_DIFFICULTY_COLOR[hardest]}>{hardest}</Tag><Text type="secondary">共 {stage.problems.length} 题 · 已通过 {passed} 题{failed > 0 ? ` · 未通过 ${failed} 题` : ''}</Text></Space><div style={{ maxWidth: 720, marginTop: 12 }}><MarkdownView content={stage.summary} /></div></div><Progress type="circle" size={110} percent={Math.round(passed / stage.problems.length * 100)} strokeColor="#1677ff" /></Space></Card>
    <Card variant="borderless" style={{ marginTop: 16 }}><PythonProblemTable entries={entries} /></Card>
    <Space style={{ marginTop: 16, width: '100%', justifyContent: 'space-between' }}><Button icon={<ArrowLeftOutlined />} disabled={!prevStage} onClick={() => prevStage && navigate(`/python/stage/${prevStage.stage}`)}>{prevStage ? `上一阶段：${prevStage.subtitle}` : '已是第一阶段'}</Button><Button type="primary" disabled={!nextStage} onClick={() => nextStage && navigate(`/python/stage/${nextStage.stage}`)}>{nextStage ? `下一阶段：${nextStage.subtitle}` : '已是最后阶段'}<ArrowRightOutlined /></Button></Space>
  </div>;
}
