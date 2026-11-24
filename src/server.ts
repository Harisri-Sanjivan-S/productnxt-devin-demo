import { createServer, type IncomingMessage } from "node:http";
import {
  addTodo, toggle, editTodo, removeTodo, activeCount, daysLeft, type Todo,
} from "./todos.ts";

let todos: Todo[] = [];
todos = addTodo(todos, "Write the demo script", "2026-11-30");
todos = addTodo(todos, "Fix the days-left bug", "2026-11-26");
todos = addTodo(todos, "Buy milk");
todos = toggle(todos, 3);

const today = new Date("2026-11-24");
const PORT = Number(process.env.PORT ?? 4000);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function body(req: IncomingMessage): Promise<URLSearchParams> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(new URLSearchParams(data)));
  });
}

function row(t: Todo): string {
  const due = t.due ? `due ${t.due} · <strong>${daysLeft(t.due, today)} days left</strong>` : "no due date";
  return `<li class="${t.done ? "done" : ""}">
    <form method="post" action="/toggle/${t.id}"><button class="chk" title="Toggle done">${t.done ? "✓" : "○"}</button></form>
    <details class="item">
      <summary><span class="title">${esc(t.title)}</span> <small>${due}</small></summary>
      <form method="post" action="/edit/${t.id}" class="edit">
        <input name="title" value="${esc(t.title)}" required>
        <input name="due" type="date" value="${t.due ?? ""}">
        <button>Save</button>
      </form>
    </details>
    <form method="post" action="/delete/${t.id}"><button class="del" title="Delete">✕</button></form>
  </li>`;
}

function page(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>To-Do</title><style>
    body{font-family:system-ui;max-width:680px;margin:2.5rem auto;color:#241f1b;background:#fbf7f1;padding:0 1rem}
    h1{color:#fe6822;margin-bottom:.25rem}.sub{color:#8a7e72;margin-top:0}
    ul{padding:0;margin:1.5rem 0}li{display:flex;align-items:center;gap:.6rem;padding:.55rem 0;border-bottom:1px solid #e7ded2}
    li.done .title{color:#999;text-decoration:line-through}small{color:#8a7e72}
    form{margin:0}.item{flex:1}summary{cursor:pointer;list-style:none}
    button{font:inherit;border:1px solid #e7ded2;background:#fffdfa;border-radius:6px;padding:.25rem .5rem;cursor:pointer}
    .chk{color:#2e7d5b;font-weight:700}.del{color:#b43b2e;border-color:#f0d6d1}
    .add,.edit{display:flex;gap:.5rem;margin-top:.5rem}.add{margin:1.5rem 0}input{font:inherit;padding:.4rem .5rem;border:1px solid #e7ded2;border-radius:6px}
    .add input[name=title]{flex:1}button.primary{background:#fe6822;color:#fff;border-color:#fe6822;font-weight:600}
  </style></head><body>
    <h1>To-Do</h1>
    <p class="sub">${activeCount(todos)} active, ${todos.length - activeCount(todos)} done. Demo app for Bug-to-PR with Devin — the &ldquo;days left&rdquo; figures carry the planted bug.</p>
    <form class="add" method="post" action="/add">
      <input name="title" placeholder="Add a task…" required>
      <input name="due" type="date" title="Due date (optional)">
      <button class="primary">Add</button>
    </form>
    <ul>${todos.map(row).join("")}</ul>
  </body></html>`;
}

const seeId = (url: string) => Number(url.split("/")[2]);

createServer(async (req, res) => {
  const url = req.url ?? "/";
  if (req.method === "POST") {
    const form = await body(req);
    if (url === "/add") {
      todos = addTodo(todos, (form.get("title") ?? "").trim(), form.get("due") || undefined);
    } else if (url.startsWith("/toggle/")) {
      todos = toggle(todos, seeId(url));
    } else if (url.startsWith("/delete/")) {
      todos = removeTodo(todos, seeId(url));
    } else if (url.startsWith("/edit/")) {
      todos = editTodo(todos, seeId(url), { title: (form.get("title") ?? "").trim(), due: form.get("due") || undefined });
    }
    res.writeHead(303, { location: "/" }); // Post/Redirect/Get
    return res.end();
  }
  res.writeHead(200, { "content-type": "text/html" });
  res.end(page());
}).listen(PORT, () => console.log(`To-Do app on http://localhost:${PORT}`));
