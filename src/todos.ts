export interface Todo {
  id: number;
  title: string;
  done: boolean;
  due?: string; // ISO date, e.g. "2026-11-12"
}

export function addTodo(todos: Todo[], title: string, due?: string): Todo[] {
  const id = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [...todos, { id, title, done: false, due }];
}

export function toggle(todos: Todo[], id: number): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function editTodo(todos: Todo[], id: number, fields: Partial<Pick<Todo, "title" | "due">>): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, ...fields } : t));
}

export function removeTodo(todos: Todo[], id: number): Todo[] {
  return todos.filter((t) => t.id !== id);
}

export function activeCount(todos: Todo[]): number {
  return todos.filter((t) => !t.done).length;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Days left until a todo is due.
// The current day is not counted: a todo due 2026-11-12, viewed on
// 2026-11-06, shows 5 days left.
export function daysLeft(dueIso: string, now: Date = new Date()): number {
  const due = new Date(dueIso);
  return Math.ceil((due.getTime() - now.getTime()) / MS_PER_DAY) - 1;
}
