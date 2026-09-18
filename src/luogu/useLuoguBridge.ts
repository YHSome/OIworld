/**
 * 检测洛谷桥接脚本是否已安装并可用。
 *
 * 说明：Tampermonkey 的 `@run-at document-start` 会在页面脚本之前注入，
 * 所以正常情况下挂载时一次 ping 就能探到。切换标签页回来时再探一次，
 * 这样用户"刚装好脚本再切回来"也能立刻用上，不需要刷新页面。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { probeLuoguBridge } from './bridge';
import type { LuoguBridgeInfo } from './types';

export type LuoguBridgeState = 'checking' | 'ready' | 'missing';

/** 桥接脚本的安装地址（部署在站点自己的目录下） */
export const LUOGU_SCRIPT_URL = `${import.meta.env.BASE_URL}oiworld-luogu.user.js`;

/** 油猴类扩展的官方安装地址 */
export const LUOGU_TAMPERMONKEY_URL = 'https://www.tampermonkey.net/';
export const LUOGU_VIOLENTMONKEY_URL = 'https://violentmonkey.github.io/';

export function useLuoguBridge() {
  const [state, setState] = useState<LuoguBridgeState>('checking');
  const [info, setInfo] = useState<LuoguBridgeInfo | null>(null);
  const mounted = useRef(true);

  const check = useCallback(async () => {
    const result = await probeLuoguBridge();
    if (!mounted.current) return;
    setInfo(result);
    setState(result ? 'ready' : 'missing');
  }, []);

  useEffect(() => {
    mounted.current = true;
    void check();
    const onFocus = () => {
      void check();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      mounted.current = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [check]);

  return { state, info, recheck: check };
}
