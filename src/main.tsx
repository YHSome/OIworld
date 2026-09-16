import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
// 必须在任何 <Editor /> 渲染之前完成 Monaco 的本地化配置
import './editor/monaco';
import './styles.css';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('找不到 #root 容器');
}

/**
 * 本地开发用 BrowserRouter（地址栏干净）；
 * 部署到 GitHub Pages 这类静态托管时设 VITE_HASH_ROUTER=1 换成 HashRouter，
 * 这样刷新或直接打开 /problem/s1-p1 这类深链不会 404。
 */
const Router =
  import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;

createRoot(container).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <Router>
          <App />
        </Router>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
