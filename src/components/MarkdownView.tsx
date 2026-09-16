import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
  /**
   * 给二级标题（## ）自动加上 id（guide-h-0、guide-h-1…），
   * 便于新手指南页的目录跳转。
   */
  headingIds?: boolean;
}

/** 题目描述的 Markdown 渲染（支持表格、代码块、行内代码） */
export function MarkdownView({ content, headingIds = false }: MarkdownViewProps) {
  let counter = 0;
  const components: Components | undefined = headingIds
    ? {
        h2: ({ children }) => <h2 id={`guide-h-${counter++}`}>{children}</h2>,
      }
    : undefined;

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
