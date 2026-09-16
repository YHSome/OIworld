/**
 * Java 靶场首页：与 C++ / Python 靶场一致的「总览 + 阶段卡片」布局。
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
  FireOutlined,
  ReadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Difficulty, ProblemStatus } from '../types/problem';
import {
  JAVA_DIFFICULTY_COLOR,
  JAVA_PROBLEM_ENTRIES,
  JAVA_STAGES,
  getJavaProblemStatus,
  getJavaStats,
} from '../java/data';
import { useJavaProgressStore } from '../java/useJavaProgressStore';
import { JavaProblemTable } from '../components/JavaProblemTable';
import { JAVA_RUNTIME_HINT } from '../java/runtimeInfo';

const { Title, Paragraph, Text } = Typography;
const difficulties: Difficulty[] = ['入门', '简单', '中等'];

export function JavaHomePage() {
  const navigate = useNavigate();
  const completed = useJavaProgressStore((state) => state.completedProblems);
  const attempted = useJavaProgressStore((state) => state.attemptedProblems);
  const lastVisited = useJavaProgressStore((state) => state.lastVisitedProblemId);

  const [keyword, setKeyword] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<ProblemStatus | 'all'>('all');

  const stats = getJavaStats(completed, attempted);
  const resume =
    JAVA_PROBLEM_ENTRIES.find((entry) => entry.problem.id === lastVisited)?.problem ??
    JAVA_PROBLEM_ENTRIES[0]?.problem;

  const filtered = useMemo(
    () =>
      JAVA_PROBLEM_ENTRIES.filter((entry) => {
        const haystack =
          `${entry.problem.id} ${entry.problem.title} ${entry.problem.knowledge_point} ${entry.stage.title}`.toLowerCase();
        return (
          (!keyword.trim() || haystack.includes(keyword.trim().toLowerCase())) &&
          (difficulty === 'all' || entry.problem.difficulty === difficulty) &&
          (status === 'all' ||
            getJavaProblemStatus(entry.problem.id, completed, attempted) === status)
        );
      }),
    [keyword, difficulty, status, completed, attempted],
  );
  const filtering =
    Boolean(keyword.trim()) || difficulty !== 'all' || status !== 'all';

  return (
    <div className="page">
      <Card className="hero-card java-hero-card" variant="borderless">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={15}>
            <Title level={2} style={{ marginBottom: 8 }}>
              <CodeOutlined /> Java 基础语法靶场 <Tag color="orange">Beta</Tag>
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 16 }}>
              从 <Text code>System.out.println</Text> 开始，认识类与 main 方法、变量、
              <Text code>Scanner</Text> 输入、判断和循环。所有代码都在
              <Text strong>你的浏览器里编译运行</Text>——由 {JAVA_RUNTIME_HINT} 完成，
              不依赖后端服务器，代码不会上传。
            </Paragraph>
            <Space wrap>
              <Button
                type="primary"
                icon={<ReadOutlined />}
                onClick={() => navigate('/java/guide')}
              >
                零基础？先看 Java 指南（10 分钟）
              </Button>
              <Button
                icon={<ArrowRightOutlined />}
                onClick={() => resume && navigate(`/java/problem/${resume.id}`)}
              >
                {lastVisited ? `继续上次：${resume?.title}` : '从第一题开始'}
              </Button>
              <Button icon={<FireOutlined />} onClick={() => navigate('/java/stage/1')}>
                学习阶段
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
              strokeColor="#fa8c16"
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
          <JavaProblemTable entries={filtered} showStage />
        </Card>
      ) : (
        <>
          <Title level={4} style={{ marginTop: 24 }}>
            学习阶段
          </Title>
          <Row gutter={[16, 16]}>
            {JAVA_STAGES.map((stage) => {
              const passed = stage.problems.filter((problem) =>
                completed.includes(problem.id),
              ).length;
              const hardest = stage.problems.some(
                (problem) => problem.difficulty === '中等',
              )
                ? '中等'
                : stage.problems.some((problem) => problem.difficulty === '简单')
                  ? '简单'
                  : '入门';
              return (
                <Col xs={24} sm={12} lg={8} xxl={6} key={stage.stage}>
                  <Card
                    hoverable
                    className="stage-card"
                    onClick={() => navigate(`/java/stage/${stage.stage}`)}
                  >
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 16 }}>
                        {stage.title}
                      </Text>
                      <Tag color={JAVA_DIFFICULTY_COLOR[hardest]}>{hardest}</Tag>
                    </Space>
                    <Paragraph
                      type="secondary"
                      style={{ marginTop: 8, marginBottom: 12, minHeight: 44 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {stage.subtitle}
                    </Paragraph>
                    <Progress
                      percent={Math.round((passed / stage.problems.length) * 100)}
                      size="small"
                      strokeColor="#fa8c16"
                    />
                    <Space
                      style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        共 {stage.problems.length} 题 · 已通过 {passed} 题
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
    </div>
  );
}
