import {User} from "./user.type";

export type Comment = {
  text: string;
  date: string;
  rating: number;
  author: User;
}
