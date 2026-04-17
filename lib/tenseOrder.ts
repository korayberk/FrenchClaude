export interface TenseConfig {
  order: number;
  zone: string;
}

const TENSE_MAP: Array<[string, TenseConfig]> = [
  ["plus-que-parfait",    { order: 0, zone: "distant past" }],
  ["passé simple",        { order: 1, zone: "past" }],
  ["imparfait",           { order: 2, zone: "past" }],
  ["passé composé",       { order: 3, zone: "near past" }],
  ["présent",             { order: 4, zone: "present" }],
  ["futur proche",        { order: 5, zone: "near future" }],
  ["futur simple",        { order: 6, zone: "future" }],
  ["conditionnel",        { order: 7, zone: "hypothetical" }],
];

export function getTenseConfig(tense: string): TenseConfig {
  const lower = tense.toLowerCase();
  for (const [key, config] of TENSE_MAP) {
    if (lower.includes(key)) return config;
  }
  return { order: 4, zone: "" };
}
