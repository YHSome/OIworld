import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { ProblemStatus } from '../types/problem';

const CONFIG: Record<
  ProblemStatus,
  { color: string; text: string; icon: ReactNode }
> = {
  passed: { color: 'success', text: '已通过', icon: <CheckCircleOutlined /> },
  failed: { color: 'error', text: '未通过', icon: <CloseCircleOutlined /> },
  todo: { color: 'default', text: '未做', icon: <MinusCircleOutlined /> },
};

/** 题目完成状态标签：未做 / 已通过 / 未通过 */
export function StatusTag({ status }: { status: ProblemStatus }) {
  const config = CONFIG[status];
  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
}
