export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const concurrency = Math.max(1, limit);

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const currentItem = items[currentIndex];
      if (currentItem === undefined) {
        continue;
      }
      results[currentIndex] = await worker(currentItem, currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
}
