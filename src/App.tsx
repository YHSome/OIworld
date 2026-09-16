import { Button, Layout, Menu, Progress, Space, Tag, Tooltip, Typography } from 'antd';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  CodeOutlined,
  ReadOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { HomePage } from './pages/HomePage';
import { StagePage } from './pages/StagePage';
import { ProblemPage } from './pages/ProblemPage';
import { ProgressPage } from './pages/ProgressPage';
import { GuidePage } from './pages/GuidePage';
import { PythonGuidePage } from './pages/PythonGuidePage';
import { PythonHomePage } from './pages/PythonHomePage';
import { PythonStagePage } from './pages/PythonStagePage';
import { PythonProblemPage } from './pages/PythonProblemPage';
import { PythonProgressPage } from './pages/PythonProgressPage';
import { JavaArenaPage } from './pages/JavaArenaPage';
import { useProgressStore } from './store/useProgressStore';
import { getOverallStats } from './data';
import { ToolchainAlert } from './components/ToolchainAlert';
import { useCompilerStatus, warmUpCompiler } from './hooks/useCompiler';
import { useDeveloperMode } from './hooks/useDeveloperMode';
import { usePythonProgressStore } from './python/usePythonProgressStore';
import { getPythonStats } from './python/data';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);
  const pythonCompleted = usePythonProgressStore((state) => state.completedProblems);
  const pythonAttempted = usePythonProgressStore((state) => state.attemptedProblems);
  // 在这里调用一次：安装 ?dev=1 解析与 Ctrl+Shift+D 快捷键
  const { developerMode } = useDeveloperMode();
  const compilerStatus = useCompilerStatus();

  const overall = getOverallStats(completed, attempted);
  const pythonOverall = getPythonStats(pythonCompleted, pythonAttempted);
  const pythonRoute = location.pathname.startsWith('/python');
  const javaRoute = location.pathname.startsWith('/java');
  const visibleOverall = pythonRoute ? pythonOverall : overall;

  const selectedKey = location.pathname.startsWith('/progress') || location.pathname.endsWith('/progress')
    ? 'progress'
    : javaRoute
      ? 'java'
    : location.pathname.endsWith('/guide') || location.pathname === '/guide'
      ? 'guide'
      : location.pathname.includes('/stage/')
        ? 'problems'
        : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <div className="app-header-inner">
          <div className="brand" onClick={() => navigate(javaRoute ? '/java' : pythonRoute ? '/python' : '/')} role="presentation">
            <CodeOutlined className="brand-icon" />
            <span className="brand-name">OIworld</span>
            <Text className="brand-slogan">{javaRoute ? 'Java 基础语法靶场 · 浏览器本地运行' : pythonRoute ? 'Python 基础语法靶场 · 浏览器本地运行' : 'C++ 基础语法靶场 · 浏览器本地编译'}</Text>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            className="app-menu"
            items={[
              {
                key: 'problems',
                icon: <CodeOutlined />,
                label: <Link to={pythonRoute ? '/python/stage/1' : '/stage/1'}>学习阶段</Link>,
              },
              { key: 'java', icon: <CodeOutlined />, label: <Link to="/java">Java 靶场</Link> },
              {
                key: 'guide',
                icon: <ReadOutlined />,
                label: <Link to={pythonRoute ? '/python/guide' : '/guide'}>{pythonRoute ? 'Python 指南' : '新手指南'}</Link>,
              },
              { key: 'progress', icon: <RiseOutlined />, label: <Link to={pythonRoute ? '/python/progress' : '/progress'}>我的进度</Link> },
            ]}
          />

          <Space size={16} className="app-header-right">
            <Space.Compact className="language-switch">
              <Button
                icon={<CodeOutlined />}
                type={pythonRoute ? 'default' : 'primary'}
                onClick={() => navigate('/')}
              >
                C++ 靶场
              </Button>
              <Button
                icon={<CodeOutlined />}
                type={pythonRoute ? 'primary' : 'default'}
                className={pythonRoute ? 'python-switch-active' : undefined}
                onClick={() => navigate('/python')}
              >
                Python 靶场
              </Button>
            </Space.Compact>
            <Tooltip title="进度保存在本机浏览器，不会上传">
              <Space size={8} className="header-progress">
                <Progress
                  type="circle"
                  size={36}
                  percent={visibleOverall.percent}
                  strokeColor={pythonRoute ? '#722ed1' : '#1677ff'}
                  format={(percent) => (
                    <span style={{ fontSize: 11 }}>{percent}%</span>
                  )}
                />
                <Text className="header-stat">
                  {visibleOverall.passed}/{visibleOverall.total}
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
            {!pythonRoute && (
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
            )}
          </Space>
        </div>
      </Header>

      <Content className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/python" element={<PythonHomePage />} />
          <Route path="/python/guide" element={<PythonGuidePage />} />
          <Route path="/python/stage/:stageNumber" element={<PythonStagePage />} />
          <Route path="/python/problem/:problemId" element={<PythonProblemPage />} />
          <Route path="/python/progress" element={<PythonProgressPage />} />
          <Route path="/java" element={<JavaArenaPage />} />
          <Route path="/stage/:stageNumber" element={<StagePage />} />
          <Route path="/problem/:problemId" element={<ProblemPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Content>

      <Footer className="app-footer">
        <Space split="·" wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {javaRoute ? 'OIworld · 从 0 开始的 Java 学习靶场（Beta）' : pythonRoute ? 'OIworld · 从 0 开始的 Python 学习靶场' : 'OIworld · YHSome的从0开始的C++ 学习靶场'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {javaRoute ? '代码在你的浏览器中由 Doppio JVM（JavaScript）本地编译运行，不会被上传' : pythonRoute ? '代码在你的浏览器中由 Python（Pyodide / WebAssembly）本地运行，不会被上传' : '代码在你的浏览器中由 clang（WebAssembly 版）本地编译，不会被上传'}
          </Text>
          <Tag color="default" style={{ fontSize: 11 }}>
            无文件读写 / 无网络 / 仅标准输入输出
          </Tag>
        </Space>
      </Footer>
    </Layout>
  );
}
