/**
 * 洛谷相关的小工具：题号校验、跳转地址、书签提交的载荷编码。
 *
 * 本项目的取巧之处：**本站不直接访问洛谷**。
 * 浏览器同源策略会让页面读不到洛谷的响应，`Cookie` 又是 fetch/XHR 的禁止请求头，
 * 所以提交这件事交给「书签脚本」在**洛谷自己的页面里**做（见 bookmarklet.ts）；
 * 这里只负责生成地址与载荷。
 */

import { buildBookmarkletUrl, encodeLuoguPayload, type LuoguSubmitPayloadInput } from './bookmarklet';

export { encodeLuoguPayload };
export type { LuoguSubmitPayloadInput };

/** 洛谷题号形如 P1001 / B2002 / CF1A / AT_abc001_a */
export function isValidLuoguPid(pid: string): boolean {
  return /^[A-Za-z]{1,4}[_-]?[A-Za-z0-9]{1,12}$/.test(pid.trim());
}

/** 洛谷题目页地址 */
export function luoguProblemUrl(pid: string): string {
  return `https://www.luogu.com.cn/problem/${encodeURIComponent(pid.trim())}`;
}

/** 某题的洛谷提交记录列表（公开页面，在洛谷那边看） */
export function luoguRecordListUrl(pid: string): string {
  return `https://www.luogu.com.cn/record/list?pid=${encodeURIComponent(pid.trim())}`;
}

/** 某条评测记录（书签脚本给出结果时会带上这个链接） */
export function luoguRecordUrl(rid: number): string {
  return `https://www.luogu.com.cn/record/${rid}`;
}

/**
 * 「书签提交」要打开的地址：把代码编码进查询参数，到洛谷后由书签脚本读出来提交
 * （代码太长装不进地址栏时，只带语言参数，代码走剪贴板）。
 */
export function buildLuoguSubmitUrl(
  pid: string,
  input: LuoguSubmitPayloadInput,
): { url: string; payload: string; inUrl: boolean } {
  return buildBookmarkletUrl(pid, input);
}
