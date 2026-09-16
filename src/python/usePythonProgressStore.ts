import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PYTHON_PROBLEMS } from './data';

const ids = new Set(PYTHON_PROBLEMS.map((entry) => entry.problem.id));

interface PythonProgressState {
  completedProblems: string[];
  attemptedProblems: string[];
  lastVisitedProblemId: string;
  drafts: Record<string, string>;
  markCompleted: (id: string) => void;
  markAttempted: (id: string) => void;
  setLastVisited: (id: string) => void;
  setDraft: (id: string, code: string) => void;
  clearDraft: (id: string) => void;
}

export const usePythonProgressStore = create<PythonProgressState>()(persist((set) => ({
  completedProblems: [], attemptedProblems: [], lastVisitedProblemId: '', drafts: {},
  markCompleted: (id) => set((state) => ({ completedProblems: state.completedProblems.includes(id) ? state.completedProblems : [...state.completedProblems, id], attemptedProblems: state.attemptedProblems.filter((item) => item !== id), lastVisitedProblemId: id })),
  markAttempted: (id) => set((state) => ({ attemptedProblems: state.attemptedProblems.includes(id) ? state.attemptedProblems : [...state.attemptedProblems, id], lastVisitedProblemId: id })),
  setLastVisited: (id) => set({ lastVisitedProblemId: id }),
  setDraft: (id, code) => { if (!ids.has(id)) return; set((state) => ({ drafts: state.drafts[id] === code ? state.drafts : { ...state.drafts, [id]: code } })); },
  clearDraft: (id) => set((state) => { const drafts = { ...state.drafts }; delete drafts[id]; return { drafts }; }),
}), { name: 'oiworld:python-progress' }));
