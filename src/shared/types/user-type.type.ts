export const UserTypes = ["Pro", "Regular"] as const;

export type UserType = typeof UserTypes[number];

export function isUserTypes(userType: string): UserType | undefined {
  return UserTypes.find((el) => el === userType);
}

