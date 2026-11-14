export const Cities = ['Paris', 'Cologne', 'Brussels',
  'Amsterdam', 'Hamburg', 'Dusseldorf'] as const;

export type City = typeof Cities[number];

export function asCity(city: string): City | undefined {
  return Cities.find((c) => c === city);
}
