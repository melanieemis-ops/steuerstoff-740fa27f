import { getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const MONTHS_DE = [
  "Januar",
  "Februar",
  "Maerz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const LAW_MAP: Record<string, string> = {
  AO: "Abgabenordnung",
  EStG: "Einkommensteuergesetz",
  UStG: "Umsatzsteuergesetz",
  BGB: "Buergerliches Gesetzbuch",
};

const SIMPLE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bi\.\s*V\.\s*m\./gi, "in Verbindung mit"],
  [/\bz\.\s*B\./gi, "zum Beispiel"],
  [/\bAbs\./gi, "Absatz"],
  [/\bNr\./gi, "Nummer"],
  [/\bi\.\s*H\.\s*v\./gi, "in Hoehe von"],
  [/\bzzgl\./gi, "zuzueglich"],
  [/\bff\./gi, "folgende"],
  [/§§/g, "Paragraphen"],
  [/§/g, "Paragraph"],
];

function numberToGerman(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const num = Math.floor(Math.abs(n));
  if (num === 0) return "null";

  const ones = ["", "eins", "zwei", "drei", "vier", "fuenf", "sechs", "sieben", "acht", "neun"];
  const teens = [
    "zehn",
    "elf",
    "zwoelf",
    "dreizehn",
    "vierzehn",
    "fuenfzehn",
    "sechzehn",
    "siebzehn",
    "achtzehn",
    "neunzehn",
  ];
  const tens = [
    "",
    "",
    "zwanzig",
    "dreissig",
    "vierzig",
    "fuenfzig",
    "sechzig",
    "siebzig",
    "achtzig",
    "neunzig",
  ];

  const belowHundred = (v: number): string => {
    if (v < 10) return ones[v] || "";
    if (v < 20) return teens[v - 10] || "";
    const t = Math.floor(v / 10);
    const o = v % 10;
    if (!o) return tens[t] || "";
    const oneWord = o === 1 ? "ein" : ones[o];
    return `${oneWord}und${tens[t]}`;
  };

  const belowThousand = (v: number): string => {
    if (v < 100) return belowHundred(v);
    const h = Math.floor(v / 100);
    const r = v % 100;
    const head = `${h === 1 ? "ein" : ones[h]}hundert`;
    return r ? `${head}${belowHundred(r)}` : head;
  };

  if (num < 1000) return belowThousand(num);
  if (num < 1_000_000) {
    const th = Math.floor(num / 1000);
    const r = num % 1000;
    const thWord = th === 1 ? "eintausend" : `${belowThousand(th)}tausend`;
    return r ? `${thWord}${belowThousand(r)}` : thWord;
  }

  return String(num);
}

function expandStatuteRefs(text: string): string {
  let next = text;

  next = next.replace(
    /Paragraphen\s+(\d+)\s+folgende\s+([A-Za-z][A-Za-z0-9]*)/g,
    (_m, pNum, law) => {
      const lawName = LAW_MAP[law] ?? law;
      return `Paragraphen ${numberToGerman(Number(pNum))} folgende der ${lawName}`;
    },
  );

  next = next.replace(/Paragraph\s+(\d+)\s+([A-Za-z][A-Za-z0-9]*)/g, (_m, pNum, law) => {
    const lawName = LAW_MAP[law] ?? law;
    return `Paragraph ${numberToGerman(Number(pNum))} der ${lawName}`;
  });

  return next;
}

function normalizeDateAndTime(text: string): string {
  let next = text;

  next = next.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g, (_m, d, m, y) => {
    const day = Number(d);
    const month = Number(m);
    const year = Number(y);
    const monthName = MONTHS_DE[month - 1] ?? `${month}`;
    return `${day}. ${monthName} ${year}`;
  });

  next = next.replace(/\b(\d{1,2}):(\d{2})\s*Uhr\b/gi, (_m, h, min) => {
    const hour = Number(h);
    if (hour === 24 && min === "00") {
      return "24 Uhr, also Mitternacht";
    }
    if (min === "00") {
      return `${hour} Uhr`;
    }
    return `${hour} Uhr ${min}`;
  });

  return next;
}

function normalizeMoneyAndPercent(text: string): string {
  let next = text;

  next = next.replace(/\b([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?)\s*€\b/g, (_m, amount) => {
    const numeric = amount.replace(/\./g, "").replace(/,/g, ".");
    return `${numeric} Euro`;
  });

  next = next.replace(/\b([0-9]+(?:,[0-9]+)?)\s*%\b/g, (_m, value) => {
    return `${value.replace(/,/g, ".")} Prozent`;
  });

  return next;
}

function stripUiArtifacts(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
    .replace(/[\u2600-\u27BF]/g, " ")
    .replace(/\b(?:oeffnen|schliessen|fortschritt|tag|tags)\b/gi, " ");
}

export function prepareTextForSpeech(input: string): string {
  let text = stripUiArtifacts(input);

  for (const [pattern, replacement] of SIMPLE_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/\bBGB\b/g, "Buergerliches Gesetzbuch");
  text = text.replace(/\bAO\b/g, "Abgabenordnung");
  text = text.replace(/\bEStG\b/g, "Einkommensteuergesetz");
  text = text.replace(/\bUStG\b/g, "Umsatzsteuergesetz");

  text = expandStatuteRefs(text);
  text = normalizeDateAndTime(text);
  text = normalizeMoneyAndPercent(text);

  return text
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildSpeechCacheSignature(opts: {
  text: string;
  voiceId: string;
  modelId: string;
  profileId: string;
}): string {
  const profile = getVoiceProfile(opts.profileId);
  const payload = [
    opts.text,
    opts.voiceId,
    opts.modelId,
    profile.id,
    profile.stability,
    profile.similarityBoost,
    profile.style,
    profile.useSpeakerBoost,
  ].join("|");

  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return `tts-${h.toString(16)}-${payload.length}`;
}
