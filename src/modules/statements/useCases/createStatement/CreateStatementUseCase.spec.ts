import { OperationType } from "../../../../modules/statements/entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { v4 as uuid } from "uuid";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to create a deposit statement", async () => {
    const newUser = await createUserUseCase.execute({
      name: "Tarcizio",
      email: "tarcizio@io.com.br",
      password: "k9sonwow1%",
    });

    const newStatement = await createStatementUseCase.execute({
      user_id: newUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Emergency found",
    });

    expect(newStatement).toHaveProperty("id");
    expect(newStatement.type).toEqual("deposit");
  });

  it("Should be able to create a withdraw statement", async () => {
    const newUser = await createUserUseCase.execute({
      name: "Tarcizio",
      email: "tarcizio@io.com.br",
      password: "k9sonwow1%",
    });

    await createStatementUseCase.execute({
      user_id: newUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Emergency found",
    });

    const withdrawStatement = await createStatementUseCase.execute({
      user_id: newUser.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "Withdraw emergency",
    });

    expect(withdrawStatement).toHaveProperty("id");
    expect(withdrawStatement.type).toEqual("withdraw");
  });

  it("Should not be able to create a statement if the user does not exist", () => {
    const id = uuid();

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Emergency found",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a statement if the balance is less than the withdraw", async () => {
    const newUser = await createUserUseCase.execute({
      name: "Tarcizio",
      email: "tarcizio@io.com.br",
      password: "k9sonwow1%",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: newUser.id as string,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Withdraw emergency",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
