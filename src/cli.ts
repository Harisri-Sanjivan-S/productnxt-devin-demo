import { addTodo, toggle, activeCount, daysLeft, type Todo } from "./todos.ts";

// A tiny run so you can see the library work. `npm start`.
let todos: Todo[] = [];
todos = addTodo(todos, "Write the demo script", "2026-11-30");
todos = addTodo(todos, "Fix the days-left bug", "2026-11-26");
todos = addTodo(todos, "Buy milk");
todos = toggle(todos, 3); // mark "Buy milk" done

const today = new Date("2026-11-24");

console.log("To-Do");
console.log("=====");
for (const t of todos) {
  const mark = t.done ? "[x]" : "[ ]";
  const due = t.due ? ` (due ${t.due}, ${daysLeft(t.due, today)} days left)` : "";
  console.log(`${mark} ${t.id}. ${t.title}${due}`);
}
console.log(`\n${activeCount(todos)} active, ${todos.length - activeCount(todos)} done.`);
