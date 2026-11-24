import { describe, it, expect } from "vitest";
import { addTodo, toggle, activeCount } from "../src/todos";

describe("todos", () => {
  it("adds a todo with the next id", () => {
    const list = addTodo([], "buy milk");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(1);
    expect(list[0].done).toBe(false);
  });

  it("gives each new todo the next id", () => {
    const list = addTodo(addTodo([], "a"), "b");
    expect(list.map((t) => t.id)).toEqual([1, 2]);
  });

  it("toggles done", () => {
    const list = toggle(addTodo([], "x"), 1);
    expect(list[0].done).toBe(true);
  });

  it("counts active (not done) todos", () => {
    let list = addTodo(addTodo([], "a"), "b");
    list = toggle(list, 1);
    expect(activeCount(list)).toBe(1);
  });
});
