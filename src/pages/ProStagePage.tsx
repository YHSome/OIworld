/**
 * Pro 靶场阶段页：与 C++ / Python / Java 靶场一致的「阶段信息 + 题目列表」布局。
 */

import { Button, Card, Empty, Progress, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  PRO_DIFFICULTY_COLOR,
  PRO_STAGES,
  getProStage,
  getProStageEntries,
} from '../pro/data';
import { useProProgressStore } from '../pro/useProProgressStore';
import { MarkdownView } from '../components/MarkdownView';
import { ProProblemTable } from '../components/ProProblemTable';

const { Title, Text } = Typography;

export function ProStagePage() {
  const { stageNumber } = useParams();
  const navigate = useNavigate();
  const stage = getProStage(Number(stageNumber));
  const completed = useProProgressStore((state) => state.completedProblems);
  const attempted = useProProgressStore((state) => state.attemptedProblems);

  if (!stage) {
    return (
      <div className="page">
        <Card>
          <Title level={4}>找不到这个阶段</Title>
          <Link to="/pro">返回 Pro 靶场</Link>
        </Card>
      </div>
    );
  }

  const total = stage.problems.length;
  const passed = stage.problems.filter((problem) =>
    completed.includes(problem.id),
  ).length;
  const failed = stage.problems.filter(
    (problem) =>
      !completed.includes(problem.id) && attempted.includes(problem.id),
  ).length;
  const percent = total === 0 ? 0 : Math.round((passed / total) * 100);
  const prevStage = PRO_STAGES.find((item) => item.stage === stage.stage - 1);
  const nextStage = PRO_STAGES.find((item) => item.stage === stage.stage + 1);
  const hardest = stage.problems.some((problem) => problem.difficulty === '困难')
    ? '困难'
    : stage.problems.some((problem) => problem.difficulty === '中等')
      ? '中等'
      : stage.problems.some((problem) => problem.difficulty === '简单')
        ? '简单'
        : '入门';

  return (
    <div className="page">
      <Card variant="borderless">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start" wrap>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              {stage.title}
            </Title>
            <Space wrap>
              {total === 0 ? (
                <Tag>题目准备中</Tag>
              ) : (
                <Tag color={PRO_DIFFICULTY_COLOR[hardest]}>{hardest}</Tag>
              )}
              <Text type="secondary">
                {total === 0
                  ? '本阶段题目正在编写中，敬请期待'
                  : `共 ${total} 题 · 已通过 ${passed} 题${
                      failed > 0 ? ` · 未通过 ${failed} 题` : ''
                    }`}
              </Text>
            </Space>
            <div style={{ maxWidth: 720, marginTop: 12 }}>
              <MarkdownView content={stage.summary} />
            </div>
          </div>
          <Progress
            type="circle"
            size={110}
            percent={percent}
            strokeColor="#d4380d"
          />
        </Space>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }}>
        {total === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="这一阶段的题目还在编写中，先看看其它阶段吧"
          />
        ) : (
          <ProProblemTable entries={getProStageEntries(stage.stage)} />
        )}
      </Card>

      <Space style={{ marginTop: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          disabled={!prevStage}
          onClick={() => prevStage && navigate(`/pro/stage/${prevStage.stage}`)}
        >
          {prevStage ? `上一阶段：${prevStage.subtitle}` : '已是第一阶段'}
        </Button>
        <Button
          type="primary"
          disabled={!nextStage}
          onClick={() => nextStage && navigate(`/pro/stage/${nextStage.stage}`)}
        >
          {nextStage ? `下一阶段：${nextStage.subtitle}` : '已是最后阶段'}
          <ArrowRightOutlined />
        </Button>
      </Space>
    </div>
  );
}
