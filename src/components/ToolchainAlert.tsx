/**
 * 编译器状态提示条：首次进入题目页会加载约 90MB 的 clang/lld WebAssembly 工具链，
 * 这里把加载过程可视化，避免用户以为页面卡死。
 *
 * 只在题目页使用（顶栏不再显示状态标签：未进入题目时编译器本来就还没开始加载，
 * 常驻一个"加载中"的标签只会让人困惑）。
 */

import { Alert, Button, Progress, Space, Typography } from 'antd';
import type { CompilerStatus } from '../compiler/client';
import { isToolchainReady } from '../hooks/useCompiler';

const { Text } = Typography;

const SOURCE_TEXT: Record<CompilerStatus['source'], string> = {
  env: '自定义地址',
  local: '本站静态资源',
  cdn: 'jsDelivr CDN',
  unknown: '未知来源',
};

interface ToolchainAlertProps {
  status: CompilerStatus;
  onRetry: () => void;
}

export function ToolchainAlert({ status, onRetry }: ToolchainAlertProps) {
  if (isToolchainReady(status.phase)) {
    return null;
  }

  if (status.phase === 'failed') {
    return (
      <Alert
        type="error"
        showIcon
        message="编译器加载失败"
        description={
          <Space direction="vertical">
            <Text>{status.message}</Text>
            <Text type="secondary">
              请检查网络连接后重试；若长期无法访问 CDN，可执行
              <Text code>npm run setup:toolchain</Text>
              把编译器放到本地 <Text code>public/toolchain</Text> 目录。
            </Text>
            <Button size="small" onClick={onRetry}>
              重新加载
            </Button>
          </Space>
        }
        style={{ marginBottom: 12 }}
      />
    );
  }

  const percent = status.download?.percent;
  return (
    <Alert
      type="info"
      showIcon
      message={
        <Space>
          <span>{status.message || '正在准备 C++ 编译器…'}</span>
          {status.base && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              来源：{SOURCE_TEXT[status.source]}
            </Text>
          )}
        </Space>
      }
      description={
        <div>
          <Progress
            percent={percent ?? 0}
            status="active"
            strokeColor="#1677ff"
            size="small"
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            首次使用需要下载约 90MB 的编译器（clang + wasm-ld + C++ 标准库），
            下载后浏览器会缓存，之后打开就是秒开。编译在你的浏览器本地完成，
            代码不会上传到任何服务器。
          </Text>
        </div>
      }
      style={{ marginBottom: 12 }}
    />
  );
}
