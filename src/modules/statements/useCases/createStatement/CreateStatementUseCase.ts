import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    recipient_id,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);
    const recipient_user = await this.usersRepository.findById(recipient_id);

    if (!user || !recipient_user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (type === "withdraw" || type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    if (type !== "transfer") {
      recipient_id = "null";
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
      recipient_id,
      sender_id: "null",
    });

    if (type === "transfer") {
      await this.statementsRepository.create({
        user_id: recipient_id,
        type: "transfer" as OperationType,
        amount,
        description,
        recipient_id,
        sender_id: user_id,
      });
    }

    return statementOperation;
  }
}
