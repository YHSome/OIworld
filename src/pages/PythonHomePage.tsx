import { useMemo, useState } from 'react';
import { Button, Card, Col, Input, Progress, Row, Segmented, Select, Space, Statistic, Tag, Typography } from 'antd';
import { ArrowRightOutlined, CodeOutlined, FireOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, ProblemStatus } from '../types/problem';
import { PYTHON_DIFFICULTY_COLOR, PYTHON_PROBLEMS, PYTHON_STAGES, getPythonProblemStatus, getPythonStats } from '../python/data';
import { usePythonProgressStore } from '../python/usePythonProgressStore';
import { PythonProblemTable } from '../components/PythonProblemTable';

const { Title, Paragraph, Text } = Typography;
const difficulties: Difficulty[] = ['入门', '简单', '中等'];

export function PythonHomePage() {
  const navigate = useNavigate();
  const completed = usePythonProgressStore((state) => state.completedProblems);
  const attempted = usePythonProgressStore((state) => state.attemptedProblems);
  const lastVisited = usePythonProgressStore((state) => state.lastVisitedProblemId);
  const [keyword, setKeyword] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<ProblemStatus | 'all'>('all');
  const stats = getPythonStats(completed, attempted);
  const resume = PYTHON_PROBLEMS.find((item) => item.problem.id === lastVisited)?.problem ?? PYTHON_PROBLEMS[0]?.problem;
  const filtered = useMemo(() => PYTHON_PROBLEMS.filter((entry) => {
    const haystack = `${entry.problem.id} ${entry.problem.title} ${entry.problem.knowledge_point} ${entry.stage.title}`.toLowerCase();
    return (!keyword.trim() || haystack.includes(keyword.trim().toLowerCase())) && (difficulty === 'all' || entry.problem.difficulty === difficulty) && (status === 'all' || getPythonProblemStatus(entry.problem.id, completed, attempted) === status);
  }), [keyword, difficulty, status, completed, attempted]);
  const filtering = Boolean(keyword.trim()) || difficulty !== 'all' || status !== 'all';

  return <div className="page">
    <Card className="hero-card" variant="borderless">
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={15}>
          <Title level={2} style={{ marginBottom: 8 }}><CodeOutlined /> Python 基础语法靶场</Title>
          <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 16 }}>从 <Text code>print()</Text> 开始，一步步掌握变量、判断、循环、列表、字符串、函数和字典。所有代码都在<Text strong>你的浏览器里运行</Text>——由 Pyodide（WebAssembly 版 Python）完成，不依赖后端服务器，代码不会上传。</Paragraph>
          <Space wrap><Button type="primary" icon={<ReadOutlined />} onClick={() => navigate('/python/guide')}>零基础？先看 Python 指南（10 分钟）</Button><Button icon={<ArrowRightOutlined />} onClick={() => resume && navigate(`/python/problem/${resume.id}`)}>{lastVisited ? `继续上次：${resume?.title}` : '从第一题开始'}</Button><Button icon={<FireOutlined />} onClick={() => navigate('/python/stage/1')}>学习阶段</Button></Space>
        </Col>
        <Col xs={24} md={9}><Row gutter={16}><Col span={8}><Statistic title="题目总数" value={stats.total} /></Col><Col span={8}><Statistic title="已通过" value={stats.passed} valueStyle={{ color: '#52c41a' }} /></Col><Col span={8}><Statistic title="未通过" value={stats.failed} valueStyle={{ color: '#ff4d4f' }} /></Col></Row><Progress percent={stats.percent} status="active" strokeColor="#1677ff" style={{ marginTop: 12 }} /></Col>
      </Row>
    </Card>
    <Card variant="borderless" style={{ marginTop: 16 }}><Space wrap size={12} style={{ width: '100%' }}><Input allowClear prefix={<SearchOutlined />} placeholder="搜索题目名称、知识点或题号" style={{ width: 280 }} value={keyword} onChange={(event) => setKeyword(event.target.value)} /><Select value={difficulty} style={{ width: 140 }} onChange={setDifficulty} options={[{ value: 'all', label: '全部难度' }, ...difficulties.map((item) => ({ value: item, label: item }))]} /><Segmented value={status} onChange={(value) => setStatus(value as ProblemStatus | 'all')} options={[{ value: 'all', label: '全部' }, { value: 'todo', label: '未做' }, { value: 'passed', label: '已通过' }, { value: 'failed', label: '未通过' }]} />{filtering && <Text type="secondary">共找到 {filtered.length} 道题</Text>}</Space></Card>
    {filtering ? <Card variant="borderless" style={{ marginTop: 16 }}><PythonProblemTable entries={filtered} showStage /></Card> : <><Title level={4} style={{ marginTop: 24 }}>学习阶段</Title><Row gutter={[16, 16]}>{PYTHON_STAGES.map((item) => { const passed = item.problems.filter((problem) => completed.includes(problem.id)).length; const hardest = item.problems.some((problem) => problem.difficulty === '中等') ? '中等' : item.problems.some((problem) => problem.difficulty === '简单') ? '简单' : '入门'; return <Col xs={24} sm={12} lg={8} xxl={6} key={item.stage}><Card hoverable className="stage-card" onClick={() => navigate(`/python/stage/${item.stage}`)}><Space style={{ width: '100%', justifyContent: 'space-between' }}><Text strong style={{ fontSize: 16 }}>{item.title}</Text><Tag color={PYTHON_DIFFICULTY_COLOR[hardest]}>{hardest}</Tag></Space><Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 12, minHeight: 44 }} ellipsis={{ rows: 2 }}>{item.subtitle}</Paragraph><Progress percent={Math.round(passed / item.problems.length * 100)} size="small" strokeColor="#1677ff" /><Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}><Text type="secondary" style={{ fontSize: 12 }}>共 {item.problems.length} 题 · 已通过 {passed} 题</Text><ArrowRightOutlined style={{ color: '#bfbfbf' }} /></Space></Card></Col>; })}</Row></>}
  </div>;
}
