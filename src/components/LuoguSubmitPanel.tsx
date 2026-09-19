/**
 * 题目页里的「提交到洛谷」面板（书签提交版）。
 *
 * 本站不直接访问洛谷：浏览器的同源策略让页面读不到洛谷的响应，
 * `Cookie` 又是 fetch/XHR 的禁止请求头，所以提交由**书签脚本**在洛谷自己的页面里完成。
 *
 * 面板做三件事：
 *  1. 记住本题要提交的洛谷题号（题库已对齐的题会自动填好），以及语言 / O2 开关；
 *  2. 点「书签提交」→ 把代码编码进剪贴板与地址栏 → 打开洛谷对应题目页；
 *  3. 在洛谷那个标签页点一下书签栏里的「OIworld 提交」，代码就交上去了，
 *     评测结果由书签浮层直接显示（本站在没有扩展的情况下读不到洛谷的评测结果）。
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert, App as AntApp, Button, Input, Select, Space, Switch, Tooltip, Typography } from 'antd';
import {
  BookOutlined,
  CopyOutlined,
  ExportOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  LUOGU_DEFAULT_LANGUAGE,
  getLuoguLanguageOptions,
  type LuoguTrack,
} from '../luogu/languages';
import {
  buildLuoguSubmitUrl,
  isValidLuoguPid,
  luoguProblemUrl,
  luoguRecordListUrl,
} from '../luogu/service';
import { useLuoguStore } from '../luogu/useLuoguStore';

const { Text, Paragraph } = Typography;

interface LuoguSubmitPanelProps {
  /** 本站题目 id，用于记住"这道题对应洛谷哪一题" */
  problemId: string;
  /** 题目自带的洛谷题号（已对齐的题会作为默认值预填） */
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
   * Pro 已对齐的题是"洛谷对应题目"，基础靶场是"洛谷同类型练习"。
   */
  pidLabel?: string;
  /** 点了「书签提交」之后的回调（例如标记本题为"已提交"） */
  onOpenLuogu?: (pid: string) => void;
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
  onOpenLuogu,
}: LuoguSubmitPanelProps) {
  const { message: messageApi } = AntApp.useApp();

  const storedPid = useLuoguStore((state) => state.problemIds[problemId] ?? '');
  const setProblemId = useLuoguStore((state) => state.setProblemId);
  const enableO2 = useLuoguStore((state) => state.enableO2);
  const setEnableO2 = useLuoguStore((state) => state.setEnableO2);
  const storedLanguage = useLuoguStore((state) => state.languageByTrack[track]);
  const setLanguage = useLuoguStore((state) => state.setLanguage);

  const [pidInput, setPidInput] = useState(storedPid || defaultPid);
  const [showSteps, setShowSteps] = useState(false);

  const language = storedLanguage ?? LUOGU_DEFAULT_LANGUAGE[track];
  const pid = pidInput.trim().toUpperCase();
  const pidValid = isValidLuoguPid(pid);

  /** 题目切换时，重置面板状态 */
  useEffect(() => {
    const saved = useLuoguStore.getState().problemIds[problemId] ?? '';
    setPidInput(saved || defaultPid);
  }, [problemId, defaultPid]);

  const commitPid = useCallback(
    (value: string) => {
      setProblemId(problemId, value);
    },
    [problemId, setProblemId],
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      messageApi.success('代码已复制，去洛谷粘贴即可');
    } catch {
      messageApi.warning('浏览器不允许自动复制，请手动选中编辑器里的代码');
    }
  };

  /**
   * 书签提交：把代码编码后放进剪贴板（代码太长时靠它传过去），
   * 再打开洛谷对应题目页，用户在那边点一下书签即可。
   */
  const handleBookmarkSubmit = async () => {
    if (!pidValid) {
      messageApi.warning('先填一个正确的洛谷题号，例如 P1001');
      return;
    }
    if (!code.trim()) {
      messageApi.warning('代码是空的，先写点东西再提交');
      return;
    }
    const { url, payload, inUrl } = buildLuoguSubmitUrl(pid, {
      code,
      lang: language,
      enableO2,
    });
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // 复制失败也不致命：载荷一般同时写在地址里
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowSteps(true);
    messageApi.info(
      inUrl
        ? '已打开洛谷题目页：在那个标签页点一下书签栏里的「OIworld 提交」即可'
        : '代码较长已放进剪贴板：在打开的洛谷页面点一下书签栏里的「OIworld 提交」即可',
      6,
    );
    onOpenLuogu?.(pid);
  };

  return (
    <div className="luogu-panel">
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Text strong>
            <BookOutlined /> 提交到洛谷（书签提交）
          </Text>
          <Button
            size="small"
            type="link"
            icon={<QuestionCircleOutlined />}
            onClick={() => setShowSteps((value) => !value)}
            style={{ paddingInline: 0 }}
          >
            {showSteps ? '收起步骤' : '怎么用？'}
          </Button>
        </Space>

        {showSteps && (
          <Alert
            type="info"
            showIcon
            message="三步把代码交到洛谷"
            description={
              <ol style={{ margin: 0, paddingInlineStart: 20, fontSize: 12 }}>
                <li>
                  先在
                  <Link to="/luogu" style={{ margin: '0 4px' }}>
                    「洛谷账号」页
                  </Link>
                  把「📤 OIworld 提交」拖到书签栏（只需一次）。
                </li>
                <li>在这里点「书签提交」：会自动复制代码并打开洛谷对应题目页。</li>
                <li>
                  在洛谷那个标签页点一下书签栏里的「OIworld 提交」，右上角浮层会直接显示评测结果
                  （AC / WA / TLE…）。
                </li>
              </ol>
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
            disabled={disabled || !pidValid}
            onClick={handleBookmarkSubmit}
          >
            书签提交
          </Button>
          <Tooltip title="不用书签也能交：复制代码，去洛谷粘贴到编辑器里手动提交">
            <Button icon={<CopyOutlined />} onClick={handleCopyCode}>
              复制代码
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

        {pidValid && defaultPid && pid === defaultPid.trim().toUpperCase() && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            题号是题库标注的{pidLabel}
            {pidLabel === '洛谷对应题目' ? '（题面已与洛谷对齐）' : '（本题输入输出格式可能与洛谷不同）'}
            ，已自动填好；也可以改成别的洛谷题号。
          </Text>
        )}

        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
          提交由你浏览器里的<Text strong>书签脚本</Text>在洛谷页面上完成，
          本站既没有服务器、也不会经手你的代码与登录凭据。
          评测结果在洛谷页面右上角的浮层里显示；
          <Text type="secondary">
            {' '}
            本站在不装浏览器扩展的情况下读不到洛谷的评测结果与提交记录 ——
            想核对记录可以
            <a
              href={luoguRecordListUrl(pidValid ? pid : 'P1001')}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 4 }}
            >
              去洛谷看这道题的提交记录
            </a>
            。
          </Text>
        </Paragraph>
      </Space>
    </div>
  );
}
