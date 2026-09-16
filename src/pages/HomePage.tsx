import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined,
  BookOutlined,
  FireOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  ALL_PROBLEMS,
  DIFFICULTY_COLOR,
  DIFFICULTY_ORDER,
  STAGES,
  filterProblems,
  getOverallStats,
  getStageStats,
  type ProblemEntry,
} from '../data';
import { useProgressStore } from '../store/useProgressStore';
import { ProblemTable } from '../components/ProblemTable';
import type { Difficulty, ProblemStatus } from '../types/problem';

const { Title, Paragraph, Text } = Typography;

export function HomePage() {
  const navigate = useNavigate();
  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);
  const lastVisited = useProgressStore((state) => state.lastVisitedProblemId);

  const [keyword, setKeyword] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<ProblemStatus | 'all'>('all');

  const overall = getOverallStats(completed, attempted);

  const filtered = useMemo(
    () =>
      filterProblems(
        ALL_PROBLEMS,
        { keyword, difficulty, status },
        completed,
        attempted,
      ),
    [keyword, difficulty, status, completed, attempted],
  );

  const filtering =
    keyword.trim() !== '' || difficulty !== 'all' || status !== 'all';

  const lastEntry: ProblemEntry | undefined = ALL_PROBLEMS.find(
    (entry) => entry.problem.id === lastVisited,
  );

  return (
    <div className="page">
      <Card className="hero-card" variant="borderless">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={15}>
            <Title level={2} style={{ marginBottom: 8 }}>
              <BookOutlined /> C++ 基础语法靶场
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 16 }}>
              从 <Text code>Hello, World!</Text> 开始，一步步掌握变量、判断、循环、
              数组、字符串、函数、结构体，直到哈希表。
              所有代码都在<Text strong>你的浏览器里编译运行</Text>
              —— 由编译成 WebAssembly 的真实 clang 编译器完成，
              不依赖任何后端服务器，代码不会上传。
            </Paragraph>
            <Space wrap>
              <Button
                type="primary"
                icon={<ReadOutlined />}
                onClick={() => navigate('/guide')}
              >
                零基础？先看新手指南（10 分钟）
              </Button>
              <Button
                icon={<ArrowRightOutlined />}
                onClick={() =>
                  navigate(
                    `/problem/${lastEntry?.problem.id ?? ALL_PROBLEMS[0]?.problem.id}`,
                  )
                }
                disabled={ALL_PROBLEMS.length === 0}
              >
                {lastEntry ? `继续上次：${lastEntry.problem.title}` : '从第一题开始'}
              </Button>
              <Button icon={<FireOutlined />} onClick={() => navigate('/progress')}>
                我的进度
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={9}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="题目总数" value={overall.total} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已通过"
                  value={overall.passed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="未通过"
                  value={overall.failed}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
            <Progress
              percent={overall.percent}
              status="active"
              strokeColor="#1677ff"
              style={{ marginTop: 12 }}
            />
          </Col>
        </Row>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }}>
        <Space wrap size={12} style={{ width: '100%' }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索题目名称、知识点或题号"
            style={{ width: 280 }}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            value={difficulty}
            style={{ width: 140 }}
            onChange={setDifficulty}
            options={[
              { value: 'all', label: '全部难度' },
              ...DIFFICULTY_ORDER.map((item) => ({ value: item, label: item })),
            ]}
          />
          <Segmented
            value={status}
            onChange={(value) => setStatus(value as ProblemStatus | 'all')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'todo', label: '未做' },
              { value: 'passed', label: '已通过' },
              { value: 'failed', label: '未通过' },
            ]}
          />
          {filtering && (
            <Text type="secondary">共找到 {filtered.length} 道题</Text>
          )}
        </Space>
      </Card>

      {filtering ? (
        <Card variant="borderless" style={{ marginTop: 16 }}>
          <ProblemTable entries={filtered} showStage />
        </Card>
      ) : (
        <>
          <Title level={4} style={{ marginTop: 24 }}>
            学习阶段
          </Title>
          <Row gutter={[16, 16]}>
            {STAGES.map((stage) => {
              const stats = getStageStats(stage, completed, attempted);
              return (
                <Col xs={24} sm={12} lg={8} xxl={6} key={stage.stage}>
                  <Card
                    hoverable
                    className="stage-card"
                    onClick={() => navigate(`/stage/${stage.stage}`)}
                  >
                    <Space
                      style={{ width: '100%', justifyContent: 'space-between' }}
                    >
                      <Text strong style={{ fontSize: 16 }}>
                        {stage.title}
                      </Text>
                      <Tag color={DIFFICULTY_COLOR[stats.difficulty]}>
                        {stats.difficulty}
                      </Tag>
                    </Space>
                    <Paragraph
                      type="secondary"
                      style={{ marginTop: 8, marginBottom: 12, minHeight: 44 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {stage.subtitle}
                    </Paragraph>
                    <Progress
                      percent={stats.percent}
                      size="small"
                      strokeColor="#1677ff"
                    />
                    <Space
                      style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        共 {stats.total} 题 · 已通过 {stats.passed} 题
                        {stats.failed > 0 ? ` · 未通过 ${stats.failed} 题` : ''}
                      </Text>
                      <ArrowRightOutlined style={{ color: '#bfbfbf' }} />
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      {ALL_PROBLEMS.length === 0 && (
        <Empty description="题库为空，请先在 src/data/problems/ 下添加题目" />
      )}
    </div>
  );
}
