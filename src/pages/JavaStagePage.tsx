/**
 * Java 靶场阶段页：与 C++ / Python 靶场一致的「阶段信息 + 题目列表」布局。
 */

import { Button, Card, Progress, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  JAVA_DIFFICULTY_COLOR,
  JAVA_STAGES,
  getJavaStage,
  getJavaStageEntries,
} from '../java/data';
import { useJavaProgressStore } from '../java/useJavaProgressStore';
import { MarkdownView } from '../components/MarkdownView';
import { JavaProblemTable } from '../components/JavaProblemTable';

const { Title, Text } = Typography;

export function JavaStagePage() {
  const { stageNumber } = useParams();
  const navigate = useNavigate();
  const stage = getJavaStage(Number(stageNumber));
  const completed = useJavaProgressStore((state) => state.completedProblems);
  const attempted = useJavaProgressStore((state) => state.attemptedProblems);

  if (!stage) {
    return (
      <div className="page">
        <Card>
          <Title level={4}>找不到这个阶段</Title>
          <Link to="/java">返回 Java 靶场</Link>
        </Card>
      </div>
    );
  }

  const passed = stage.problems.filter((problem) =>
    completed.includes(problem.id),
  ).length;
  const failed = stage.problems.filter(
    (problem) =>
      !completed.includes(problem.id) && attempted.includes(problem.id),
  ).length;
  const prevStage = JAVA_STAGES.find((item) => item.stage === stage.stage - 1);
  const nextStage = JAVA_STAGES.find((item) => item.stage === stage.stage + 1);
  const hardest = stage.problems.some((problem) => problem.difficulty === '中等')
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
            <Space>
              <Tag color={JAVA_DIFFICULTY_COLOR[hardest]}>{hardest}</Tag>
              <Text type="secondary">
                共 {stage.problems.length} 题 · 已通过 {passed} 题
                {failed > 0 ? ` · 未通过 ${failed} 题` : ''}
              </Text>
            </Space>
            <div style={{ maxWidth: 720, marginTop: 12 }}>
              <MarkdownView content={stage.summary} />
            </div>
          </div>
          <Progress
            type="circle"
            size={110}
            percent={Math.round((passed / stage.problems.length) * 100)}
            strokeColor="#fa8c16"
          />
        </Space>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }}>
        <JavaProblemTable entries={getJavaStageEntries(stage.stage)} />
      </Card>

      <Space style={{ marginTop: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          disabled={!prevStage}
          onClick={() => prevStage && navigate(`/java/stage/${prevStage.stage}`)}
        >
          {prevStage ? `上一阶段：${prevStage.subtitle}` : '已是第一阶段'}
        </Button>
        <Button
          type="primary"
          disabled={!nextStage}
          onClick={() => nextStage && navigate(`/java/stage/${nextStage.stage}`)}
        >
          {nextStage ? `下一阶段：${nextStage.subtitle}` : '已是最后阶段'}
          <ArrowRightOutlined />
        </Button>
      </Space>
    </div>
  );
}
