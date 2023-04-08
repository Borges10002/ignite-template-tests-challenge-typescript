import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();

    const password = await hash("test-password", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
      values('${id}','Username','borges10002@gmail.com','${password}')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able to create a new withdraw statement with insufficient funds", async () => {
    const sessions = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "test-password",
    });

    const { token } = sessions.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    const createWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "Withdraw test",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(createWithdraw.status).toBe(400);
  });

  it("should be able to create a new deposit statement", async () => {
    const sessions = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "test-password",
    });

    const { token } = sessions.body;

    const createDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(createDeposit.status).toBe(201);
  });

  it("should be able to create a new withdraw statement", async () => {
    const sessions = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "test-password",
    });

    const { token } = sessions.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    const createWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "Withdraw test",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(createWithdraw.status).toBe(201);
  });

  it("should not be able to create a new statement with a non-existing user", async () => {
    const token = "invalid_token";

    const createDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(createDeposit.status).toBe(401);
  });
});
