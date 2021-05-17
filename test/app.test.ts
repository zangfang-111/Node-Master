import request from "supertest";
import app from "../src/app";

describe("GET /app/health", () => {
  it("should return 200", (done) => {
    request(app).get("/app/health").expect(200, done);
  });
});
