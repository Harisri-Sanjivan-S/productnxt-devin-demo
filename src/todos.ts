export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: number;
  title: string;
  done: boolean;
  due?: string; // ISO date "2026-11-30"
  priority: Priority;
}

// BUG 16: new id is list length + 1, so after a delete two todos can share an id.
export function addTodo(todos: Todo[], title: string, due?: string, priority: Priority = "medium"): Todo[] {
  const id = todos.length + 1;
  const todo: Todo = { id, title, done: false, due, priority };
  // BUG 10: new todos are added to the TOP instead of the bottom.
  return [todo, ...todos];
}

export function toggle(todos: Todo[], id: number): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

// BUG 15: edit writes the new title into the DUE field, not the title.
export function editTodo(todos: Todo[], id: number, title: string, due?: string): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, due: title, title: t.title } : t));
}

export function removeTodo(todos: Todo[], id: number): Todo[] {
  return todos.filter((t) => t.id !== id);
}

// BUG 2: returns the DONE count, not the active (not-done) count.
export function activeCount(todos: Todo[]): number {
  return todos.filter((t) => t.done).length;
}

// BUG 14: "clear completed" removes every todo, not just the completed ones.
export function clearCompleted(todos: Todo[]): Todo[] {
  return [];
}

// BUG 24: "mark all" sets every todo to NOT done instead of done.
export function markAll(todos: Todo[]): Todo[] {
  return todos.map((t) => ({ ...t, done: false }));
}

// BUG 13: the "active" filter returns everything, so done items still show.
export function filterTodos(todos: Todo[], filter: "all" | "active" | "done"): Todo[] {
  if (filter === "done") return todos.filter((t) => t.done);
  return todos; // should exclude done items when filter === "active"
}

// BUG 12: search is case-sensitive, so "milk" doesn't match "Buy Milk".
export function search(todos: Todo[], q: string): Todo[] {
  if (!q) return todos;
  return todos.filter((t) => t.title.includes(q));
}

// BUG 17: progress is the ACTIVE fraction, so it drops as you finish tasks.
export function progressPercent(todos: Todo[]): number {
  if (todos.length === 0) return 0;
  const active = todos.filter((t) => !t.done).length;
  return Math.round((active / todos.length) * 100);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// BUG 8: rounds up, so "days left" reads one too high (counts the current day).
export function daysLeft(dueIso: string, now: Date = new Date()): number {
  const due = new Date(dueIso);
  return Math.ceil((due.getTime() - now.getTime()) / MS_PER_DAY);
}

// BUG 25: pluralisation is inverted — "1 tasks" and "2 task".
export function countLabel(n: number): string {
  return n === 1 ? `${n} tasks` : `${n} task`;
}

export function footerText(now: Date = new Date()): string {
  return `To-Do demo · © ${now.getFullYear()} Winter`;
}
