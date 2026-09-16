/**
 * Java 入门指南：沿用 C++ / Python 新手指南的阅读体验（左侧正文 + 右侧目录）。
 */

import { Anchor, Button, Card, Space, Typography } from 'antd';
import { ArrowLeftOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import javaGuideContent from '../data/java-guide.md?raw';
import { MarkdownView } from '../components/MarkdownView';

const { Title, Paragraph, Text } = Typography;

/** 从 Markdown 里按顺序提取二级标题，作为右侧目录（与 MarkdownView 的 headingIds 对应） */
function extractHeadings(markdown: string): { id: string; text: string }[] {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^##\s+/, '').trim())
    .map((text, index) => ({ id: `guide-h-${index}`, text }));
}

export function JavaGuidePage() {
  const navigate = useNavigate();
  const headings = extractHeadings(javaGuideContent);

  return (
    <div className="guide-page">
      <div className="guide-main">
        <Card className="hero-card java-hero-card" variant="borderless">
          <Title level={2} style={{ marginBottom: 8 }}>
            <CodeOutlined /> Java 入门教程
          </Title>
          <Paragraph type="secondary">
            给零基础学习者的 Java 小抄：从类与 main 方法开始，认识输出、变量、Scanner 输入、
            判断和循环。读完就能看懂并写出第一段 Java 程序。
          </Paragraph>
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/java')}
            >
              返回 Java 靶场
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              忘记语法时随时回来查；本页目录在右侧（窄屏隐藏）
            </Text>
          </Space>
        </Card>

        <Card variant="borderless" style={{ marginTop: 16 }}>
          <MarkdownView content={javaGuideContent} headingIds />
        </Card>
      </div>

      <div className="guide-side">
        <Card variant="borderless" size="small" title="本页目录">
          <Anchor
            affix={false}
            targetOffset={90}
            items={headings.map((heading) => ({
              key: heading.id,
              href: `#${heading.id}`,
              title: heading.text,
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
