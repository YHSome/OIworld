/**
 * Pro 靶场进度页：与 C++ / Python / Java 靶场一致的统计与阶段完成情况。
 */

import { Button, Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PRO_STAGES, getProStats } from '../pro/data';
import { useProProgressStore } from '../pro/useProProgressStore';

const { Title, Paragraph, Text } = Typography;

export function ProProgressPage() {
  const navigate = useNavigate();
  const completed = useProProgressStore((state) => state.completedProblems);
  const attempted = useProProgressStore((state) => state.attemptedProblems);
  const drafts = useProProgressStore((state) => state.drafts);
  const stats = getProStats(completed, attempted);

  return (
    <div className="page">
      <Card variant="borderless">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={10}>
            <Title level={3} style={{ marginBottom: 4 }}>
              <RiseOutlined /> 我的 Pro 学习进度
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Pro 靶场（数据结构与进阶算法）的进度保存在浏览器本地，不会上传。
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
              strokeColor="#d4380d"
              style={{ marginTop: 12 }}
            />
          </Col>
        </Row>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }} title="各阶段完成情况">
        <List
          dataSource={PRO_STAGES}
          renderItem={(stage) => {
            const total = stage.problems.length;
            const passed = stage.problems.filter((problem) =>
              completed.includes(problem.id),
            ).length;
            const percent = total === 0 ? 0 : Math.round((passed / total) * 100);
            return (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="link"
                    onClick={() => navigate(`/pro/stage/${stage.stage}`)}
                  >
                    查看题目
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{stage.title}</Text>
                      {total === 0 && <Tag>题目准备中</Tag>}
                      {total > 0 && percent === 100 && <Tag color="success">已完成</Tag>}
                    </Space>
                  }
                  description={
                    <div style={{ maxWidth: 520 }}>
                      <Progress
                        percent={percent}
                        size="small"
                        strokeColor="#d4380d"
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {total === 0
                          ? '本阶段题目正在编写中'
                          : `已通过 ${passed} / ${total} 题`}
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
          <Text strong>关于 Pro 靶场的进度</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Pro 靶场的进度与 C++、Python、Java 靶场<Text strong>各自独立</Text>保存
            （localStorage 键名 <Text code>oiworld:pro-progress</Text>），互不影响。
            想清空 Pro 的进度，可以在浏览器控制台执行
            <Text code>localStorage.removeItem(&apos;oiworld:pro-progress&apos;)</Text>。
          </Text>
        </Space>
      </Card>
    </div>
  );
}
