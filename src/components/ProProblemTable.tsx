import { Button, Table, Tag, Typography } from 'antd';
import { LockOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import {
  PRO_DIFFICULTY_COLOR,
  type ProProblemEntry,
  getProProblemStatus,
  isProProblemUnlocked,
} from '../pro/data';
import { useProProgressStore } from '../pro/useProProgressStore';
import { useDeveloperMode } from '../hooks/useDeveloperMode';
import { StatusTag } from './StatusTag';
import { LuoguCodeCell } from './LuoguCodeCell';

const { Text } = Typography;

interface Props {
  entries: ProProblemEntry[];
  showStage?: boolean;
}

interface Row extends ProProblemEntry {
  key: string;
}

export function ProProblemTable({ entries, showStage = false }: Props) {
  const navigate = useNavigate();
  const completed = useProProgressStore((state) => state.completedProblems);
  const attempted = useProProgressStore((state) => state.attemptedProblems);
  const { developerMode } = useDeveloperMode();

  const open = (id: string, unlocked: boolean) => {
    if (unlocked) navigate(`/pro/problem/${id}`);
  };

  const rows: Row[] = entries.map((entry) => ({
    ...entry,
    key: entry.problem.id,
  }));

  const columns: ColumnsType<Row> = [
    {
      title: '状态',
      width: 100,
      render: (_, row) => (
        <StatusTag
          status={getProProblemStatus(row.problem.id, completed, attempted)}
        />
      ),
    },
    {
      title: '题目',
      render: (_, row) => {
        const unlocked = isProProblemUnlocked(
          row.problem.id,
          completed,
          developerMode,
        );
        return (
          <span>
            {!unlocked && (
              <LockOutlined style={{ color: '#bfbfbf', marginRight: 7 }} />
            )}
            <a
              onClick={(event) => {
                event.stopPropagation();
                open(row.problem.id, unlocked);
              }}
              style={{ color: unlocked ? undefined : '#bfbfbf' }}
            >
              {row.problem.title}
            </a>
            <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
              {row.problem.id}
            </Text>
          </span>
        );
      },
    },
    {
      title: '难度',
      width: 92,
      render: (_, row) => (
        <Tag color={PRO_DIFFICULTY_COLOR[row.problem.difficulty]}>
          {row.problem.difficulty}
        </Tag>
      ),
    },
    {
      title: '知识点',
      width: 170,
      render: (_, row) => (
        <Text type="secondary">{row.problem.knowledge_point}</Text>
      ),
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
      title: '洛谷',
      width: 110,
      render: (_, row) => <LuoguCodeCell code={row.problem.luogu_code} />,
    },
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
        const unlocked = isProProblemUnlocked(
          row.problem.id,
          completed,
          developerMode,
        );
        return unlocked ? (
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              open(row.problem.id, true);
            }}
          >
            开始做题
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
      onRow={(row) => {
        const unlocked = isProProblemUnlocked(
          row.problem.id,
          completed,
          developerMode,
        );
        return {
          onClick: () => open(row.problem.id, unlocked),
          style: { cursor: unlocked ? 'pointer' : 'not-allowed' },
        };
      }}
    />
  );
}
