import request from "supertest";
import express from "express";
import priceRoutes from "../src/routes/prices";

const app = express();
app.use(express.json());
app.use("/api", priceRoutes);

describe("API Route /price/:asset", () => {
  test("returns 200 and history array", async () => {
    const res = await request(app).get("/api/price/ETH");

    expect(res.status).toBe(200);
    expect(res.body.history).toBeInstanceOf(Array);
  });

  test("history items include timestamp and price", async () => {
    const res = await request(app).get("/api/price/ETH");

    const item = res.body.history[0];
    expect(item).toHaveProperty("timestamp");
    expect(item).toHaveProperty("price");
  });

  test("returns 404 for unknown asset", async () => {
    const res = await request(app).get("/api/price/UNKNOWN123");
    expect(res.status).toBe(404);
  });
});
