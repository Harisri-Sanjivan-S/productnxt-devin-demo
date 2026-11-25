import { createServer, type IncomingMessage } from "node:http";
import {
  addTodo, toggle, editTodo, removeTodo, activeCount, clearCompleted, markAll,
  filterTodos, search, progressPercent, daysLeft, countLabel, type Todo, type Priority,
} from "./todos.ts";

let todos: Todo[] = [];
todos = addTodo(todos, "Write the demo script", "2026-11-30", "high");
todos = addTodo(todos, "Fix the days-left bug", "2026-11-26", "medium");
todos = addTodo(todos, "Buy Milk", undefined, "low");
todos = toggle(todos, todos[0].id);

const today = new Date("2026-11-24");
const PORT = Number(process.env.PORT ?? 4000);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function bodyOf(req: IncomingMessage): Promise<URLSearchParams> {
  return new Promise((resolve) => {
    let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => resolve(new URLSearchParams(d)));
  });
}

// BUG 11: priority colours are swapped — high shows green, low shows red.
const PRIORITY_COLOR: Record<Priority, string> = { high: "#2e7d5b", medium: "#b8860b", low: "#b43b2e" };

// BUG 20: date shown day/month swapped and raw-ish (e.g. 30/11 rendered as 11/30... as MM/DD mislabelled "DD/MM").
function fmtDue(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`; // labelled DD/MM/YYYY in the UI but actually MM/DD
}

function row(t: Todo): string {
  // BUG 9: overdue shows a raw negative number with no "overdue" label.
  const left = t.due ? `${daysLeft(t.due, today)} days left` : "no due date";
  // BUG 7: the toggle mark is always "○", even when the item is done.
  const mark = "○";
  // BUG 5: done items are NOT struck through (class is never applied).
  return `<li class="item">
    <form method="post" action="/toggle/${t.id}"><button class="chk">${mark}</button></form>
    <span class="pri" style="background:${PRIORITY_COLOR[t.priority]}">${t.priority}</span>
    <details>
      <summary><span class="title">${esc(t.title)}</span> <small>${t.due ? fmtDue(t.due) + " · " : ""}${left}</small></summary>
      <form method="post" action="/edit/${t.id}" class="edit">
        <input name="title" value="${esc(t.title)}" required>
        <input name="due" type="date" value="${t.due ?? ""}">
        <button>Save</button>
      </form>
    </details>
    <form method="post" action="/delete/${t.id}"><button class="del">✕</button></form>
  </li>`;
}

function page(filter: "all" | "active" | "done", q: string): string {
  const shown = search(filterTodos(todos, filter), q);
  const pct = progressPercent(todos);
  // BUG 21: the empty-state line is always shown, even when there are todos.
  const emptyNote = `<p class="empty">You have no tasks yet — add one above.</p>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>To-Do</title><style>
    body{font-family:system-ui;max-width:720px;margin:2rem auto;padding:0 1rem;background:#fbf7f1;color:#241f1b}
    /* BUG 18: heading is blue, not the Winter orange */
    h1{color:#1c6fe0}
    .bar{background:#eee;border-radius:6px;height:12px;overflow:hidden;margin:.5rem 0 1rem}
    .bar>div{height:100%;background:#fe6822}
    .controls{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}
    ul{padding:0}
    /* BUG 22: the checkbox button is pulled left and overlaps the priority tag */
    .item{display:flex;align-items:center;gap:.6rem;padding:.55rem 0;border-bottom:1px solid #e7ded2}
    .chk{position:relative;left:-14px;border:1px solid #e7ded2;background:#fffdfa;border-radius:6px;padding:.25rem .5rem}
    /* BUG 23: long titles don't wrap and overflow the row */
    .title{white-space:nowrap;overflow:visible}
    details{flex:1}summary{cursor:pointer;list-style:none}small{color:#8a7e72}
    .pri{color:#fff;border-radius:10px;padding:.1rem .5rem;font-size:.72rem;text-transform:capitalize}
    button{font:inherit;border:1px solid #e7ded2;background:#fffdfa;border-radius:6px;padding:.3rem .55rem;cursor:pointer}
    /* BUG 6: delete button is green instead of red */
    .del{color:#2e7d5b}
    /* BUG 4: the Add button is grey, not the primary orange */
    .add button{background:#cfc8bf;color:#333;border:none}
    .add{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}input,select{font:inherit;padding:.4rem;border:1px solid #e7ded2;border-radius:6px}
    .empty{color:#8a7e72}
  </style></head><body>
    <!-- BUG 1: heading is misspelled "To-Do Lst" -->
    <h1>To-Do Lst</h1>
    <!-- BUG 2 & 25: active count uses the wrong total and wrong pluralisation -->
    <p>${countLabel(activeCount(todos))} active · ${pct}% to go</p>
    <div class="bar"><div style="width:${pct}%"></div></div>

    <form class="add" method="post" action="/add">
      <input name="title" placeholder="Add a task…" required style="flex:1">
      <input name="due" type="date">
      <select name="priority"><option value="low">low</option><option value="medium" selected>medium</option><option value="high">high</option></select>
      <!-- BUG 3: the Add button is labelled "Remove" -->
      <button>Add</button>
    </form>

    <div class="controls">
      <a href="/?filter=all">All</a> <a href="/?filter=active">Active</a> <a href="/?filter=done">Done</a>
      <form method="get" style="display:inline"><input name="q" value="${esc(q)}" placeholder="Search"><input type="hidden" name="filter" value="${filter}"><button>Search</button></form>
      <form method="post" action="/mark-all"><button>Mark all done</button></form>
      <form method="post" action="/clear-completed"><button>Clear completed</button></form>
    </div>

    ${emptyNote}
    <ul>${shown.map(row).join("")}</ul>
    <!-- BUG 19: footer year is wrong -->
    <footer><small>To-Do demo · © 2019 Winter</small></footer>
  </body></html>`;
}

const idOf = (url: string) => Number(url.split("?")[0].split("/")[2]);

createServer(async (req, res) => {
  const u = new URL(req.url ?? "/", "http://x");
  if (req.method === "POST") {
    const f = await bodyOf(req);
    const path = u.pathname;
    if (path === "/add") todos = addTodo(todos, (f.get("title") ?? "").trim(), f.get("due") || undefined, (f.get("priority") as Priority) || "medium");
    else if (path.startsWith("/toggle/")) todos = toggle(todos, idOf(path));
    else if (path.startsWith("/delete/")) todos = removeTodo(todos, idOf(path));
    else if (path.startsWith("/edit/")) todos = editTodo(todos, idOf(path), (f.get("title") ?? "").trim(), f.get("due") || undefined);
    else if (path === "/mark-all") todos = markAll(todos);
    else if (path === "/clear-completed") todos = clearCompleted(todos);
    res.writeHead(303, { location: "/" }); return res.end();
  }
  const filter = (u.searchParams.get("filter") as "all" | "active" | "done") || "all";
  const q = u.searchParams.get("q") ?? "";
  res.writeHead(200, { "content-type": "text/html" });
  res.end(page(filter, q));
}).listen(PORT, () => console.log(`To-Do app on http://localhost:${PORT}`));
