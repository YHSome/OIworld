/**
 * 「洛谷账号」页：远程账号管理 + 桥接脚本安装指引 + 诊断。
 *
 * 交互刻意做成和 vjudge 的「远程账号管理」一致：
 *   保护 | 账号 | 状态 | 更新时间 | 操作   —— 一行一个绑定
 * 下面是可以粘贴 __client_id / _uid 的绑定表单（vjudge 也是这么让用户绑的）。
 *
 * 差别在于：vjudge 把这些 Cookie 收到它自己的服务器上、由服务器代你提交；
 * 本站没有服务器，所以由你浏览器里的桥接脚本代发请求。
 * 结果是一样的（洛谷那边看到的是你的账号在提交），但你的凭据不会离开这台机器。
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Input,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  ExportOutlined,
  EyeInvisibleOutlined,
  LinkOutlined,
  LockOutlined,
  ReloadOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  LUOGU_SCRIPT_URL,
  LUOGU_TAMPERMONKEY_URL,
  LUOGU_VIOLENTMONKEY_URL,
  useLuoguBridge,
} from '../luogu/useLuoguBridge';
import { LUOGU_DEFAULT_LANGUAGE, getLuoguLanguageName } from '../luogu/languages';
import { describeLuoguError } from '../luogu/bridge';
import { checkLuoguSession, debugLuogu, luoguProblemUrl } from '../luogu/service';
import { maskClientId, useLuoguStore } from '../luogu/useLuoguStore';
import type { LuoguSession } from '../luogu/types';

const { Title, Text, Paragraph } = Typography;

function formatBoundAt(value: number | null): string {
  if (!value) return '—';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function LuoguPage() {
  const { message: messageApi } = AntApp.useApp();
  const bridge = useLuoguBridge();

  const mode = useLuoguStore((state) => state.mode);
  const clientId = useLuoguStore((state) => state.clientId);
  const uid = useLuoguStore((state) => state.uid);
  const accountName = useLuoguStore((state) => state.accountName);
  const boundAt = useLuoguStore((state) => state.boundAt);
  const bindCookie = useLuoguStore((state) => state.bindCookie);
  const markSessionBound = useLuoguStore((state) => state.markSessionBound);
  const unbind = useLuoguStore((state) => state.unbind);

  const [clientIdInput, setClientIdInput] = useState('');
  const [uidInput, setUidInput] = useState('');
  const [session, setSession] = useState<LuoguSession | null>(null);
  const [checking, setChecking] = useState(false);
  const [binding, setBinding] = useState(false);
  const [debugOutput, setDebugOutput] = useState('');

  const bound = Boolean(boundAt);

  const handleCheckSession = useCallback(
    async (cookieOverride?: { clientId: string; uid: string }) => {
      setChecking(true);
      try {
        const result = await checkLuoguSession(cookieOverride);
        setSession(result);
        return result;
      } catch (error) {
        setSession(null);
        messageApi.error(`检测失败：${describeLuoguError(error)}`);
        return null;
      } finally {
        setChecking(false);
      }
    },
    [messageApi],
  );

  /** 用浏览器里已登录的洛谷会话绑定（最省事的方式） */
  const handleBindSession = async () => {
    const result = await handleCheckSession();
    if (!result) return;
    if (!result.loggedIn) {
      messageApi.warning(
        '你的浏览器当前没有登录洛谷。请先在新标签页登录 luogu.com.cn，或者用下面的 Cookie 方式绑定。',
      );
      return;
    }
    markSessionBound({ name: result.name, uid: result.uid });
    messageApi.success('已绑定：使用浏览器里的洛谷登录会话');
  };

  /** 用粘贴的 Cookie 绑定（vjudge 那种方式） */
  const handleBindCookie = async () => {
    const trimmedClientId = clientIdInput.trim();
    const trimmedUid = uidInput.trim();
    if (!trimmedClientId) {
      messageApi.warning('请先填写 __client_id 的值');
      return;
    }
    if (bridge.state !== 'ready') {
      messageApi.warning('请先安装并启用桥接脚本，否则无法验证 Cookie 是否有效');
      return;
    }
    setBinding(true);
    const result = await handleCheckSession({ clientId: trimmedClientId, uid: trimmedUid });
    setBinding(false);
    if (!result) return;
    if (!result.loggedIn) {
      messageApi.error(
        '这组 Cookie 洛谷不认（可能已过期、复制不完整，或复制时多带了引号/空格）。请重新从浏览器 DevTools 里复制。',
      );
      return;
    }
    bindCookie({ clientId: trimmedClientId, uid: trimmedUid, name: result.name });
    setClientIdInput('');
    setUidInput('');
    messageApi.success('绑定成功，之后提交会使用这个账号');
  };

  const handleCopyScript = async () => {
    try {
      const response = await fetch(LUOGU_SCRIPT_URL);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      messageApi.success('脚本内容已复制：在油猴面板里「添加新脚本」→ 粘贴 → 保存');
    } catch {
      messageApi.warning('复制失败，请直接打开脚本地址安装');
    }
  };

  const handleDebug = async () => {
    setDebugOutput('检测中…');
    try {
      const me = await debugLuogu('/user/setting');
      const problem = await debugLuogu('/problem/P1001');
      setDebugOutput(
        [
          `GET ${me.url} → HTTP ${me.status}`,
          me.body.slice(0, 600),
          '',
          `GET ${problem.url} → HTTP ${problem.status}`,
          problem.body.slice(0, 600),
        ].join('\n'),
      );
    } catch (error) {
      setDebugOutput(describeLuoguError(error));
    }
  };

  // 进页面自动探一次会话，省得用户多点一次按钮
  useEffect(() => {
    if (bridge.state === 'ready' && !session) {
      void handleCheckSession();
    }
    // 只在桥刚就绪时自动探一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge.state]);

  const bindingColumns = [
    {
      title: '保护',
      dataIndex: 'protect',
      width: 80,
      render: (value: string) =>
        value === 'locked' ? (
          <Tooltip title="凭据只保存在你的浏览器里">
            <LockOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        ) : (
          <Tooltip title="使用浏览器里的洛谷登录会话，本站不保存任何凭据">
            <EyeInvisibleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        ),
    },
    {
      title: '账号',
      dataIndex: 'account',
      render: (value: string, row: { key: string }) => (
        <Space size={6}>
          <CloudUploadOutlined style={{ color: '#1677ff' }} />
          <Text>{value}</Text>
          {row.key === 'cookie' && clientId ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              __client_id={maskClientId(clientId)}
            </Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (value: string, row: { key: string }) => {
        if (value === 'ok') return <Tag color="green">正常</Tag>;
        if (value === 'checking') return <Tag>检测中…</Tag>;
        if (row.key === 'cookie') return <Tag color="orange">未绑定</Tag>;
        return <Tag color="blue">可用</Tag>;
      },
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
      render: () => (
        <Space size={4}>
          <Button size="small" type="link" loading={checking} onClick={() => handleCheckSession()}>
            检测
          </Button>
          <Popconfirm
            title="解绑后需要重新绑定才能远程提交"
            okText="确认解绑"
            cancelText="取消"
            onConfirm={() => {
              unbind();
              messageApi.success('已解绑');
            }}
          >
            <Button size="small" type="link" danger>
              解绑
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const bindingRows = bound
    ? [
        {
          key: 'cookie',
          protect: 'locked',
          account:
            mode === 'cookie'
              ? `洛谷 · ${accountName || (uid ? `uid ${uid}` : '已绑定 Cookie')}`
              : `洛谷 · ${accountName || '浏览器会话'}`,
          status: session?.loggedIn === false ? 'invalid' : 'ok',
          updatedAt: formatBoundAt(boundAt),
        },
      ]
    : [];

  return (
    <div className="page">
      <Card className="luogu-hero-card" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={8}>
          <Title level={3} style={{ margin: 0 }}>
            <CloudUploadOutlined /> 洛谷账号 · 远程提交
          </Title>
          <Paragraph style={{ margin: 0 }}>
            在这里绑定你的洛谷账号，然后就可以在题目页把代码<Text strong>直接提交到洛谷</Text>，
            并在本站看到洛谷的评测结果与提交记录 —— 和 vjudge 的远程提交体验一致。
          </Paragraph>
          <Space wrap size={8}>
            <Tag color="green">代码与 Cookie 都不离开你的浏览器</Tag>
            <Tag color="blue">本站没有服务器，不收集任何数据</Tag>
            <Tag>已核实接口：POST /fe/api/problem/submit/{'{pid}'}</Tag>
          </Space>
        </Space>
      </Card>

      {/* ---------------- 状态 ---------------- */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card size="small" title="桥接脚本" className="luogu-status-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="状态">
                {bridge.state === 'ready' ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    已就绪
                  </Tag>
                ) : bridge.state === 'checking' ? (
                  <Tag>检测中…</Tag>
                ) : (
                  <Tag color="orange" icon={<WarningOutlined />}>
                    未安装
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="版本">{bridge.info?.version ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="作用">
                <Text style={{ fontSize: 12 }}>代替网页向洛谷发请求（绕开同源策略）</Text>
              </Descriptions.Item>
            </Descriptions>
            <Space size={8}>
              <Button size="small" icon={<ReloadOutlined />} onClick={bridge.recheck}>
                重新检测
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<ExportOutlined />}
                href={LUOGU_SCRIPT_URL}
                target="_blank"
                rel="noreferrer"
              >
                安装脚本
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card size="small" title="洛谷会话" className="luogu-status-card">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="登录状态">
                {!session ? (
                  <Tag>未检测</Tag>
                ) : session.loggedIn ? (
                  <Tag color="green">已登录</Tag>
                ) : (
                  <Tag color="red">未登录</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="账号">
                {session?.loggedIn
                  ? `${session.name ?? '（洛谷未返回用户名）'}${session.uid ? ` · uid ${session.uid}` : ''}`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="HTTP 状态">{session?.status ?? '—'}</Descriptions.Item>
            </Descriptions>
            <Space size={8}>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                loading={checking}
                disabled={bridge.state !== 'ready'}
                onClick={() => handleCheckSession()}
              >
                检测登录
              </Button>
              <Button
                size="small"
                icon={<ExportOutlined />}
                href="https://www.luogu.com.cn/auth/login"
                target="_blank"
                rel="noreferrer"
              >
                去洛谷登录
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {bridge.state === 'missing' && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="还没有安装桥接脚本"
          description={
            <Space direction="vertical" size={4}>
              <Text>
                浏览器的同源策略禁止本站页面访问 luogu.com.cn（洛谷的响应里没有
                <Text code>Access-Control-Allow-Origin</Text>），而 <Text code>Cookie</Text>{' '}
                属于 fetch / XHR 的<Text strong>禁止请求头</Text> —— 也就是说，
                网页 JS 在技术上不可能带着你的登录凭据去请求洛谷。这不是"没写对"，是浏览器的硬规则。
              </Text>
              <Text>
                所以这里采用和浏览器插件同款的思路：装一个油猴脚本，由扩展代你发请求。
                脚本源码完全公开，可以在下面的「安装桥接脚本」里逐行查看。
              </Text>
            </Space>
          }
        />
      )}

      {/* ---------------- 远程账号管理 ---------------- */}
      <Card
        title={
          <Space>
            <ApiOutlined /> 远程账号管理
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={
          <Space size={8}>
            <Button size="small" loading={checking} onClick={() => handleCheckSession()}>
              检测
            </Button>
            <Button size="small" disabled={!session?.loggedIn} onClick={handleBindSession}>
              绑定浏览器会话
            </Button>
          </Space>
        }
      >
        <Table
          size="small"
          rowKey="key"
          columns={bindingColumns}
          dataSource={bindingRows}
          pagination={false}
          locale={{ emptyText: '还没有绑定任何远程账号' }}
        />

        <Divider style={{ margin: '16px 0 12px' }} />

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Text strong>绑定远程账号</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            请先在你自己的浏览器里登录洛谷，然后填写下面的值。也可以直接点上面的
            <Text strong>「绑定浏览器会话」</Text>，那样不需要填任何东西。
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            取值方式：打开 luogu.com.cn 并按 <Text code>F12</Text> →
            <Text code>Application / 应用程序</Text> → <Text code>Cookies</Text> →
            <Text code>https://www.luogu.com.cn</Text>，复制 <Text code>__client_id</Text> 与{' '}
            <Text code>_uid</Text> 两行。
            <Text type="danger">切勿把这两个值发给任何人或填到别的网站</Text>
            （拿到它就等于拿到你的洛谷登录态）。
          </Text>
          <Table
            size="small"
            rowKey="name"
            pagination={false}
            dataSource={[
              {
                key: 'clientId',
                type: 'Cookie',
                domain: 'luogu.com.cn',
                name: '__client_id',
                value: (
                  <Input.Password
                    value={clientIdInput}
                    onChange={(event) => setClientIdInput(event.target.value)}
                    placeholder="40 位左右的随机字符串"
                  />
                ),
              },
              {
                key: 'uid',
                type: 'Cookie',
                domain: 'luogu.com.cn',
                name: '_uid',
                value: (
                  <Input
                    value={uidInput}
                    onChange={(event) => setUidInput(event.target.value)}
                    placeholder="你的洛谷 uid，例如 66666"
                  />
                ),
              },
            ]}
            columns={[
              { title: '类型', dataIndex: 'type', width: 90 },
              { title: '域名', dataIndex: 'domain', width: 150 },
              { title: '名称', dataIndex: 'name', width: 130 },
              { title: '值', dataIndex: 'value' },
            ]}
          />
          <Space size={8}>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              loading={binding}
              disabled={bridge.state !== 'ready'}
              onClick={handleBindCookie}
            >
              绑定
            </Button>
            <Button onClick={() => handleCheckSession()}>检测</Button>
            <Button
              onClick={() => {
                setClientIdInput('');
                setUidInput('');
              }}
            >
              清空
            </Button>
            <Tooltip title="用浏览器里已经登录的洛谷账号，无需粘贴任何 Cookie">
              <Button icon={<ThunderboltOutlined />} onClick={handleBindSession}>
                一键用浏览器会话
              </Button>
            </Tooltip>
          </Space>
          {bridge.state !== 'ready' && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              绑定前需要先安装桥接脚本：Cookie 是否有效必须真的请求一次洛谷才能验证。
            </Text>
          )}
        </Space>
      </Card>

      {/* ---------------- 安装与原理 ---------------- */}
      <Card title="安装桥接脚本（只需一次）" style={{ marginBottom: 16 }}>
        <Collapse
          defaultActiveKey={bridge.state === 'ready' ? [] : ['install']}
          items={[
            {
              key: 'install',
              label: '三步装好，之后就能一键提交',
              children: (
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <Text>
                    <Text strong>第 1 步：</Text>给浏览器装一个用户脚本管理器（推荐 Tampermonkey）：
                    <a href={LUOGU_TAMPERMONKEY_URL} target="_blank" rel="noreferrer">
                      Tampermonkey
                    </a>
                    {' / '}
                    <a href={LUOGU_VIOLENTMONKEY_URL} target="_blank" rel="noreferrer">
                      Violentmonkey
                    </a>
                  </Text>
                  <Text>
                    <Text strong>第 2 步：</Text>安装本站的桥接脚本：
                    <Space size={8} wrap style={{ marginTop: 4 }}>
                      <Button
                        size="small"
                        type="primary"
                        icon={<ExportOutlined />}
                        href={LUOGU_SCRIPT_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        打开脚本地址安装
                      </Button>
                      <Button size="small" icon={<CopyOutlined />} onClick={handleCopyScript}>
                        复制脚本内容（手动粘贴安装）
                      </Button>
                    </Space>
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    如果点开脚本地址显示的是源码而不是安装页，就用「复制脚本内容」，
                    在油猴面板里新建脚本并粘贴保存。
                  </Text>
                  <Text>
                    <Text strong>第 3 步：</Text>回到本页点「重新检测」，看到
                    <Tag color="green" style={{ marginInlineStart: 6 }}>
                      已就绪
                    </Tag>
                    就成功了。之后在题目页点「提交到洛谷」即可。
                  </Text>
                </Space>
              ),
            },
            {
              key: 'how',
              label: '原理：为什么必须装脚本（以及 vjudge 为什么不用）',
              children: (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text>
                    vjudge 的「绑定远程账号」页面本身只是一个表单：你把 Cookie 填进去，
                    它把 Cookie 存到<Text strong>它自己的服务器</Text>上，
                    之后由服务器去请求洛谷。服务器之间发 HTTP 请求没有同源策略，所以能成功。
                  </Text>
                  <Text>
                    而纯前端不可能这么做：从 <Text code>{window.location.origin}</Text>{' '}
                    发出的跨域请求会被浏览器拦下（洛谷的响应里没有 CORS 头），
                    而且 <Text code>Cookie</Text> 是禁止请求头，网页 JS 设不了。
                    这两条都不是"换个写法"能绕过的。
                  </Text>
                  <Text>
                    本站的选择是：<Text strong>不引入服务器</Text>，把"代发请求"交给运行在你浏览器里的
                    桥接脚本。效果和 vjudge 一样（洛谷那边看到是你的账号在提交），
                    但你的 Cookie 与代码只存在于你自己的机器上。
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    脚本用到的接口全部是洛谷自己的前端在用的：
                    <br />
                    · <Text code>POST /fe/api/problem/submit/{'{pid}'}</Text>（body: lang / code / enableO2）
                    <br />
                    · <Text code>GET /record/{'{rid}'}?_contentOnly=1</Text>（评测结果）
                    <br />
                    · <Text code>GET /record/list?pid=…&amp;_contentOnly=1</Text>（提交记录）
                    <br />
                    · <Text code>GET /user/setting</Text>（判断是否登录）
                  </Text>
                </Space>
              ),
            },
            {
              key: 'limits',
              label: '已知限制（请先看一眼）',
              children: (
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  <li>
                    洛谷可能要求<Text strong>人机验证</Text>：遇到时先在洛谷网站上手动交一次这道题，
                    验证通过后回到本站提交即可。
                  </li>
                  <li>
                    洛谷有<Text strong>提交频率限制</Text>：桥接脚本内置了 5 秒防连点，
                    请也自觉别拿它刷提交。
                  </li>
                  <li>
                    洛谷接口属于<Text strong>非公开接口</Text>，如果哪天洛谷改了接口或页面结构，
                    提交会失败并在本页诊断里给出原始返回，我按实际情况跟进修复。
                  </li>
                  <li>
                    本站题目的题面、测试用例、题解都是自撰的；洛谷只作为"在线评测"使用，
                    不抓取洛谷题面。
                  </li>
                </ul>
              ),
            },
          ]}
        />
      </Card>

      {/* ---------------- 诊断 ---------------- */}
      <Card
        title={
          <Space>
            <SafetyOutlined /> 诊断
          </Space>
        }
        extra={
          <Button size="small" onClick={handleDebug} disabled={bridge.state !== 'ready'}>
            读取洛谷原始返回
          </Button>
        }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交失败时可以点上面的按钮，把洛谷的原始返回贴给我，我就能定位问题。
          </Text>
          {debugOutput ? (
            <Input.TextArea
              value={debugOutput}
              readOnly
              autoSize={{ minRows: 4, maxRows: 12 }}
              style={{ fontFamily: 'Consolas, monospace', fontSize: 12 }}
            />
          ) : null}
          <Divider style={{ margin: '8px 0' }} />
          <Descriptions column={1} size="small">
            <Descriptions.Item label="当前绑定方式">
              {mode === 'cookie' ? 'Cookie（手工粘贴）' : '浏览器会话'}
            </Descriptions.Item>
            <Descriptions.Item label="默认语言">
              {getLuoguLanguageName(LUOGU_DEFAULT_LANGUAGE.cpp)}（可在题目页切换）
            </Descriptions.Item>
            <Descriptions.Item label="示例题目">
              <a href={luoguProblemUrl('P1001')} target="_blank" rel="noreferrer">
                P1001 A+B Problem
              </a>
            </Descriptions.Item>
          </Descriptions>
          <Text type="secondary" style={{ fontSize: 12 }}>
            绑定信息只存在你这台浏览器的 localStorage（键名 <Text code>oiworld:luogu</Text>），
            点「解绑」会立刻清空。还没绑定？去
            <Link to="/pro/stage/1" style={{ marginLeft: 4 }}>
              Pro 靶场
            </Link>
            找一题试试。
          </Text>
        </Space>
      </Card>
    </div>
  );
}
