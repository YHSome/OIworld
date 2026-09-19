/**
 * 「洛谷账号」页（书签提交版）。
 *
 * 这里只做一件事：把「OIworld 提交」书签装到你的浏览器里，并说清楚它是怎么工作的、
 * 以及为什么本站需要一个书签（而不是像 vjudge 那样粘贴一次 Cookie 就行）。
 */

import { useEffect, useRef, useState } from 'react';
import { App as AntApp, Button, Card, Collapse, Space, Tag, Typography } from 'antd';
import {
  BookOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  ExportOutlined,
  LinkOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { BOOKMARKLET_HREF, BOOKMARKLET_NAME } from '../luogu/bookmarklet';

const { Title, Text, Paragraph } = Typography;

export function LuoguPage() {
  const { message: messageApi } = AntApp.useApp();
  const bookmarkletRef = useRef<HTMLAnchorElement | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * 书签的 href 是 `javascript:…`：React 会对这种 URL 发警告（未来版本还会直接屏蔽），
   * 所以挂载后用 ref 直接写到 DOM 上 —— 拖拽安装照常可用，也听不到警告。
   */
  useEffect(() => {
    bookmarkletRef.current?.setAttribute('href', BOOKMARKLET_HREF);
  }, []);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(BOOKMARKLET_HREF);
      setCopied(true);
      messageApi.success('书签地址已复制：新建一个书签，把地址粘贴进去即可');
    } catch {
      messageApi.warning('复制失败，请直接把上面的按钮拖到书签栏');
    }
  };

  return (
    <div className="page">
      <Card className="luogu-hero-card" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={8}>
          <Title level={3} style={{ margin: 0 }}>
            <CloudUploadOutlined /> 洛谷提交 · 书签版
          </Title>
          <Paragraph style={{ margin: 0 }}>
            装一个书签，就能把 OIworld 里写的代码<Text strong>直接交到洛谷</Text>，
            并在洛谷页面上看到评测结果 —— 不装任何浏览器扩展、不粘贴 Cookie、本站也没有服务器。
          </Paragraph>
          <Space wrap size={8}>
            <Tag color="green">代码与登录态都不离开你的浏览器</Tag>
            <Tag color="blue">零安装：拖一次书签即可</Tag>
            <Tag>洛谷题号已逐题核对</Tag>
          </Space>
        </Space>
      </Card>

      <Card
        title={
          <Space>
            <BookOutlined /> 安装「OIworld 提交」书签
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Text>
            <Text strong>第 1 步：</Text>把下面这个按钮<Text strong>拖到浏览器书签栏</Text>
            （Chrome / Edge：按 <Text code>Ctrl+Shift+B</Text> 显示书签栏）。
          </Text>
          <Space size={12} wrap align="center">
            <a
              ref={bookmarkletRef}
              className="luogu-bookmarklet"
              onClick={(event) => {
                event.preventDefault();
                messageApi.info(
                  '请把这个按钮拖到书签栏（直接点它只会在这里打招呼）。装好后去洛谷题目页点它。',
                );
              }}
              title="把「OIworld 提交」拖到书签栏"
            >
              📤 {BOOKMARKLET_NAME}
            </a>
            <Button size="small" icon={<CopyOutlined />} onClick={handleCopyScript}>
              {copied ? '已复制，再点一次复制' : '复制书签地址（手动新建书签）'}
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            如果拖拽不好用：点「复制书签地址」，然后在书签栏右键 → 添加书签 →
            名称填 <Text code>{BOOKMARKLET_NAME}</Text>，地址粘贴进去。
          </Text>

          <Text>
            <Text strong>第 2 步：</Text>回到任意题目页，点「书签提交」——
            它会自动复制代码并打开洛谷对应题目页。
          </Text>
          <Text>
            <Text strong>第 3 步：</Text>在洛谷那个标签页点一下书签栏里的「OIworld 提交」，
            代码就提交上去了，右上角浮层会直接显示评测结果（AC / WA / TLE…）。
          </Text>

          <Space wrap size={8}>
            <Button type="primary" icon={<LinkOutlined />}>
              <Link to="/pro/stage/1" style={{ color: 'inherit' }}>
                去 Pro 靶场找一道题试试
              </Link>
            </Button>
            <Button
              icon={<ExportOutlined />}
              href="https://www.luogu.com.cn/auth/login"
              target="_blank"
              rel="noreferrer"
            >
              先去洛谷登录
            </Button>
          </Space>
        </Space>
      </Card>

      <Card
        title={
          <Space>
            <SafetyOutlined /> 原理与常见问题
          </Space>
        }
      >
        <Collapse
          defaultActiveKey={['why']}
          items={[
            {
              key: 'why',
              label: '为什么必须用书签，而不能像 vjudge 那样粘贴一次 Cookie？',
              children: (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text>
                    这是浏览器的硬规则，不是实现选择：本站页面的跨域请求会被同源策略拦下
                    （洛谷的响应里没有 <Text code>Access-Control-Allow-Origin</Text>），
                    而 <Text code>Cookie</Text> 属于 fetch / XHR 的<Text strong>禁止请求头</Text>，
                    网页 JS 无论如何都带不上登录凭据。
                  </Text>
                  <Text>
                    vjudge 能让用户粘一次 Cookie 就完事，是因为它把 Cookie 存到
                    <Text strong>它自己的服务器</Text>上、由服务器代发请求；本站不引入服务器，
                    于是换一条路：让一小段代码（书签）在<Text strong>洛谷自己的页面里</Text>运行 ——
                    那里同源，浏览器也会自动带上你的登录 Cookie。
                  </Text>
                </Space>
              ),
            },
            {
              key: 'safe',
              label: '这个书签安全吗？它会读什么？',
              children: (
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  <li>
                    只在 <Text code>luogu.com.cn</Text> 的题目页里运行；在别的网页上点它只会提示
                    "请先在洛谷打开一道题目页面"。
                  </li>
                  <li>
                    只读当前页面的 <Text code>&lt;meta name="csrf-token"&gt;</Text>（洛谷提交接口要求带）
                    以及地址栏/剪贴板里你自己的代码；不读表单、不读其它站点。
                  </li>
                  <li>只请求洛谷自己的接口，不会把代码或凭据发给任何第三方。</li>
                  <li>
                    源码是仓库里的一段纯文本
                    <Text code>src/luogu/bookmarklet.ts</Text>，可以逐行读、也可以自己改。
                  </li>
                </ul>
              ),
            },
            {
              key: 'result',
              label: '为什么 OIworld 里看不到洛谷的评测结果和提交记录？',
              children: (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text>
                    因为读取洛谷的数据同样受同源策略限制：不装浏览器扩展的话，本站页面拿不到洛谷的响应。
                    所以现在评测结果由书签在<Text strong>洛谷页面右上角的浮层</Text>里显示，
                    并给出这条记录的链接。
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    早期版本提供过一个可选方案（装一次油猴脚本，由扩展代发请求，就能在本站提交、轮询结果、
                    拉提交记录）。为了不引入安装负担已移除；如果你以后想要这项能力，可以再加回来。
                  </Text>
                </Space>
              ),
            },
            {
              key: 'trouble',
              label: '遇到问题怎么办？',
              children: (
                <ul style={{ margin: 0, paddingInlineStart: 20 }}>
                  <li>
                    <Text strong>点书签没反应</Text>：确认你是在洛谷的题目页（地址形如
                    <Text code>/problem/P1001</Text>）上点的；书签地址是否被浏览器截断。
                  </li>
                  <li>
                    <Text strong>提示"没有登录洛谷"</Text>：先在浏览器里登录 luogu.com.cn。
                  </li>
                  <li>
                    <Text strong>提示"要求人机验证"</Text>：先在洛谷网站上手动提交一次这道题，
                    通过验证后再用书签提交。
                  </li>
                  <li>
                    <Text strong>提交成功但结果不对</Text>：注意本题的输入输出格式是否与洛谷那道题一致
                    （题目页会提示；题库里已对齐的题会写"题面已与洛谷对齐"）。
                  </li>
                </ul>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
