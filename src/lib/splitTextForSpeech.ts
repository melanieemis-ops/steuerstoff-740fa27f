export function splitTextForSpeech(text: string, maximumLength: number): string[] {
  const normalized = text.trim();
  if (!normalized) return [];
  if (normalized.length <= maximumLength) return [normalized];

  const sections = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const section of sections) {
    if (section.length <= maximumLength) {
      chunks.push(section);
      continue;
    }

    const sentences = section.split(/(?<=[.!?])\s+/);
    let current = "";

    for (const sentence of sentences) {
      const candidate = current ? `${current} ${sentence}` : sentence;
      if (candidate.length <= maximumLength) {
        current = candidate;
        continue;
      }

      if (current) {
        chunks.push(current.trim());
        current = "";
      }

      if (sentence.length <= maximumLength) {
        current = sentence;
        continue;
      }

      const words = sentence.split(/\s+/);
      let wordChunk = "";

      for (const word of words) {
        const nextWordChunk = wordChunk ? `${wordChunk} ${word}` : word;
        if (nextWordChunk.length <= maximumLength) {
          wordChunk = nextWordChunk;
          continue;
        }

        if (wordChunk) {
          chunks.push(wordChunk.trim());
          wordChunk = word;
          continue;
        }

        let rest = word;
        while (rest.length > maximumLength) {
          chunks.push(rest.slice(0, maximumLength));
          rest = rest.slice(maximumLength);
        }
        wordChunk = rest;
      }

      if (wordChunk.trim()) {
        current = wordChunk.trim();
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }
  }

  return chunks.filter(Boolean);
}
