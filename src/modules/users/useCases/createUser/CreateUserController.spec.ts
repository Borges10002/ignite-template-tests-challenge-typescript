import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async () => {
    const user = await request(app).post("/api/v1/users").send({
      name: "Diego",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    expect(user.status).toBe(201);
  });

  it("should not be able to create a user with an existing email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Teste",
      email: "teste@email.com",
      password: "teste",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "Teste",
      email: "teste@email.com",
      password: "teste",
    });

    expect(response.status).toBe(400);
  });
});
