export const Cities = ['Paris', 'Cologne', 'Brussels',
  'Amsterdam', 'Hamburg', 'Dusseldorf'] as const;

export type CityName = typeof Cities[number];

export function asCity(city: string): CityName | undefined {
  return Cities.find((c) => c === city);
}
