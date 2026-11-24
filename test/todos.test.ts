import { describe, it, expect } from "vitest";
import { addTodo, toggle } from "../src/todos";

// The demo app carries deliberately-planted bugs for the Bug-to-PR demo, so
// only a couple of invariants are asserted here to keep `main` green.
describe("todos", () => {
  it("adds a todo", () => {
    const list = addTodo([], "buy milk");
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("buy milk");
    expect(list[0].done).toBe(false);
  });

  it("toggles done", () => {
    const list = toggle(addTodo([], "x"), 1);
    expect(list[0].done).toBe(true);
  });
});
