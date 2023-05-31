import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Post statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to do a deposit", async () => {
    const user = await createUserUseCase.execute({
      name: "Diego da S. Borges",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 4000,
      description: "monthly expense",
      type: "deposit" as OperationType,
      recipient_id: user.id,
      sender_id: user.id,
    });

    expect(result).toEqual(
      expect.objectContaining({
        user_id: result.user_id,
        amount: result.amount,
        description: result.description,
        type: result.type,
        recipient_id: result.recipient_id,
        sender_id: result.sender_id,
      })
    );
  });

  it("Should be able to do a withdraw", async () => {
    const user = await createUserUseCase.execute({
      name: "Diego da S. Borges",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      amount: 400,
      description: "monthly expense",
      type: "deposit" as OperationType,
      recipient_id: user.id,
      sender_id: user.id,
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 200,
      description: "sado for payment of bills",
      type: "withdraw" as OperationType,
      recipient_id: user.id,
      sender_id: user.id,
    });

    expect(result).toEqual(
      expect.objectContaining({
        user_id: result.user_id,
        amount: result.amount,
        description: result.description,
        type: result.type,
        recipient_id: result.recipient_id,
        sender_id: result.sender_id,
      })
    );
  });

  it("Should not be able to do a statement with nonexistent user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "123456",
        amount: 200,
        description: "sado for payment of bills",
        type: "withdraw" as OperationType,
        recipient_id: "123456",
        sender_id: "123456",
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("Should not be able to do a withdraw with insufficient fund", async () => {
    const user = await createUserUseCase.execute({
      name: "Diego da S. Borges",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id,
        amount: 200,
        description: "sado for payment of bills",
        type: "withdraw" as OperationType,
        recipient_id: user.id,
        sender_id: user.id,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
