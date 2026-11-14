export const AmenitiesTypes = ["Breakfast", "Air conditioning",
"Laptop friendly workspace", "Baby seat", "Washer", "Towels", "Fridge"] as const;

export type AmenitiesType = typeof AmenitiesTypes[number];

export function isAmenitiesType(amenitiesType: string): AmenitiesType | undefined {
  return AmenitiesTypes.find((el) => el === amenitiesType);
}

