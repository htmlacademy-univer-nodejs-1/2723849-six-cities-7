import {UserType} from "./user-type.type";

export type User = {
  name: string;
  email: string;
  avatar?: string;
  type: UserType;
}
