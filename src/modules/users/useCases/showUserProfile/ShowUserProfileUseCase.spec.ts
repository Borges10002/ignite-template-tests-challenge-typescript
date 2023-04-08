import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "diego",
      email: "borges10002@gmail.com",
      password: "123456",
    });

    const user_id = user.id;

    const result = await showUserProfileUseCase.execute(user_id);

    expect(result).toEqual(
      expect.objectContaining({
        id: result.id,
        name: "diego",
        email: "borges10002@gmail.com",
        password: result.password,
      })
    );
  });

  it("Should not be able to show a user profile of an nonexistent user", async () => {
    const user_id = "123456";

    await expect(showUserProfileUseCase.execute(user_id)).rejects.toEqual(
      new ShowUserProfileError()
    );
  });
});
