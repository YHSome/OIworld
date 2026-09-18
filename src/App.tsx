import { Button, Layout, Menu, Progress, Space, Tag, Tooltip, Typography } from 'antd';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  CloudUploadOutlined,
  CodeOutlined,
  ReadOutlined,
  RiseOutlined,
  ThunderboltOutlined,
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
import { JavaHomePage } from './pages/JavaHomePage';
import { JavaStagePage } from './pages/JavaStagePage';
import { JavaProblemPage } from './pages/JavaProblemPage';
import { JavaProgressPage } from './pages/JavaProgressPage';
import { JavaGuidePage } from './pages/JavaGuidePage';
import { ProHomePage } from './pages/ProHomePage';
import { ProStagePage } from './pages/ProStagePage';
import { ProProblemPage } from './pages/ProProblemPage';
import { ProProgressPage } from './pages/ProProgressPage';
import { LuoguPage } from './pages/LuoguPage';
import { useProgressStore } from './store/useProgressStore';
import { getOverallStats } from './data';
import { useDeveloperMode } from './hooks/useDeveloperMode';
import { usePythonProgressStore } from './python/usePythonProgressStore';
import { getPythonStats } from './python/data';
import { useJavaProgressStore } from './java/useJavaProgressStore';
import { getJavaStats } from './java/data';
import { JAVA_RUNTIME_FOOTER } from './java/runtimeInfo';
import { useProProgressStore } from './pro/useProProgressStore';
import { getProStats } from './pro/data';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);
  const pythonCompleted = usePythonProgressStore((state) => state.completedProblems);
  const pythonAttempted = usePythonProgressStore((state) => state.attemptedProblems);
  const javaCompleted = useJavaProgressStore((state) => state.completedProblems);
  const javaAttempted = useJavaProgressStore((state) => state.attemptedProblems);
  const proCompleted = useProProgressStore((state) => state.completedProblems);
  const proAttempted = useProProgressStore((state) => state.attemptedProblems);
  // 在这里调用一次：安装 ?dev=1 解析与 Ctrl+Shift+D 快捷键
  const { developerMode } = useDeveloperMode();

  const overall = getOverallStats(completed, attempted);
  const pythonOverall = getPythonStats(pythonCompleted, pythonAttempted);
  const javaOverall = getJavaStats(javaCompleted, javaAttempted);
  const proOverall = getProStats(proCompleted, proAttempted);

  /**
   * 判断当前属于哪个靶场。
   *
   * 注意不能用 `pathname.startsWith('/pro')`：C++ 靶场的题目页是 `/problem/s1-p1`，
   * 它同样以 `/pro` 开头，会被误判成 Pro 靶场（顶栏标语、进度环、页脚都会串台）。
   * 所以必须按「路径段」比较。
   */
  const pathname = location.pathname;
  const inTrack = (prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);
  const pythonRoute = inTrack('/python');
  const javaRoute = inTrack('/java');
  const proRoute = inTrack('/pro');
  /** 四个靶场各自一套页面；C++ 是默认（无前缀） */
  const cppRoute = !pythonRoute && !javaRoute && !proRoute;
  /** 洛谷账号页与靶场无关，页面上单独标注 */
  const luoguRoute = inTrack('/luogu');

  const selectedKey = luoguRoute
    ? 'luogu'
    : pathname.endsWith('/progress')
      ? 'progress'
      : pathname.endsWith('/guide')
        ? 'guide'
        : pathname.includes('/stage/')
          ? 'problems'
          : '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <div className="app-header-inner">
          <div
            className="brand"
            onClick={() =>
              navigate(
                proRoute ? '/pro' : javaRoute ? '/java' : pythonRoute ? '/python' : '/',
              )
            }
            role="presentation"
          >
            <CodeOutlined className="brand-icon" />
            <span className="brand-name">OIworld</span>
            <Text className="brand-slogan">
              {luoguRoute
                ? '洛谷远程提交 · 浏览器内代发请求'
                : proRoute
                  ? 'Pro 靶场 · 数据结构与进阶算法'
                  : javaRoute
                    ? 'Java 基础语法靶场 · 浏览器本地运行'
                    : pythonRoute
                      ? 'Python 基础语法靶场 · 浏览器本地运行'
                      : 'C++ 基础语法靶场 · 浏览器本地编译'}
            </Text>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            className="app-menu"
            items={[
              {
                key: 'problems',
                icon: <CodeOutlined />,
                label: (
                  <Link
                    to={
                      proRoute
                        ? '/pro/stage/1'
                        : javaRoute
                          ? '/java/stage/1'
                          : pythonRoute
                            ? '/python/stage/1'
                            : '/stage/1'
                    }
                  >
                    学习阶段
                  </Link>
                ),
              },
              ...(proRoute
                ? []
                : [
                    {
                      key: 'guide',
                      icon: <ReadOutlined />,
                      label: (
                        <Link
                          to={
                            javaRoute
                              ? '/java/guide'
                              : pythonRoute
                                ? '/python/guide'
                                : '/guide'
                          }
                        >
                          {javaRoute ? 'Java 指南' : pythonRoute ? 'Python 指南' : '新手指南'}
                        </Link>
                      ),
                    },
                  ]),
              {
                key: 'progress',
                icon: <RiseOutlined />,
                label: (
                  <Link
                    to={
                      proRoute
                        ? '/pro/progress'
                        : javaRoute
                          ? '/java/progress'
                          : pythonRoute
                            ? '/python/progress'
                            : '/progress'
                    }
                  >
                    我的进度
                  </Link>
                ),
              },
              {
                key: 'luogu',
                icon: <CloudUploadOutlined />,
                label: <Link to="/luogu">洛谷账号</Link>,
              },
            ]}
          />

          <Space size={16} className="app-header-right">
            <Space.Compact className="language-switch">
              <Button
                icon={<CodeOutlined />}
                type={cppRoute ? 'primary' : 'default'}
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
              <Button
                icon={<CodeOutlined />}
                type={javaRoute ? 'primary' : 'default'}
                className={javaRoute ? 'java-switch-active' : undefined}
                onClick={() => navigate('/java')}
              >
                Java 靶场
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                type={proRoute ? 'primary' : 'default'}
                className={proRoute ? 'pro-switch-active' : undefined}
                onClick={() => navigate('/pro')}
              >
                Pro 靶场
              </Button>
            </Space.Compact>
            <Tooltip title="进度保存在本机浏览器，不会上传">
              <Space size={8} className="header-progress">
                <Progress
                  type="circle"
                  size={36}
                  percent={
                    proRoute
                      ? proOverall.percent
                      : javaRoute
                        ? javaOverall.percent
                        : pythonRoute
                          ? pythonOverall.percent
                          : overall.percent
                  }
                  strokeColor={
                    proRoute
                      ? '#d4380d'
                      : javaRoute
                        ? '#fa8c16'
                        : pythonRoute
                          ? '#722ed1'
                          : '#1677ff'
                  }
                  format={(percent) => (
                    <span style={{ fontSize: 11 }}>{percent}%</span>
                  )}
                />
                <Text className="header-stat">
                  {proRoute
                    ? `${proOverall.passed}/${proOverall.total}`
                    : javaRoute
                      ? `${javaOverall.passed}/${javaOverall.total}`
                      : pythonRoute
                        ? `${pythonOverall.passed}/${pythonOverall.total}`
                        : `${overall.passed}/${overall.total}`}
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
          <Route path="/java" element={<JavaHomePage />} />
          <Route path="/java/guide" element={<JavaGuidePage />} />
          <Route path="/java/stage/:stageNumber" element={<JavaStagePage />} />
          <Route path="/java/problem/:problemId" element={<JavaProblemPage />} />
          <Route path="/java/progress" element={<JavaProgressPage />} />
          <Route path="/pro" element={<ProHomePage />} />
          <Route path="/pro/stage/:stageNumber" element={<ProStagePage />} />
          <Route path="/pro/problem/:problemId" element={<ProProblemPage />} />
          <Route path="/pro/progress" element={<ProProgressPage />} />
          <Route path="/luogu" element={<LuoguPage />} />
          <Route path="/stage/:stageNumber" element={<StagePage />} />
          <Route path="/problem/:problemId" element={<ProblemPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Content>

      <Footer className="app-footer">
        <Space split="·" wrap>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {luoguRoute
              ? 'OIworld · 洛谷远程提交'
              : proRoute
                ? 'OIworld · Pro 靶场（数据结构与进阶算法）'
                : javaRoute
                  ? 'OIworld · 从 0 开始的 Java 学习靶场（Beta）'
                  : pythonRoute
                    ? 'OIworld · 从 0 开始的 Python 学习靶场'
                    : 'OIworld · YHSome的从0开始的C++ 学习靶场'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {luoguRoute
              ? '提交由你浏览器里的桥接脚本直接发给洛谷；本站没有服务器，代码与 Cookie 都不离开你的浏览器'
              : proRoute
                ? '题目自撰并在浏览器本地编译运行；洛谷同类型题目可一键远程提交（不抓取洛谷题面）'
                : javaRoute
                ? JAVA_RUNTIME_FOOTER
                : pythonRoute
                  ? '代码在你的浏览器中由 Python（Pyodide / WebAssembly）本地运行，不会被上传'
                  : '代码在你的浏览器中由 clang（WebAssembly 版）本地编译，不会被上传'}
          </Text>
          <Tag color="default" style={{ fontSize: 11 }}>
            无文件读写 / 无网络 / 仅标准输入输出
          </Tag>
        </Space>
      </Footer>
    </Layout>
  );
}
