/**
 * 洛谷评测状态表（只用于显示书签回传的结果）。
 *
 * id / shortName / color 取自洛谷自己的前端配置 https://www.luogu.com.cn/_lfe/config
 * 里的 RecordStatus 枚举。
 */

export interface LuoguStatusMeta {
  short: string;
  label: string;
  color: string;
}

export const LUOGU_STATUS: Record<number, LuoguStatusMeta> = {
  [-1]: { short: '未知', label: '未拿到状态（可能是轮询失败）', color: 'default' },
  0: { short: 'Waiting', label: '等待评测', color: 'default' },
  1: { short: 'Judging', label: '正在评测', color: 'processing' },
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
