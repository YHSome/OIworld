/**
 * Java 靶场进度页：与 C++ / Python 靶场一致的统计与阶段完成情况。
 */

import { Button, Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { JAVA_STAGES, getJavaStats } from '../java/data';
import { useJavaProgressStore } from '../java/useJavaProgressStore';

const { Title, Paragraph, Text } = Typography;

export function JavaProgressPage() {
  const navigate = useNavigate();
  const completed = useJavaProgressStore((state) => state.completedProblems);
  const attempted = useJavaProgressStore((state) => state.attemptedProblems);
  const drafts = useJavaProgressStore((state) => state.drafts);
  const stats = getJavaStats(completed, attempted);

  return (
    <div className="page">
      <Card variant="borderless">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={10}>
            <Title level={3} style={{ marginBottom: 4 }}>
              <RiseOutlined /> 我的 Java 学习进度
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Java 靶场的进度保存在浏览器本地，不会上传。
              {Object.keys(drafts).length > 0 &&
                ` 当前有 ${Object.keys(drafts).length} 道题保存了代码草稿。`}
            </Paragraph>
          </Col>
          <Col xs={24} md={14}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="总题数" value={stats.total} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已通过"
                  value={stats.passed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="未通过"
                  value={stats.failed}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={6}>
                <Statistic title="未做" value={stats.todo} />
              </Col>
            </Row>
            <Progress
              percent={stats.percent}
              strokeColor="#fa8c16"
              style={{ marginTop: 12 }}
            />
          </Col>
        </Row>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }} title="各阶段完成情况">
        <List
          dataSource={JAVA_STAGES}
          renderItem={(stage) => {
            const passed = stage.problems.filter((problem) =>
              completed.includes(problem.id),
            ).length;
            const percent = Math.round((passed / stage.problems.length) * 100);
            return (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="link"
                    onClick={() => navigate(`/java/stage/${stage.stage}`)}
                  >
                    查看题目
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{stage.title}</Text>
                      {percent === 100 && <Tag color="success">已完成</Tag>}
                    </Space>
                  }
                  description={
                    <div style={{ maxWidth: 520 }}>
                      <Progress percent={percent} size="small" />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        已通过 {passed} / {stage.problems.length} 题
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }}>
        <Space direction="vertical" size={4}>
          <Text strong>关于 Java 靶场的进度</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Java 靶场的进度与 C++、Python 靶场<Text strong>各自独立</Text>保存
            （localStorage 键名 <Text code>oiworld:java-progress</Text>），互不影响。
            想清空 Java 的进度，可以在浏览器控制台执行
            <Text code>localStorage.removeItem(&apos;oiworld:java-progress&apos;)</Text>。
          </Text>
        </Space>
      </Card>
    </div>
  );
}
