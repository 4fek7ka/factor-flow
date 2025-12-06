import { generateNextPrice } from "../src/generators/priceGenerator";

describe("Price Generator", () => {
  test("returns a number", () => {
    const price = generateNextPrice(1000);
    expect(typeof price).toBe("number");
  });

  test("price is not negative", () => {
    const price = generateNextPrice(1);
    expect(price).toBeGreaterThan(0);
  });

  test("price is within reasonable bounds", () => {
    const price = generateNextPrice(1000);
    expect(price).toBeGreaterThan(800);
    expect(price).toBeLessThan(1200);
  });

  test("multiple calls produce different prices", () => {
    const p1 = generateNextPrice(1000);
    const p2 = generateNextPrice(1000);
    expect(p1).not.toBe(p2);
  });
});
