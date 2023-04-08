import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("Should be able to get balance of an user", async () => {
    const user = await createUserUseCase.execute({
      name: "Diego da S. Borges",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const result = await getBalanceUseCase.execute({ user_id: user.id });

    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("statement");
  });

  it("Should not be able to get balance of an nonexistent user", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "123456",
      })
    ).rejects.toEqual(new GetBalanceError());
  });
});
