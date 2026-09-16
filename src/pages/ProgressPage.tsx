import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  List,
  Popconfirm,
  Progress,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  DownloadOutlined,
  LockOutlined,
  ReloadOutlined,
  RiseOutlined,
  UploadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { STAGES, getOverallStats, getStageStats } from '../data';
import { useProgressStore } from '../store/useProgressStore';

const { Title, Paragraph, Text } = Typography;

export function ProgressPage() {
  const navigate = useNavigate();
  const state = useProgressStore();
  const [messageApi, contextHolder] = message.useMessage();

  const overall = getOverallStats(
    state.completedProblems,
    state.attemptedProblems,
  );

  const totalQuestions = overall.total;
  const draftsCount = Object.keys(state.drafts).length;

  const handleExport = () => {
    const data = state.buildExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `oiworld-progress-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    messageApi.success('进度文件已导出');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const result = state.importProgress(parsed);
      if (result.ok) {
        messageApi.success(result.message);
      } else {
        messageApi.error(`导入失败：${result.message}`);
      }
    } catch (error) {
      messageApi.error(
        `导入失败：${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return false;
  };

  return (
    <div className="page">
      {contextHolder}
      <Card variant="borderless">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={10}>
            <Title level={3} style={{ marginBottom: 4 }}>
              <RiseOutlined /> 我的学习进度
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              进度保存在浏览器本地（localStorage），不会上传到任何服务器。
              {draftsCount > 0 && ` 其中 ${draftsCount} 道题保存了代码草稿。`}
            </Paragraph>
          </Col>
          <Col xs={24} md={14}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="总题数" value={overall.total} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已通过"
                  value={overall.passed}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="未通过"
                  value={overall.failed}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={6}>
                <Statistic title="未做" value={overall.todo} />
              </Col>
            </Row>
            <Progress
              percent={overall.percent}
              strokeColor="#1677ff"
              style={{ marginTop: 12 }}
            />
          </Col>
        </Row>
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }} title="各阶段完成情况">
        <List
          dataSource={STAGES}
          renderItem={(stage) => {
            const stats = getStageStats(
              stage,
              state.completedProblems,
              state.attemptedProblems,
            );
            return (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="link"
                    onClick={() => navigate(`/stage/${stage.stage}`)}
                  >
                    查看题目
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{stage.title}</Text>
                      {stats.percent === 100 && stats.total > 0 && (
                        <Tag color="success">已完成</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div style={{ maxWidth: 520 }}>
                      <Progress percent={stats.percent} size="small" />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        已通过 {stats.passed} / {stats.total} 题
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Card variant="borderless" style={{ marginTop: 16 }} title="设置与数据">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space align="start">
            <LockOutlined style={{ marginTop: 3, color: '#8c8c8c' }} />
            <div>
              <Text strong>做题顺序：按顺序解锁（固定规则）</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  通过上一题才会解锁下一题，题目按知识点由浅入深排列。
                  需要直接查看被锁的题目时，请用下面的「开发者模式」。
                </Text>
              </div>
            </div>
          </Space>

          <Space align="center">
            <Switch
              checked={state.developerMode}
              onChange={(checked) => {
                state.setDeveloperMode(checked);
                messageApi.info(
                  checked ? '开发者模式已开启：全部题目已解锁' : '开发者模式已关闭',
                );
              }}
            />
            <div>
              <Text strong>
                开发者模式 <Tag color="purple">DEV</Tag>
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  给题库作者 / 前端开发者用：解锁全部题目（不受按顺序解锁的限制）、
                  未通过也能查看并一键填入参考题解、题目页多出一个调试面板
                  （编译参数、工具链来源、耗时、编译器原始输出、复制/下载题目 JSON）。
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    也可以访问 <Text code>?dev=1</Text> 打开、<Text code>?dev=0</Text>{' '}
                    关闭，或按快捷键 <Text code>Ctrl + Shift + D</Text> 随时切换。
                  </Text>
                </div>
              </div>
            </div>
          </Space>

          <Divider style={{ margin: '4px 0' }} />

          <Space wrap>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出进度（JSON）
            </Button>
            <Upload
              accept="application/json,.json"
              showUploadList={false}
              beforeUpload={(file) => {
                void handleImport(file as unknown as File);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>导入进度</Button>
            </Upload>
            <Popconfirm
              title="确定要清空所有进度吗？"
              description="已通过的题目、未通过记录和代码草稿都会被删除。"
              okText="清空"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              onConfirm={() => {
                state.resetProgress();
                messageApi.success('进度已清空');
              }}
            >
              <Button danger icon={<ReloadOutlined />}>
                清空进度
              </Button>
            </Popconfirm>
          </Space>

          <Alert
            type="info"
            showIcon
            icon={<WarningOutlined />}
            message="关于数据"
            description={
              <Text type="secondary" style={{ fontSize: 12 }}>
                本题库共有 {totalQuestions} 道题。换电脑或换浏览器时，可以先导出 JSON
                文件，在新设备上导入即可恢复进度。
              </Text>
            }
          />
        </Space>
      </Card>
    </div>
  );
}
