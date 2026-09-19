/**
 * 题目页里的「提交到洛谷」面板。
 *
 * 它能做的事（全部在你的浏览器里完成，本站没有服务器）：
 *  - 记住本题对应的洛谷题号（例如 P1001），支持直接改；
 *  - 选择洛谷评测语言、是否开 O2；
 *  - 一键把当前代码提交到洛谷，并实时轮询评测结果（AC / WA / TLE ...）；
 *  - 拉取该题在洛谷的提交记录列表（vjudge 那种"远程提交记录"）；
 *  - 没装桥接脚本时，退化成"复制代码 + 打开洛谷题目页"的手动流程。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  App as AntApp,
  Button,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  BookOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  ExportOutlined,
  LinkOutlined,
  ReloadOutlined,
  SendOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  LUOGU_DEFAULT_LANGUAGE,
  getLuoguLanguageName,
  getLuoguLanguageOptions,
  type LuoguTrack,
} from '../luogu/languages';
import {
  describeLuoguError,
  isLuoguBridgeError,
} from '../luogu/bridge';
import {
  fetchLuoguRecords,
  isValidLuoguPid,
  luoguProblemUrl,
  luoguRecordListUrl,
  luoguRecordUrl,
  pollLuoguRecord,
  submitToLuogu,
} from '../luogu/service';
import {
  formatLuoguCost,
  formatLuoguTime,
  getLuoguStatus,
} from '../luogu/verdict';
import { useLuoguStore } from '../luogu/useLuoguStore';
import { useLuoguBridge } from '../luogu/useLuoguBridge';
import { buildBookmarkletUrl } from '../luogu/bookmarklet';
import type { LuoguRecord } from '../luogu/types';

const { Text, Paragraph } = Typography;

interface LuoguSubmitPanelProps {
  /** 本站题目 id，用于记住"这道题对应洛谷哪一题" */
  problemId: string;
  /** 题目自带的洛谷题号（有则作为默认值） */
  defaultPid?: string;
  /** 题目自带的洛谷搜索关键词（没有题号时用来给跳转链接） */
  keyword?: string;
  /** 当前编辑器里的代码 */
  code: string;
  /** 默认语言所属靶场 */
  track?: LuoguTrack;
  /** 题目未解锁等情况下禁用提交 */
  disabled?: boolean;
  disabledReason?: string;
  /**
   * 预填题号的来源说明。
   * Pro 靶场是"洛谷对应题目"，三个基础靶场是"洛谷同类型练习"（不是原题移植）。
   */
  pidLabel?: string;
}

