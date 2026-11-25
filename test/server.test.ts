import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

const PORT = 4000 + Math.floor(Math.random() * 1000) + 1000;
const serverPath = fileURLToPath(new URL("../src/server.ts", import.meta.url));
let proc: ChildProcess;

beforeAll(async () => {
  proc = spawn(process.execPath, [serverPath], { env: { ...process.env, PORT: String(PORT) } });
  await new Promise<void>((resolve, reject) => {
    proc.stdout!.on("data", (d) => String(d).includes("To-Do app on") && resolve());
    proc.on("exit", (code) => reject(new Error(`server exited with ${code}`)));
  });
});

afterAll(() => {
  proc?.kill();
});

describe("server page", () => {
  it('labels the add-task button "Add" (DXP-003)', async () => {
    const html = await (await fetch(`http://localhost:${PORT}/`)).text();
    const addForm = html.match(/<form class="add"[\s\S]*?<\/form>/)?.[0] ?? "";
    const buttons = [...addForm.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1].trim());
    expect(buttons).toEqual(["Add"]);
  });
});
