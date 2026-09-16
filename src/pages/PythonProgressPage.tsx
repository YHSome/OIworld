import { Button, Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PYTHON_STAGES, getPythonStats } from '../python/data';
import { usePythonProgressStore } from '../python/usePythonProgressStore';

const { Title, Paragraph, Text } = Typography;

export function PythonProgressPage() {
  const navigate = useNavigate();
  const completed = usePythonProgressStore((state) => state.completedProblems);
  const attempted = usePythonProgressStore((state) => state.attemptedProblems);
  const drafts = usePythonProgressStore((state) => state.drafts);
  const stats = getPythonStats(completed, attempted);
  return <div className="page"><Card variant="borderless"><Row gutter={[24, 16]} align="middle"><Col xs={24} md={10}><Title level={3} style={{ marginBottom: 4 }}><RiseOutlined /> 我的学习进度</Title><Paragraph type="secondary" style={{ marginBottom: 0 }}>Python 靶场的进度保存在浏览器本地，不会上传。{Object.keys(drafts).length > 0 && ` 当前有 ${Object.keys(drafts).length} 道题保存了草稿。`}</Paragraph></Col><Col xs={24} md={14}><Row gutter={16}><Col span={6}><Statistic title="总题数" value={stats.total} /></Col><Col span={6}><Statistic title="已通过" value={stats.passed} valueStyle={{ color: '#52c41a' }} /></Col><Col span={6}><Statistic title="未通过" value={stats.failed} valueStyle={{ color: '#ff4d4f' }} /></Col><Col span={6}><Statistic title="未做" value={stats.total - stats.passed - stats.failed} /></Col></Row><Progress percent={stats.percent} strokeColor="#1677ff" style={{ marginTop: 12 }} /></Col></Row></Card><Card variant="borderless" style={{ marginTop: 16 }} title="各阶段完成情况"><List dataSource={PYTHON_STAGES} renderItem={(stage) => { const passed = stage.problems.filter((problem) => completed.includes(problem.id)).length; const percent = Math.round(passed / stage.problems.length * 100); return <List.Item actions={[<Button key="open" type="link" onClick={() => navigate(`/python/stage/${stage.stage}`)}>查看题目</Button>]}><List.Item.Meta title={<Space><Text strong>{stage.title}</Text>{percent === 100 && <Tag color="success">已完成</Tag>}</Space>} description={<div style={{ maxWidth: 520 }}><Progress percent={percent} size="small" /><Text type="secondary" style={{ fontSize: 12 }}>已通过 {passed} / {stage.problems.length} 题</Text></div>} /></List.Item>; }} /></Card></div>;
}
