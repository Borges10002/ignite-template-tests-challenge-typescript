import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();

    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
      values('${id}','Diego','borges10002@gmail.com','${password}')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "borges10002@gmail.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.name).toEqual("Diego");
    expect(response.body.user.email).toEqual("borges10002@gmail.com");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non existing user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "teste-email",
      password: "test",
    });

    expect(response.status).toBe(401);
  });
});
