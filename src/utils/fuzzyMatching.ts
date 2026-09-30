// Jaro-Winkler and Token Sort Fuzzy string matching algorithms for RPL Name Matching

export function jaroSimilarity(s1: string, s2: string): number {
  const str1 = s1.trim().toLowerCase();
  const str2 = s2.trim().toLowerCase();

  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const matchDistance = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
  const s1Matches = new Array(str1.length).fill(false);
  const s2Matches = new Array(str2.length).fill(false);

  let matches = 0;
  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, str2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (str1[i] !== str2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  let transpositions = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const sim =
    (matches / str1.length +
      matches / str2.length +
      (matches - transpositions / 2) / matches) /
    3.0;

  return sim;
}

export function jaroWinkler(s1: string, s2: string, prefixScale: number = 0.1): number {
  const jaro = jaroSimilarity(s1, s2);
  let prefix = 0;
  const str1 = s1.trim().toLowerCase();
  const str2 = s2.trim().toLowerCase();
  const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));

  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return Math.min(1.0, jaro + prefix * prefixScale * (1 - jaro));
}

// Token Sort Ratio: sorts words and computes Levenshtein/Jaro similarity
export function tokenSortRatio(s1: string, s2: string): number {
  const normalizeTokens = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(' ');

  const sorted1 = normalizeTokens(s1);
  const sorted2 = normalizeTokens(s2);

  if (sorted1 === sorted2 && sorted1 !== '') return 100;
  return Math.round(jaroWinkler(sorted1, sorted2) * 100);
}
