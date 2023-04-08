import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();

    const password = await hash("123456", 8);

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

  it("should be able to get a statement operation", async () => {
    const sessions = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const { token } = sessions.body;

    const createDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    const { id } = createDeposit.body;

    const getStatementOperation = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(getStatementOperation.status).toBe(200);
  });

  it("should not be able to get a statement operation with a non-existent id", async () => {
    const sessions = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const { token } = sessions.body;
    const id = "290d13ec-9158-4b47-a5bf-5a943cfce614";

    const getStatementOperation = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(getStatementOperation.status).toBe(404);
  });

  it("should not be able to get a statement operation with a invalid token", async () => {
    const token = "invalid-token";
    const id = "290d13ec-9158-4b47-a5bf-5a943cfce614";

    const getStatementOperation = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(getStatementOperation.status).toBe(401);
  });
});
