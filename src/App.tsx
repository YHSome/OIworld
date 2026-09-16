import { Layout, Menu, Progress, Space, Tag, Tooltip, Typography } from 'antd';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOutlined,
  CodeOutlined,
  ReadOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { HomePage } from './pages/HomePage';
import { StagePage } from './pages/StagePage';
import { ProblemPage } from './pages/ProblemPage';
import { ProgressPage } from './pages/ProgressPage';
import { GuidePage } from './pages/GuidePage';
import { useProgressStore } from './store/useProgressStore';
import { getOverallStats } from './data';
import { ToolchainAlert } from './components/ToolchainAlert';
import { useCompilerStatus, warmUpCompiler } from './hooks/useCompiler';
import { useDeveloperMode } from './hooks/useDeveloperMode';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);
  // 在这里调用一次：安装 ?dev=1 解析与 Ctrl+Shift+D 快捷键
  const { developerMode } = useDeveloperMode();
  const compilerStatus = useCompilerStatus();

  const overall = getOverallStats(completed, attempted);

  const selectedKey = location.pathname.startsWith('/progress')
    ? 'progress'
    : location.pathname.startsWith('/guide')
      ? 'guide'
      : location.pathname.startsWith('/problem') ||
          location.pathname.startsWith('/stage')
        ? 'problems'
        : 'home';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <div className="app-header-inner">
          <div className="brand" onClick={() => navigate('/')} role="presentation">
            <CodeOutlined className="brand-icon" />
            <span className="brand-name">OIworld</span>
            <Text className="brand-slogan">C++ 基础语法靶场 · 浏览器本地编译</Text>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            className="app-menu"
            items={[
              {
                key: 'guide',
                icon: <ReadOutlined />,
                label: <Link to="/guide">新手指南</Link>,
              },
              { key: 'home', icon: <BookOutlined />, label: <Link to="/">全部题目</Link> },
              {
                key: 'problems',
                icon: <CodeOutlined />,
                label: <Link to="/stage/1">按阶段练习</Link>,
              },
              {
                key: 'progress',
                icon: <RiseOutlined />,
                label: <Link to="/progress">我的进度</Link>,
              },
            ]}
          />

          <Space size={16} className="app-header-right">
            <Tooltip title="进度保存在本机浏览器，不会上传">
              <Space size={8}>
                <Progress
                  type="circle"
                  size={36}
                  percent={overall.percent}
                  strokeColor="#1677ff"
                  format={(percent) => (
                    <span style={{ fontSize: 11 }}>{percent}%</span>
                  )}
                />
                <Text className="header-stat">
                  {overall.passed}/{overall.total}
                </Text>
              </Space>
            </Tooltip>
            {developerMode && (
              <Tooltip title="全部题目已解锁 · 可直接看题解 · 题目页显示调试面板（Ctrl+Shift+D 切换）">
                <Tag color="purple" style={{ marginInlineEnd: 0 }}>
                  DEV
                </Tag>
              </Tooltip>
            )}
            <Tooltip title="编译器加载状态">
              <span>
                <ToolchainAlert
                  compact
                  status={compilerStatus}
                  onRetry={() => {
                    void warmUpCompiler().catch(() => undefined);
                  }}
                />
              </span>
            </Tooltip>
          </Space>
        </div>
      </Header>

      <Content className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/stage/:stageNumber" element={<StagePage />} />
          <Route path="/problem/:problemId" element={<ProblemPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Content>

      <Footer className="app-footer">
        <Space split="·" wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>
            OIworld · YHSome的从0开始的C++ 学习靶场
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            代码在你的浏览器中由 clang（WebAssembly 版）本地编译，不会被上传
          </Text>
          <Tag color="default" style={{ fontSize: 11 }}>
            无文件读写 / 无网络 / 仅标准输入输出
          </Tag>
        </Space>
      </Footer>
    </Layout>
  );
}
