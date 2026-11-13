import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("AgriSage API End-to-End Suite", () => {
  it("GET /health should return healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.service).toBe("agrisage-api");
  });

  it("GET /api/v1/health should return healthy status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.service).toBe("agrisage-api-v1");
  });

  it("GET /api/v1/crops/categories should return crop categories", async () => {
    const res = await request(app).get("/api/v1/crops/categories");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const categoryIds = res.body.data.map((c: { id: string }) => c.id);
    expect(categoryIds).toContain("cereal");
    expect(categoryIds).toContain("pulse");
    expect(categoryIds).toContain("vegetable");
  });

  it("GET /api/v1/farms without authorization should return 401 UNAUTHORIZED", async () => {
    const res = await request(app).get("/api/v1/farms");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/v1/ai/crop-recommendations without auth should return 401", async () => {
    const res = await request(app).post("/api/v1/ai/crop-recommendations").send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/v1/ai/crop-recommendations with invalid body should return 400 validation error", async () => {
    const res = await request(app)
      .post("/api/v1/ai/crop-recommendations")
      .set("Authorization", "Bearer dev-test-token-test-user-1")
      .send({
        // Missing required fields like farm_id, season, soil_type, etc.
        invalidField: "nonsense",
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET undefined route returns 404 ROUTE_NOT_FOUND", async () => {
    const res = await request(app).get("/api/v1/non-existent-route");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
