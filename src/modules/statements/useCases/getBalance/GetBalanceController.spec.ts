import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Diego",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const sessions = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const { token } = sessions.body;

    const getBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(getBalance.status).toBe(200);
  });

  it("should not be able to get a balance with a non-existing user", async () => {
    const token = "invalid_token";

    const getBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(getBalance.status).toBe(401);
  });
});
