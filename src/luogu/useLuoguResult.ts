/**
 * 接收「书签提交」回传的洛谷评测结果。
 *
 * 书签在洛谷页面上拿到结果后，会打开一个本站链接：
 *   `.../#/pro/problem/p1-1?luoguResult=<base64url>`
 * 这里把它解出来、存进一个内存 store（题目页据此标记通过、面板据此显示结果），
 * 然后把这个查询参数从地址栏清掉，避免刷新时重复触发。
 *
 * 为什么用地址传：书签跑在 luogu.com.cn 上，跨站写不了本站的 localStorage，
 * 地址参数是唯一不需要扩展就能把结果带回来的通道。
 */

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { create } from 'zustand';
import { decodeLuoguResult, type LuoguResultPayload } from './bookmarklet';

interface LuoguResultState {
  /** 最近一次从书签回传的结果 */
  lastResult: LuoguResultPayload | null;
  receivedAt: number | null;
  setResult: (result: LuoguResultPayload | null) => void;
}

export const useLuoguResultStore = create<LuoguResultState>()((set) => ({
  lastResult: null,
  receivedAt: null,
  setResult: (result) => set({ lastResult: result, receivedAt: result ? Date.now() : null }),
}));

/**
 * 只在题目页调用一次：解析 `?luoguResult=`，写进 store 并清掉参数。
 * @returns 本次是否收到了结果
 */
export function useLuoguResultParam(): LuoguResultPayload | null {
  const [searchParams, setSearchParams] = useSearchParams();
  const setResult = useLuoguResultStore((state) => state.setResult);
  const handled = useRef<string | null>(null);
  const lastResult = useLuoguResultStore((state) => state.lastResult);
  const encoded = searchParams.get('luoguResult');

  useEffect(() => {
    if (!encoded || handled.current === encoded) return;
    handled.current = encoded;
    const parsed = decodeLuoguResult(encoded);
    if (parsed) setResult(parsed);

    const next = new URLSearchParams(searchParams);
    next.delete('luoguResult');
    setSearchParams(next, { replace: true });
    // searchParams 变化不需要重新触发：handled 已经挡住重复处理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encoded, setResult]);

  return lastResult;
}
