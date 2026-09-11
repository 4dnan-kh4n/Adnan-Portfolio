const symbols = ["✦", "✧", "✺", "✣"];

export function makePuzzle(random = Math.random) {
  const pick = (count) => Math.min(count - 1, Math.floor(random() * count));
  const commonIndex = pick(symbols.length);
  const oddIndex = (commonIndex + 1 + pick(symbols.length - 1)) % symbols.length;
  return { common: symbols[commonIndex], odd: symbols[oddIndex], position: pick(9) };
}
