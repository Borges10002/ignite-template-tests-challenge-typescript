import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO = Pick<
  Statement,
  "user_id" | "description" | "amount" | "type" | "recipient_id" | "sender_id"
>;
