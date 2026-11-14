export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomItem<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('No item found.');
  }
  return items[random(0, items.length)];
}
