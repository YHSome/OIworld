/**
 * Python 入门附页：沿用 C++ 新手指南的阅读体验，
 * 但不把 C++ 的浏览器编译器误写成 Python 运行环境。
 */

import { Anchor, Button, Card, Space, Typography } from 'antd';
import { ArrowLeftOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import pythonGuideContent from '../data/python-guide.md?raw';
import { MarkdownView } from '../components/MarkdownView';

const { Title, Paragraph, Text } = Typography;

function extractHeadings(markdown: string): { id: string; text: string }[] {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^##\s+/, '').trim())
    .map((text, index) => ({ id: `guide-h-${index}`, text }));
}

export function PythonGuidePage() {
  const navigate = useNavigate();
  const headings = extractHeadings(pythonGuideContent);

  return (
    <div className="guide-page">
      <div className="guide-main">
        <Card className="python-hero-card" variant="borderless">
          <Title level={2} style={{ marginBottom: 8 }}>
            <CodeOutlined /> Python 入门教程
          </Title>
          <Paragraph type="secondary">
            给零基础学习者的一份 Python 小抄：从输出文字开始，认识变量、判断、循环、列表和函数。
            读完就能看懂并写出第一段 Python 程序。
          </Paragraph>
          <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/python')}>
              返回 Python 靶场
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              这是阅读附页；本站当前的在线练习与本地编译功能仍面向 C++。
            </Text>
          </Space>
        </Card>

        <Card variant="borderless" style={{ marginTop: 16 }}>
          <MarkdownView content={pythonGuideContent} headingIds />
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
