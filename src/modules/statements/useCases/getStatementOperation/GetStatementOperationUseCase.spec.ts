import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";

import { OperationType } from "../../entities/Statement";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to get a statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Diego da S. Borges",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 400,
      description: "monthly expense",
      type: "deposit" as OperationType,
      recipient_id: user.id,
      sender_id: user.id,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: statement.user_id,
      statement_id: statement.id,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: result.id,
        user_id: result.user_id,
        type: result.type,
        amount: result.amount,
        description: result.description,
      })
    );
  });

  it("Should not be able to get a statement of a nonexistent user", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: "123456",
        statement_id: "12456",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("Should not be able to get a nonexistent statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Diego da S. Borges",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "123456",
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});
