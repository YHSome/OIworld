/**
 * 开发者模式。
 *
 * 三种打开方式（都会持久化到 localStorage，刷新后仍然有效）：
 *   1. URL：`?dev=1` 打开、`?dev=0` 关闭（方便分享"带调试信息的链接"）
 *   2. 快捷键：Ctrl + Shift + D 切换
 *   3. 「我的进度 → 设置与数据」里的开关
 *
 * 打开后：
 *   - 所有题目解锁（闯关模式是固定规则，开发者模式是唯一的例外）
 *   - 未通过也能查看参考题解，并且可以一键把题解填进编辑器
 *   - 题目页出现开发者面板（编译参数 / 工具链来源 / 耗时 / 原始诊断）
 */

import { useEffect } from 'react';
import { App as AntApp } from 'antd';
import { useProgressStore } from '../store/useProgressStore';

/** 保证全局监听只安装一次（多个组件同时用这个 hook 时） */
let listenersInstalled = false;

export function useDeveloperMode() {
  const developerMode = useProgressStore((state) => state.developerMode);
  const setDeveloperMode = useProgressStore((state) => state.setDeveloperMode);
  const { message } = AntApp.useApp();

  // 1) URL 参数 ?dev=1 / ?dev=0
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('dev');
    if (raw === null) return;
    const enabled = /^(1|true|on|yes)$/i.test(raw);
    const disabled = /^(0|false|off|no)$/i.test(raw);
    if (!enabled && !disabled) return;

    const store = useProgressStore.getState();
    if (store.developerMode !== enabled) {
      store.setDeveloperMode(enabled);
      message.info(
        enabled ? '开发者模式已开启：全部题目已解锁' : '开发者模式已关闭',
      );
    }
    // 顺手把 ?dev=… 从地址栏去掉，避免刷新时反复提示
    params.delete('dev');
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 快捷键 Ctrl + Shift + D
  useEffect(() => {
    if (listenersInstalled) return;
    listenersInstalled = true;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey) return;
      if (event.key !== 'D' && event.key !== 'd') return;
      event.preventDefault();
      const store = useProgressStore.getState();
      const next = !store.developerMode;
      store.setDeveloperMode(next);
      message.info(
        next
          ? '开发者模式已开启：全部题目解锁、可直接看题解、显示调试面板'
          : '开发者模式已关闭',
      );
    };
    window.addEventListener('keydown', onKeyDown);
    // 故意不卸载：整个页面生命周期内只需要一个监听
  }, [message]);

  return {
    developerMode,
    setDeveloperMode,
  };
}
