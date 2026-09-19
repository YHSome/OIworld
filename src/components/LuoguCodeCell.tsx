/**
 * 题目列表里的「洛谷」单元格：显示同类型练习的题号，点开就是洛谷题目页。
 * 没有标注题号（洛谷没有对应的同类练习）时显示一个短横线。
 */

import { Typography } from 'antd';

const { Text } = Typography;

interface Props {
  /** 洛谷题号，例如 P1001 / B2002 */
  code?: string;
}

export function LuoguCodeCell({ code }: Props) {
  if (!code) {
    return (
      <Text type="secondary" style={{ fontSize: 12 }}>
        —
      </Text>
    );
  }
  return (
    <a
      href={`https://www.luogu.com.cn/problem/${code}`}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => event.stopPropagation()}
      style={{ fontSize: 13 }}
    >
      {code}
    </a>
  );
}
