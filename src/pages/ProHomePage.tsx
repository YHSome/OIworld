/**
 * Pro 靶场首页（数据结构与进阶算法）：与 C++ / Python / Java 靶场一致的
 * 「总览 + 搜索筛选 + 阶段卡片」布局。
 *
 * 不同之处：题目按知识点自撰，并提供跳转到洛谷同类型题目的链接（本站不抓取洛谷题面）。
 */

import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
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
  CodeOutlined,
  ExperimentOutlined,
  FireOutlined,
  LinkOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, ProblemStatus } from '../types/problem';
import {
  PRO_DIFFICULTY_COLOR,
  PRO_PROBLEM_ENTRIES,
  PRO_STAGES,
  getProProblemStatus,
  getProStats,
} from '../pro/data';
import { useProProgressStore } from '../pro/useProProgressStore';
import { ProProblemTable } from '../components/ProProblemTable';

const { Title, Paragraph, Text } = Typography;
const difficulties: Difficulty[] = ['入门', '简单', '中等', '困难'];

export function ProHomePage() {
  const navigate = useNavigate();
  const completed = useProProgressStore((state) => state.completedProblems);
  const attempted = useProProgressStore((state) => state.attemptedProblems);
  const lastVisited = useProProgressStore((state) => state.lastVisitedProblemId);

  const [keyword, setKeyword] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<ProblemStatus | 'all'>('all');

  const stats = getProStats(completed, attempted);
  const resume =
    PRO_PROBLEM_ENTRIES.find((entry) => entry.problem.id === lastVisited)?.problem ??
    PRO_PROBLEM_ENTRIES[0]?.problem;

  const filtered = useMemo(
    () =>
      PRO_PROBLEM_ENTRIES.filter((entry) => {
        const haystack =
          `${entry.problem.id} ${entry.problem.title} ${entry.problem.knowledge_point} ${entry.stage.title}`.toLowerCase();
        return (
          (!keyword.trim() || haystack.includes(keyword.trim().toLowerCase())) &&
          (difficulty === 'all' || entry.problem.difficulty === difficulty) &&
          (status === 'all' ||
            getProProblemStatus(entry.problem.id, completed, attempted) === status)
        );
      }),
    [keyword, difficulty, status, completed, attempted],
  );
  const filtering =
    Boolean(keyword.trim()) || difficulty !== 'all' || status !== 'all';

  return (
    <div className="page">
      <Card className="hero-card pro-hero-card" variant="borderless">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={15}>
            <Title level={2} style={{ marginBottom: 8 }}>
              <ExperimentOutlined /> Pro 靶场 · 数据结构与进阶算法{' '}
              <Tag color="volcano">Beta</Tag>
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 12 }}>
              从 <Text code>stack</Text> / <Text code>queue</Text> 开始，把栈、队列、堆、
              并查集、树状数组、线段树这些结构一个个自己造出来，再用它们解决经典问题。
              题目全部是 <Text strong>C++</Text>，<Text strong>判题在洛谷进行</Text>
              ：在编辑器里写好代码，点一下「提交到洛谷」就能拿到洛谷官方的评测结果，
              本站既没有后端服务器，也不需要下载本地编译器。
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
              <LinkOutlined /> 每道题都标注了<Text strong>洛谷对应题目</Text>
              （42 道里 41 道有精确题号，已逐题核对），直接交到洛谷练；
              本题的描述、题解与样例为本站自撰，洛谷那边只用于评测，不抓取洛谷题面。
            </Paragraph>
            <Space wrap>
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() => resume && navigate(`/pro/problem/${resume.id}`)}
              >
                {lastVisited ? `继续上次：${resume?.title}` : '从第一题开始'}
              </Button>
              <Button icon={<FireOutlined />} onClick={() => navigate('/pro/stage/1')}>
                学习阶段
              </Button>
              <Button icon={<ReadOutlined />} onClick={() => navigate('/guide')}>
                没写过 C++？先看新手指南
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={9}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="题目总数" value={stats.total} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已通过"
                  value={stats.passed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="未通过"
                  value={stats.failed}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
            <Progress
              percent={stats.percent}
              status="active"
              strokeColor="#d4380d"
              style={{ marginTop: 12 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              编译参数固定为 <Text code>-std=c++20 -O0 -Wall</Text>，与 C++ 靶场同一条链路。
            </Text>
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
              ...difficulties.map((item) => ({ value: item, label: item })),
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
          {filtering && <Text type="secondary">共找到 {filtered.length} 道题</Text>}
        </Space>
      </Card>

      {filtering ? (
        <Card variant="borderless" style={{ marginTop: 16 }}>
          <ProProblemTable entries={filtered} showStage />
        </Card>
      ) : (
        <>
          <Title level={4} style={{ marginTop: 24 }}>
            学习阶段
          </Title>
          <Row gutter={[16, 16]}>
            {PRO_STAGES.map((stage) => {
              const total = stage.problems.length;
              const passed = stage.problems.filter((problem) =>
                completed.includes(problem.id),
              ).length;
              const hardest = stage.problems.some(
                (problem) => problem.difficulty === '困难',
              )
                ? '困难'
                : stage.problems.some((problem) => problem.difficulty === '中等')
                  ? '中等'
                  : stage.problems.some((problem) => problem.difficulty === '简单')
                    ? '简单'
                    : '入门';
              const percent = total === 0 ? 0 : Math.round((passed / total) * 100);
              return (
                <Col xs={24} sm={12} lg={8} xxl={6} key={stage.stage}>
                  <Card
                    hoverable
                    className="stage-card"
                    onClick={() => navigate(`/pro/stage/${stage.stage}`)}
                  >
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 16 }}>
                        {stage.title}
                      </Text>
                      {total === 0 ? (
                        <Tag>题目准备中</Tag>
                      ) : (
                        <Tag color={PRO_DIFFICULTY_COLOR[hardest]}>{hardest}</Tag>
                      )}
                    </Space>
                    <Paragraph
                      type="secondary"
                      style={{ marginTop: 8, marginBottom: 12, minHeight: 44 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {stage.subtitle}
                    </Paragraph>
                    <Progress
                      percent={percent}
                      size="small"
                      strokeColor="#d4380d"
                    />
                    <Space
                      style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {total === 0
                          ? '本阶段题目正在编写中'
                          : `共 ${total} 题 · 已通过 ${passed} 题`}
                      </Text>
                      <ArrowRightOutlined style={{ color: '#bfbfbf' }} />
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Card variant="borderless" style={{ marginTop: 16 }}>
            <Space direction="vertical" size={4}>
              <Text strong>
                <CodeOutlined /> 关于 Pro 靶场的进度
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Pro 靶场的进度与 C++、Python、Java 靶场<Text strong>各自独立</Text>保存
                （localStorage 键名 <Text code>oiworld:pro-progress</Text>），互不影响。
                想清空 Pro 的进度，可以在浏览器控制台执行
                <Text code>localStorage.removeItem(&apos;oiworld:pro-progress&apos;)</Text>。
              </Text>
            </Space>
          </Card>
        </>
      )}
    </div>
  );
}
