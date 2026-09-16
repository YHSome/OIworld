import { Button, Progress, Space, Table, Tag, Typography } from 'antd';
import { LockOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { ProblemEntry } from '../data';
import {
  DIFFICULTY_COLOR,
  getProblemStatus,
  isProblemUnlocked,
} from '../data';
import { useProgressStore } from '../store/useProgressStore';
import { useDeveloperMode } from '../hooks/useDeveloperMode';
import { StatusTag } from './StatusTag';

const { Text } = Typography;

interface ProblemTableProps {
  entries: ProblemEntry[];
  /** 是否显示“所属阶段”列 */
  showStage?: boolean;
  /** 空数据提示 */
  emptyText?: string;
}

interface Row extends ProblemEntry {
  key: string;
}

export function ProblemTable({
  entries,
  showStage = false,
  emptyText = '没有符合条件的题目',
}: ProblemTableProps) {
  const navigate = useNavigate();
  const completed = useProgressStore((state) => state.completedProblems);
  const attempted = useProgressStore((state) => state.attemptedProblems);
  // 闯关规则固定生效；只有开发者模式可以解锁全部题目
  const { developerMode } = useDeveloperMode();

  const rows: Row[] = entries.map((entry) => ({
    ...entry,
    key: entry.problem.id,
  }));

  const open = (id: string, unlocked: boolean) => {
    if (!unlocked) return;
    navigate(`/problem/${id}`);
  };

  const columns: ColumnsType<Row> = [
    {
      title: '状态',
      width: 100,
      render: (_, row) => (
        <StatusTag
          status={getProblemStatus(
            row.problem.id,
            completed,
            attempted,
          )}
        />
      ),
    },
    {
      title: '题目',
      render: (_, row) => {
        const unlocked = isProblemUnlocked(
          row.problem.id,
          completed,
          developerMode,
        );
        return (
          <Space size={6}>
            {!unlocked && <LockOutlined style={{ color: '#bfbfbf' }} />}
            <a
              onClick={() => open(row.problem.id, unlocked)}
              style={{ color: unlocked ? undefined : '#bfbfbf' }}
            >
              {row.problem.title}
            </a>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.problem.id}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '难度',
      width: 92,
      render: (_, row) => (
        <Tag color={DIFFICULTY_COLOR[row.problem.difficulty]}>
          {row.problem.difficulty}
        </Tag>
      ),
    },
    {
      title: '知识点',
      width: 170,
      render: (_, row) => <Text type="secondary">{row.problem.knowledge_point}</Text>,
    },
    ...(showStage
      ? [
          {
            title: '所属阶段',
            width: 190,
            render: (_: unknown, row: Row) => (
              <Text type="secondary">{row.stage.title}</Text>
            ),
          } as ColumnsType<Row>[number],
        ]
      : []),
    {
      title: '测试点',
      width: 80,
      render: (_, row) => (
        <Text type="secondary">{row.problem.test_cases.length}</Text>
      ),
    },
    {
      title: '操作',
      width: 110,
      render: (_, row) => {
        const unlocked = isProblemUnlocked(
          row.problem.id,
          completed,
          developerMode,
        );
        const done = completed.includes(row.problem.id);
        return unlocked ? (
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => open(row.problem.id, true)}
          >
            {done ? '再做一次' : '开始做题'}
          </Button>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            待解锁
          </Text>
        );
      },
    },
  ];

  return (
    <Table<Row>
      rowKey="key"
      size="middle"
      columns={columns}
      dataSource={rows}
      pagination={false}
      locale={{
        emptyText: (
          <div style={{ padding: '24px 0' }}>
            <Text type="secondary">{emptyText}</Text>
          </div>
        ),
      }}
      onRow={(row) => ({
        onClick: () =>
          open(
            row.problem.id,
            isProblemUnlocked(row.problem.id, completed, developerMode),
          ),
        style: {
          cursor: isProblemUnlocked(row.problem.id, completed, developerMode)
            ? 'pointer'
            : 'not-allowed',
        },
      })}
    />
  );
}

/** 阶段卡片上的进度条 */
export function StageProgressBar({ percent }: { percent: number }) {
  return <Progress percent={percent} size="small" strokeColor="#1677ff" />;
}
