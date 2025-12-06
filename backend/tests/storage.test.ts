import { readPrices, writePrices, PriceHistoryMap } from "../src/data/storage";

describe("Storage Module", () => {
  test("readPrices returns an object", () => {
    const prices = readPrices();
    expect(typeof prices).toBe("object");
  });

  test("writePrices writes changes", () => {
    const original = readPrices();

    const modified: PriceHistoryMap = { ...original };
    modified["TEST"] = [123];

    writePrices(modified);

    const updated = readPrices();
    expect(updated["TEST"][0]).toBe(123);

    // cleanup
    writePrices(original);
  });

  test("written JSON can be read back correctly", () => {
    const data: PriceHistoryMap = { ETH: [1000] };
    writePrices(data);

    const result = readPrices();
    expect(result.ETH[0]).toBe(1000);
  });
});
