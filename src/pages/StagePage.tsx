import { Button, Card, Progress, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DIFFICULTY_COLOR,
  STAGES,
  getStage,
  getStageEntries,
  getStageStats,
} from '../data';
import { useProgressStore } from '../store/useProgressStore';
import { MarkdownView } from '../components/MarkdownView';
import { ProblemTable } from '../components/ProblemTable';

const { Title, Text } = Typography;

export function StagePage() {
  const { stageNumber } = useParams();
  const navigate = useNavigate();
  const stage = getStage(Number(stageNumber));
  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);

  if (!stage) {
    return (
      <div className="page">
        <Card>
          <Title level={4}>找不到这个阶段</Title>
          <Link to="/">返回首页</Link>
        </Card>
      </div>
    );
  }

  const stats = getStageStats(stage, completed, attempted);
  const prevStage = STAGES.find((item) => item.stage === stage.stage - 1);
  const nextStage = STAGES.find((item) => item.stage === stage.stage + 1);

  return (
    <div className="page">
      <Card variant="borderless">
        <Space
          style={{ width: '100%', justifyContent: 'space-between' }}
          align="start"
          wrap
        >
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              {stage.title}
            </Title>
            <Space>
              <Tag color={DIFFICULTY_COLOR[stats.difficulty]}>
                {stats.difficulty}
              </Tag>
              <Text type="secondary">
                共 {stats.total} 题 · 已通过 {stats.passed} 题
                {stats.failed > 0 ? ` · 未通过 ${stats.failed} 题` : ''}
              </Text>
            </Space>
            <div style={{ maxWidth: 720, marginTop: 12 }}>
              <MarkdownView content={stage.summary} />
            </div>
          </div>
          <div style={{ minWidth: 200 }}>
            <Progress
              type="circle"
              size={110}
              percent={stats.percent}
              strokeColor="#1677ff"
            />
          </div>
        </Space>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }}>
        <ProblemTable entries={getStageEntries(stage.stage)} />
      </Card>

      <Space style={{ marginTop: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          disabled={!prevStage}
          onClick={() => prevStage && navigate(`/stage/${prevStage.stage}`)}
        >
          {prevStage ? `上一阶段：${prevStage.subtitle}` : '已是第一阶段'}
        </Button>
        <Button
          type="primary"
          disabled={!nextStage}
          onClick={() => nextStage && navigate(`/stage/${nextStage.stage}`)}
        >
          {nextStage ? `下一阶段：${nextStage.subtitle}` : '已是最后阶段'}
          <ArrowRightOutlined />
        </Button>
      </Space>
    </div>
  );
}
