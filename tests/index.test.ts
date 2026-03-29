import { describe, it, expect } from "vitest";
import { createUsable } from "../src/index.js";

describe("createUsable", () => {
  it("returns the same promise", () => {
    const promise = Promise.resolve(42);
    expect(createUsable(promise)).toBe(promise);
  });

  it("is pending initially", () => {
    const usable = createUsable(new Promise<void>(() => {}));
    expect(usable.status).toBe("pending");
  });

  it("becomes fulfilled with the resolved value", async () => {
    const usable = createUsable(Promise.resolve(42));
    await usable;
    expect(usable.status).toBe("fulfilled");
    if (usable.status === "fulfilled") {
      expect(usable.value).toBe(42);
    }
  });

  it("becomes rejected with the rejection reason", async () => {
    const error = new Error("oops");
    const usable = createUsable(Promise.reject(error));
    await usable.catch(() => {});
    expect(usable.status).toBe("rejected");
    if (usable.status === "rejected") {
      expect(usable.reason).toBe(error);
    }
  });
});
