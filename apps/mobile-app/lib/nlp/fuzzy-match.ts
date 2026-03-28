import type { ClientDisplay } from "@/services/clients/useClients";

const MATCH_THRESHOLD = 0.72;

function jaro(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matchDist = Math.max(
    Math.floor(Math.max(a.length, b.length) / 2) - 1,
    0
  );

  const aMatches = new Array<boolean>(a.length).fill(false);
  const bMatches = new Array<boolean>(b.length).fill(false);

  let matches = 0;

  for (let i = 0; i < a.length; i++) {
    const lo = Math.max(0, i - matchDist);
    const hi = Math.min(i + matchDist + 1, b.length);
    for (let j = lo; j < hi; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  return (
    (matches / a.length +
      matches / b.length +
      (matches - transpositions / 2) / matches) /
    3
  );
}

function jaroWinkler(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const j = jaro(a, b);

  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(a.length, b.length)); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }

  return j + prefix * 0.1 * (1 - j);
}

export interface FuzzyMatchResult {
  client: ClientDisplay;
  score: number;
}

export function fuzzyMatch(
  name: string,
  clients: ClientDisplay[]
): FuzzyMatchResult | null {
  if (!name.trim() || clients.length === 0) return null;

  let best: FuzzyMatchResult | null = null;

  for (const client of clients) {
    const fullScore = jaroWinkler(name, client.name);
    // Compare against each individual name part (first, last, etc.)
    const nameParts = client.name.split(" ");
    const partScores = nameParts.map((part) => jaroWinkler(name, part));
    const score = Math.max(fullScore, ...partScores);

    if (score > (best?.score ?? 0)) {
      best = { client, score };
    }
  }

  return best && best.score >= MATCH_THRESHOLD ? best : null;
}
