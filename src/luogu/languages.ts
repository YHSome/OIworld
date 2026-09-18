/**
 * 洛谷评测语言编号。
 *
 * id 与名称直接取自洛谷前端配置 https://www.luogu.com.cn/_lfe/config 的
 * CodeLanguage 枚举（提交时的 body 里 `lang` 就是这个 id）。
 * 本站四个靶场分别映射到最合适的语言版本：
 *   C++ 靶场 / Pro 靶场 → C++20（本站编辑器用的就是 -std=c++20）
 *   Python 靶场         → Python 3
 *   Java 靶场           → Java 8（洛谷同时提供 Java 21，可手动切换）
 */

export interface LuoguLanguage {
  id: number;
  name: string;
  /** 是否支持开启 O2 优化 */
  canO2?: boolean;
  /** 归属分组，仅用于下拉框分组显示 */
  group: string;
}

export const LUOGU_LANGUAGES: LuoguLanguage[] = [
  { id: 27, name: 'C++20', canO2: true, group: 'C / C++' },
  { id: 12, name: 'C++17', canO2: true, group: 'C / C++' },
  { id: 11, name: 'C++14', canO2: true, group: 'C / C++' },
  { id: 28, name: 'C++14 (GCC 9)', canO2: true, group: 'C / C++' },
  { id: 4, name: 'C++11', canO2: true, group: 'C / C++' },
  { id: 3, name: 'C++98', canO2: true, group: 'C / C++' },
  { id: 34, name: 'C++23', canO2: true, group: 'C / C++' },
  { id: 2, name: 'C', canO2: true, group: 'C / C++' },
  { id: 7, name: 'Python 3', group: 'Python' },
  { id: 25, name: 'PyPy 3', group: 'Python' },
  { id: 6, name: 'Python 2', group: 'Python' },
  { id: 24, name: 'PyPy 2', group: 'Python' },
  { id: 8, name: 'Java 8', group: 'Java / JVM' },
  { id: 33, name: 'Java 21', group: 'Java / JVM' },
  { id: 21, name: 'Kotlin/JVM', group: 'Java / JVM' },
  { id: 22, name: 'Scala', group: 'Java / JVM' },
  { id: 14, name: 'Go', group: '其他' },
  { id: 15, name: 'Rust', group: '其他' },
  { id: 19, name: 'Haskell', group: '其他' },
  { id: 30, name: 'OCaml', group: '其他' },
  { id: 31, name: 'Julia', group: '其他' },
  { id: 32, name: 'Lua', group: '其他' },
  { id: 17, name: 'C# Mono', group: '其他' },
  { id: 1, name: 'Pascal', group: '其他' },
];

export type LuoguTrack = 'cpp' | 'python' | 'java';

/** 各靶场默认使用的洛谷语言 */
export const LUOGU_DEFAULT_LANGUAGE: Record<LuoguTrack, number> = {
  cpp: 27,
  python: 7,
  java: 8,
};

export function getLuoguLanguage(id: number | undefined | null): LuoguLanguage | undefined {
  if (id === undefined || id === null) return undefined;
  return LUOGU_LANGUAGES.find((item) => item.id === id);
}

export function getLuoguLanguageName(id: number | undefined | null): string {
  const language = getLuoguLanguage(id);
  return language ? language.name : id === undefined || id === null ? '未知语言' : `语言 #${id}`;
}

/** 按分组整理成 antd Select 需要的 options */
export function getLuoguLanguageOptions() {
  const groups = new Map<string, { label: string; value: number }[]>();
  for (const language of LUOGU_LANGUAGES) {
    const list = groups.get(language.group) ?? [];
    list.push({ label: language.name, value: language.id });
    groups.set(language.group, list);
  }
  return [...groups.entries()].map(([label, options]) => ({ label, options }));
}
