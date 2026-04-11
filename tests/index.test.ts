import { describe, it, expect, vi } from "vitest";
import UsablePromise, { createUsable } from "../src/index";

describe("UsablePromise", () => {
  describe("instanceof", () => {
    it("is an instance of Promise", () => {
      const p = new UsablePromise<number>((resolve) => resolve(1));

      expect(p).toBeInstanceOf(Promise);
    });

    it("is an instance of UsablePromise", () => {
      const p = new UsablePromise<number>((resolve) => resolve(1));

      expect(p).toBeInstanceOf(UsablePromise);
    });
  });

  describe("lazy execution", () => {
    it("does not execute the task before .then() is called", () => {
      const task = vi.fn((resolve: (v: number) => void) => resolve(1));

      new UsablePromise(task);

      expect(task).not.toHaveBeenCalled();
    });

    it("executes the task on first .then() call", async () => {
      const task = vi.fn((resolve: (v: number) => void) => resolve(1));
      const p = new UsablePromise(task);

      await p;

      expect(task).toHaveBeenCalledOnce();
    });
  });

  describe("memoization", () => {
    it("executes the task only once across multiple .then() calls", async () => {
      const task = vi.fn((resolve: (v: number) => void) => resolve(42));
      const p = new UsablePromise(task);

      await Promise.all([p.then((v) => v), p.then((v) => v), p.then((v) => v)]);

      expect(task).toHaveBeenCalledOnce();
    });
  });

  describe("resolution", () => {
    it("resolves with the value passed to resolve()", async () => {
      const p = new UsablePromise<string>((resolve) => resolve("hello"));

      await expect(p).resolves.toBe("hello");
    });

    it("resolves with a PromiseLike value", async () => {
      const p = new UsablePromise<number>((resolve) =>
        resolve(Promise.resolve(99)),
      );

      await expect(p).resolves.toBe(99);
    });
  });

  describe("rejection", () => {
    it("rejects when reject() is called", async () => {
      const error = new Error("boom");
      const p = new UsablePromise<number>((_, reject) => reject(error));

      await expect(p).rejects.toThrow("boom");
    });

    it("propagates rejection to all chained .then() calls", async () => {
      const error = new Error("fail");
      const p = new UsablePromise<number>((_, reject) => reject(error));

      await expect(p.then((v) => v)).rejects.toThrow("fail");
      await expect(p.then((v) => v)).rejects.toThrow("fail");
    });
  });

  describe("chaining", () => {
    it("returns a plain Promise from .then()", () => {
      const p = new UsablePromise<number>((resolve) => resolve(1));
      const chained = p.then((v) => v * 2);

      expect(chained).toBeInstanceOf(Promise);
    });

    it("passes the resolved value through .then() transforms", async () => {
      const p = new UsablePromise<number>((resolve) => resolve(5));

      await expect(p.then((v) => v * 2)).resolves.toBe(10);
    });
  });
});

describe("createUsable", () => {
  describe("return type", () => {
    it("returns a UsablePromise", () => {
      const result = createUsable(() => 1);

      expect(result).toBeInstanceOf(UsablePromise);
    });
  });

  describe("lazy execution", () => {
    it("does not call the factory before the promise is awaited", () => {
      const factory = vi.fn(() => 42);

      createUsable(factory);

      expect(factory).not.toHaveBeenCalled();
    });

    it("calls the factory when the promise is first awaited", async () => {
      const factory = vi.fn(() => 42);
      const p = createUsable(factory);

      await p;

      expect(factory).toHaveBeenCalledOnce();
    });
  });

  describe("memoization", () => {
    it("calls the factory only once across multiple awaits", async () => {
      const factory = vi.fn(() => 7);
      const p = createUsable(factory);

      await Promise.all([p, p, p]);

      expect(factory).toHaveBeenCalledOnce();
    });
  });

  describe("resolution", () => {
    it("resolves with the value returned by a sync factory", async () => {
      const p = createUsable(() => "sync-value");

      await expect(p).resolves.toBe("sync-value");
    });

    it("resolves with the value returned by an async factory", async () => {
      const p = createUsable(async () => "async-value");

      await expect(p).resolves.toBe("async-value");
    });

    it("resolves with the value from a factory returning a Promise", async () => {
      const p = createUsable(() => Promise.resolve(123));

      await expect(p).resolves.toBe(123);
    });
  });

  describe("rejection", () => {
    it("rejects when the async factory throws", async () => {
      const p = createUsable(async () => {
        throw new Error("async error");
      });

      await expect(p).rejects.toThrow("async error");
    });

    it("rejects when the factory returns a rejected Promise", async () => {
      const p = createUsable(() => Promise.reject(new Error("rejected")));

      await expect(p).rejects.toThrow("rejected");
    });
  });
});