export function LuoguSubmitPanel({
  problemId,
  defaultPid = '',
  keyword = '',
  code,
  track = 'cpp',
  disabled = false,
  disabledReason,
  pidLabel = '洛谷对应题目',
}: LuoguSubmitPanelProps) {
  const { message: messageApi } = AntApp.useApp();
  const bridge = useLuoguBridge();

  const storedPid = useLuoguStore((state) => state.problemIds[problemId] ?? '');
  const setProblemId = useLuoguStore((state) => state.setProblemId);
  const enableO2 = useLuoguStore((state) => state.enableO2);
  const setEnableO2 = useLuoguStore((state) => state.setEnableO2);
  const storedLanguage = useLuoguStore((state) => state.languageByTrack[track]);
  const setLanguage = useLuoguStore((state) => state.setLanguage);
  const bound = useLuoguStore((state) => Boolean(state.boundAt));
  const clientId = useLuoguStore((state) => state.clientId);
  const boundUid = useLuoguStore((state) => state.uid);
  const mode = useLuoguStore((state) => state.mode);

  const [pidInput, setPidInput] = useState(storedPid || defaultPid);
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState<LuoguRecord | null>(null);
  const [records, setRecords] = useState<LuoguRecord[] | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const pollToken = useRef(0);

  const language = storedLanguage ?? LUOGU_DEFAULT_LANGUAGE[track];
  const pid = pidInput.trim().toUpperCase();
  const pidValid = isValidLuoguPid(pid);

  /** 题目切换时，重置面板状态 */
  useEffect(() => {
    const saved = useLuoguStore.getState().problemIds[problemId] ?? '';
    setPidInput(saved || defaultPid);
    setRecord(null);
    setRecords(null);
    setRecordsError('');
    pollToken.current += 1;
  }, [problemId, defaultPid]);

  const commitPid = useCallback(
    (value: string) => {
      setProblemId(problemId, value);
    },
    [problemId, setProblemId],
  );

  /**
   * 拉取该题的提交记录。
   * @param silent 静默模式：用于提交成功后自动刷新，不弹提示、失败也不打断用户
   */
  const loadRecords = useCallback(
    async (silent = false) => {
      if (!pidValid) {
        if (!silent) messageApi.warning('先填一个正确的洛谷题号，例如 P1001');
        return;
      }
      setLoadingRecords(true);
      if (!silent) setRecordsError('');
      try {
        const list = await fetchLuoguRecords(pid);
        setRecords(list);
        if (!silent && list.length === 0) {
          messageApi.info('洛谷没有返回提交记录（可能这个账号还没交过这题）');
        }
      } catch (error) {
        if (silent) return;
        setRecords([]);
        setRecordsError(describeLuoguError(error));
      } finally {
        setLoadingRecords(false);
      }
    },
    [messageApi, pid, pidValid],
  );

  const handleSubmit = async () => {
    if (!pidValid) {
      messageApi.warning('洛谷题号格式不对，应该形如 P1001');
      return;
    }
    if (!code.trim()) {
      messageApi.warning('代码是空的，先写点东西再提交');
      return;
    }
    setSubmitting(true);
    setRecord(null);
    try {
      const result = await submitToLuogu({ pid, code, lang: language, enableO2 });
      messageApi.success(`已提交到洛谷，评测记录 R${result.rid}`);
      // 立刻开始轮询评测结果
      const token = pollToken.current + 1;
      pollToken.current = token;
      const finalRecord = await pollLuoguRecord(result.rid, {
        onUpdate: (next) => {
          if (pollToken.current === token) setRecord(next);
        },
      });
      if (pollToken.current === token && finalRecord) {
        const meta = getLuoguStatus(finalRecord.status);
        if (finalRecord.status === 12) messageApi.success('洛谷评测结果：AC 通过！');
        else messageApi.info(`洛谷评测结果：${meta.short}（${meta.label}）`);
      }
      // 评测出结果时洛谷那边也已经记下这条提交了，顺手刷新一次记录列表
      await loadRecords(true);
    } catch (error) {
      if (isLuoguBridgeError(error) && error.code === 'NOT_LOGGED_IN') {
        messageApi.error('洛谷认为当前没有登录，请先登录洛谷或在本站绑定 Cookie');
      } else {
        messageApi.error(`提交失败：${describeLuoguError(error)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      messageApi.success('代码已复制，去洛谷粘贴即可');
    } catch {
      messageApi.warning('浏览器不允许自动复制，请手动选中编辑器里的代码');
    }
  };

  /**
   * 书签提交（免安装扩展）：把载荷放进剪贴板，并打开洛谷对应题目页，
   * 用户在洛谷那个标签页点一下书签即可完成提交。
   */
  const handleBookmarklet = async () => {
    if (!pidValid) {
      messageApi.warning('先填一个正确的洛谷题号，例如 P1001');
      return;
    }
    const { url, payload, inUrl } = buildBookmarkletUrl(pid, {
      code,
      lang: language,
      enableO2,
    });
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // 复制失败也不致命：载荷一般同时在地址里
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    messageApi.info(
      inUrl
        ? '已打开洛谷题目页：在那个标签页点一下书签栏里的「OIworld 提交」即可'
        : '代码较长已放进剪贴板：在打开的洛谷页面点一下书签栏里的「OIworld 提交」即可',
      6,
    );
  };

  const status = record ? getLuoguStatus(record.status) : null;
  const recordsColumns = useMemo(
    () => [
      {
        title: '状态',
        dataIndex: 'status',
        width: 92,
        render: (value: number) => {
          const meta = getLuoguStatus(value);
          return (
            <Tooltip title={meta.label}>
              <Tag color={meta.color} style={{ marginInlineEnd: 0 }}>
                {meta.short}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: '分数',
        dataIndex: 'score',
        width: 64,
        render: (value?: number) => (typeof value === 'number' ? value : '—'),
      },
      {
        title: '耗时 / 内存',
        key: 'cost',
        width: 150,
        render: (_: unknown, item: LuoguRecord) => formatLuoguCost(item) || '—',
      },
      {
        title: '语言',
        dataIndex: 'language',
        width: 110,
        render: (value?: number) => getLuoguLanguageName(value),
      },
      {
        title: '提交时间',
        dataIndex: 'submitTime',
        width: 160,
        render: (value?: number) => formatLuoguTime(value) || '—',
      },
      {
        title: '',
        key: 'action',
        width: 64,
        render: (_: unknown, item: LuoguRecord) => (
          <a href={luoguRecordUrl(item.id)} target="_blank" rel="noreferrer">
            记录
          </a>
        ),
      },
    ],
    [],
  );

  return (
    <div className="luogu-panel">
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Text strong>
            <CloudUploadOutlined /> 提交到洛谷
          </Text>
          <Space size={6}>
            {bridge.state === 'ready' ? (
              <Tooltip title={`桥接脚本 v${bridge.info?.version ?? '?'} 已就绪`}>
                <Tag color="green" style={{ marginInlineEnd: 0 }}>
                  桥已连接
                </Tag>
              </Tooltip>
            ) : bridge.state === 'checking' ? (
              <Tag style={{ marginInlineEnd: 0 }}>检测桥…</Tag>
            ) : (
              <Tooltip title="需要安装一次桥接脚本，之后所有提交都在你自己的浏览器里完成">
                <Tag color="orange" style={{ marginInlineEnd: 0 }}>
                  未装桥
                </Tag>
              </Tooltip>
            )}
            {bound ? (
              <Tooltip title={mode === 'cookie' ? '已绑定 Cookie，用它提交' : '使用浏览器里的洛谷登录会话'}>
                <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                  {mode === 'cookie' ? '已绑定账号' : '浏览器会话'}
                </Tag>
              </Tooltip>
            ) : null}
          </Space>
        </Space>

        {bridge.state === 'missing' && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="还不能自动提交：需要先装一次「洛谷桥接脚本」"
            description={
              <Space direction="vertical" size={4}>
                <Text style={{ fontSize: 12 }}>
                  浏览器的同源策略不允许本站页面直接请求洛谷（洛谷的响应没有 CORS 头，
                  而且 <Text code>Cookie</Text> 是网页 JS 的禁止请求头）。
                  装一个油猴脚本由扩展代发请求，就可以像 vjudge 那样提交：
                  你的代码与 Cookie 都不会离开你的浏览器。
                </Text>
                <Link to="/luogu">前往「洛谷账号」页安装并绑定 →</Link>
                <Text style={{ fontSize: 12 }}>
                  不想装扩展也可以：在「洛谷账号」页装一次<Text strong>书签提交</Text>，
                  或者直接用下面的「复制代码 / 书签提交」按钮。
                </Text>
              </Space>
            }
          />
        )}

        <Space wrap size={8}>
          <Input
            value={pidInput}
            onChange={(event) => setPidInput(event.target.value)}
            onBlur={() => pidValid && commitPid(pid)}
            onPressEnter={() => pidValid && commitPid(pid)}
            placeholder="洛谷题号，如 P1001"
            style={{ width: 170 }}
            prefix={<LinkOutlined />}
            status={pidInput && !pidValid ? 'error' : undefined}
          />
          <Select
            value={language}
            onChange={(value) => setLanguage(track, value)}
            options={getLuoguLanguageOptions()}
            style={{ width: 168 }}
          />
          <Tooltip title="洛谷的 O2 优化开关，和洛谷提交页上的开关一致">
            <Space size={6}>
              <Switch size="small" checked={enableO2} onChange={setEnableO2} />
              <Text style={{ fontSize: 12 }}>O2</Text>
            </Space>
          </Tooltip>
        </Space>

        <Space wrap size={8}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            disabled={disabled || bridge.state !== 'ready' || !pidValid}
            onClick={handleSubmit}
          >
            提交到洛谷
          </Button>
          <Button icon={<ReloadOutlined />} loading={loadingRecords} onClick={() => loadRecords(false)}>
            刷新提交记录
          </Button>
          <Tooltip title="不用桥也能用：复制代码，打开洛谷题目页手动粘贴提交">
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              复制代码
            </Button>
          </Tooltip>
          <Tooltip title="免安装扩展：需要先把「OIworld 提交」书签拖到书签栏（在「洛谷账号」页安装）">
            <Button icon={<BookOutlined />} disabled={!pidValid} onClick={handleBookmarklet}>
              书签提交
            </Button>
          </Tooltip>
          {pidValid && (
            <Button
              type="link"
              icon={<ExportOutlined />}
              href={luoguProblemUrl(pid)}
              target="_blank"
              rel="noreferrer"
              style={{ paddingInline: 0 }}
            >
              打开洛谷 {pid}
            </Button>
          )}
        </Space>

        {disabled && disabledReason && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {disabledReason}
          </Text>
        )}

        {!pidValid && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            填一个洛谷题号（例如 <Text code>P1001</Text>），就能把当前代码交到洛谷；题号会记住。
            {keyword ? (
              <>
                {' '}
                也可以
                <a
                  href={`https://www.luogu.com.cn/problem/list?keyword=${encodeURIComponent(keyword)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 4 }}
                >
                  在洛谷搜「{keyword}」
                </a>
                。
              </>
            ) : null}
          </Text>
        )}

        {pidValid && defaultPid && pid.toUpperCase() === defaultPid.trim().toUpperCase() && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            题号是题库标注的{pidLabel}，已自动填好；也可以改成别的洛谷题号。
          </Text>
        )}

        {record && (
          <div className="luogu-result">
            <Space size={8} wrap>
              <Text style={{ fontSize: 12 }}>R{record.id}</Text>
              {status && (
                <Tag color={status.color} style={{ marginInlineEnd: 0 }}>
                  {status.short}
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                {status?.label}
                {formatLuoguCost(record) ? ` · ${formatLuoguCost(record)}` : ''}
                {typeof record.score === 'number' ? ` · ${record.score} 分` : ''}
              </Text>
              <a href={luoguRecordUrl(record.id)} target="_blank" rel="noreferrer">
                查看洛谷记录
              </a>
            </Space>
            {record.compilationResult ? (
              <Paragraph
                type="danger"
                style={{ fontSize: 12, marginTop: 6, marginBottom: 0, whiteSpace: 'pre-wrap' }}
              >
                {record.compilationResult.slice(0, 600)}
              </Paragraph>
            ) : null}
          </div>
        )}

        {loadingRecords && <Spin size="small" />}

        {recordsError && (
          <Alert type="error" showIcon message="读取提交记录失败" description={recordsError} />
        )}

        {records && records.length > 0 && (
          <Table
            size="small"
            rowKey={(item) => String(item.id)}
            columns={recordsColumns}
            dataSource={records}
            pagination={false}
            scroll={{ x: 620, y: 220 }}
          />
        )}

        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
          提交由你浏览器里的桥接脚本直接发给洛谷（接口：<Text code>POST /fe/api/problem/submit/{'{pid}'}</Text>），
          本站既没有服务器也不经手你的代码。
          {!pid && keyword ? (
            <>
              {' '}
              还没有对应题号？可以
              <a
                href={`https://www.luogu.com.cn/problem/list?keyword=${encodeURIComponent(keyword)}`}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: 4 }}
              >
                在洛谷搜索「{keyword}」
              </a>
              ，把题号填到上面即可。
            </>
          ) : null}
        </Paragraph>

        {pidValid && (
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            全部记录：
            <a
              href={luoguRecordListUrl(pid, mode === 'cookie' && boundUid ? boundUid : undefined)}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 4 }}
            >
              洛谷 {pid} 提交记录
            </a>
            {mode === 'cookie' && clientId ? '（已按绑定的账号过滤）' : ''}
          </Paragraph>
        )}
      </Space>
    </div>
  );
}
