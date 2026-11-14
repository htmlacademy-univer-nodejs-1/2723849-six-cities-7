export const HousingTypes = ["apartment", "house", "room", "hotel"] as const;
export type HousingType = typeof HousingTypes[number];

export function isHousingType(houseType: string): HousingType | undefined {
  return HousingTypes.find((el) => el === houseType);
}

