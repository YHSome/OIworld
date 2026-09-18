/**
 * 「洛谷远程提交」相关的类型定义。
 *
 * 关键背景（这些结论都是对着洛谷线上接口与它自己的前端代码核实过的）：
 *  - 洛谷的响应不带 Access-Control-Allow-Origin，所以本站页面无法直接 fetch 洛谷；
 *  - `Cookie` 是 fetch/XHR 的禁止请求头，网页 JS 无论如何都附加不上登录凭据；
 *  - 因此真正的网络请求由用户安装的油猴脚本（oiworld-luogu.user.js）代发，
 *    网页只通过 window.postMessage 驱动它。下面就是这套消息协议的类型。
 */

/** 网页 → 桥 的消息标记 */
export const LUOGU_REQUEST_FLAG = '__OIWORLD_LUOGU_REQUEST__';
/** 桥 → 网页 的消息标记 */
export const LUOGU_REPLY_FLAG = '__OIWORLD_LUOGU_REPLY__';

export type LuoguAction =
  | 'ping'
  | 'session'
  | 'submit'
  | 'record'
  | 'records'
  | 'debug';

export interface LuoguRequestMessage {
  [LUOGU_REQUEST_FLAG]: true;
  id: number;
  action: LuoguAction;
  payload?: unknown;
}

export interface LuoguBridgeErrorShape {
  code: string;
  message: string;
  detail?: unknown;
}

export interface LuoguReplyMessage {
  [LUOGU_REPLY_FLAG]: true;
  id: number;
  ok: boolean;
  data?: unknown;
  error?: LuoguBridgeErrorShape;
}

export interface LuoguBridgeInfo {
  bridge: true;
  version: string;
  origin: string;
}

/** 手工绑定洛谷账号时使用的 Cookie（对应洛谷的 __client_id / _uid） */
export interface LuoguCookieBinding {
  clientId: string;
  uid: string;
}

export type LuoguBindingMode = 'session' | 'cookie';

export interface LuoguSession {
  loggedIn: boolean;
  status: number;
  uid?: number | null;
  name?: string | null;
  unknown?: boolean;
}

export interface LuoguSubmitPayload {
  pid: string;
  code: string;
  lang: number;
  enableO2?: boolean;
  contestId?: string;
  cookie?: LuoguCookieBinding;
}

export interface LuoguSubmitResult {
  rid: number;
  status: number;
}

/** 洛谷评测记录（/record/{rid} 与 /record/list 记录的字段超集） */
export interface LuoguRecord {
  id: number;
  status: number;
  score?: number;
  time?: number;
  memory?: number;
  language?: number;
  enableO2?: boolean;
  sourceCodeLength?: number;
  submitTime?: number;
  problem?: { pid?: string; title?: string };
  user?: { uid?: number; name?: string };
  compilationResult?: string | null;
  /** 洛谷返回的原始对象，出问题时方便在诊断面板里查看 */
  raw?: unknown;
}

export interface LuoguDebugResult {
  url: string;
  status: number;
  body: string;
}
