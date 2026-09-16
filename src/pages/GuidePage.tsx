/**
 * 新手指南（第零课）：面向完全没有编程基础的读者，
 * 讲清楚"这个网站怎么用 / 代码怎么写 / 报错怎么读"。
 */

import { Anchor, Button, Card, Space, Typography } from 'antd';
import { ArrowRightOutlined, ReadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import guideContent from '../data/guide.md?raw';
import { MarkdownView } from '../components/MarkdownView';
import { ALL_PROBLEMS } from '../data';

const { Title, Paragraph, Text } = Typography;

/** 从 Markdown 里按顺序提取二级标题，作为右侧目录 */
function extractHeadings(markdown: string): { id: string; text: string }[] {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^##\s+/, '').trim())
    .map((text, index) => ({ id: `guide-h-${index}`, text }));
}

export function GuidePage() {
  const navigate = useNavigate();
  const headings = extractHeadings(guideContent);
  const firstProblem = ALL_PROBLEMS[0]?.problem;

  return (
    <div className="guide-page">
      <div className="guide-main">
        <Card variant="borderless">
          <Title level={2} style={{ marginBottom: 8 }}>
            <ReadOutlined /> 新手指南 · 第零课
          </Title>
          <Paragraph type="secondary">
            专为零基础准备。读完这一页，你就知道代码该写在哪里、每个符号是什么意思、报错该怎么看。
            忘记语法时随时回来查。
          </Paragraph>
          <Space wrap>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              disabled={!firstProblem}
              onClick={() => firstProblem && navigate(`/problem/${firstProblem.id}`)}
            >
              我懂了，去做第一题
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              重点看第四节「逐行读懂第一段代码」和第七节「中文标点」
            </Text>
          </Space>
        </Card>

        <Card variant="borderless" style={{ marginTop: 16 }}>
          <MarkdownView content={guideContent} headingIds />
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
