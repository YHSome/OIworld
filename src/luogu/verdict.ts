/**
 * 洛谷评测状态表。
 *
 * 这张表不是猜的：id / shortName / color 全部取自洛谷自己的前端配置文件
 * https://www.luogu.com.cn/_lfe/config 中的 RecordStatus 枚举。
 */

export interface LuoguStatusMeta {
  /** 洛谷给出的英文简称，如 AC / WA / TLE */
  short: string;
  /** 中文说明，用于鼠标悬停 */
  label: string;
  /** antd Tag 的颜色 */
  color: string;
  /** 还在评测中（需要继续轮询） */
  pending?: boolean;
}

export const LUOGU_STATUS: Record<number, LuoguStatusMeta> = {
  [-1]: { short: 'N/A', label: '未显示', color: 'default' },
  0: { short: 'Waiting', label: '等待评测', color: 'default', pending: true },
  1: { short: 'Judging', label: '正在评测', color: 'processing', pending: true },
  2: { short: 'CE', label: '编译错误（Compile Error）', color: 'gold' },
  3: { short: 'OLE', label: '输出超限（Output Limit Exceeded）', color: 'blue' },
  4: { short: 'MLE', label: '内存超限（Memory Limit Exceeded）', color: 'blue' },
  5: { short: 'TLE', label: '运行超时（Time Limit Exceeded）', color: 'blue' },
  6: { short: 'WA', label: '答案错误（Wrong Answer）', color: 'red' },
  7: { short: 'RE', label: '运行时错误（Runtime Error）', color: 'purple' },
  11: { short: 'UKE', label: '未知错误（Unknown Error）', color: 'default' },
  12: { short: 'AC', label: '答案正确（Accepted）', color: 'green' },
  14: { short: 'NAC', label: '未拿到满分（Unaccepted）', color: 'red' },
  21: { short: 'Hack+', label: 'Hack 成功', color: 'green' },
  22: { short: 'Hack-', label: 'Hack 失败', color: 'red' },
  23: { short: 'Hack~', label: 'Hack 跳过', color: 'blue' },
};

export function getLuoguStatus(status: number | undefined | null): LuoguStatusMeta {
  if (status === undefined || status === null) {
    return { short: '未知', label: '未知状态', color: 'default' };
  }
  return LUOGU_STATUS[status] ?? { short: `#${status}`, label: `未知状态（${status}）`, color: 'default' };
}

/** 是否还需要继续轮询评测结果 */
export function isLuoguPending(status: number | undefined | null): boolean {
  if (status === undefined || status === null) return true;
  return Boolean(LUOGU_STATUS[status]?.pending);
}

/** 把洛谷记录的时间 / 内存整理成给人看的样子 */
export function formatLuoguCost(record: { time?: number; memory?: number }): string {
  const parts: string[] = [];
  if (typeof record.time === 'number' && record.time > 0) parts.push(`${record.time} ms`);
  if (typeof record.memory === 'number' && record.memory > 0) {
    parts.push(`${(record.memory / 1024).toFixed(2)} MB`);
  }
  return parts.join(' / ');
}

export function formatLuoguTime(submitTime?: number): string {
  if (!submitTime) return '';
  const date = new Date(submitTime * 1000);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
