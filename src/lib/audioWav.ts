/**
 * audioWav.ts
 *
 * Hilfsfunktionen zum Erzeugen eines gültigen RIFF/WAVE-Streams aus
 * rohen PCM16-Bytes. OpenAI liefert bei response_format="pcm" mono,
 * 24000 Hz, 16 bit little-endian – dieses Modul kapselt genau diesen
 * Fall, damit Safari/iOS die Dauer korrekt bestimmen kann.
 */

export const PCM_SAMPLE_RATE = 24000;
export const PCM_CHANNELS = 1;
export const PCM_BITS_PER_SAMPLE = 16;

/** Baut einen 44-Byte RIFF/WAVE-Header für PCM16-Daten. */
export function buildWavHeader(pcmByteLength: number): Uint8Array {
  const byteRate = (PCM_SAMPLE_RATE * PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const blockAlign = (PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // "RIFF"
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46);
  view.setUint32(4, 36 + pcmByteLength, true);
  // "WAVE"
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45);
  // "fmt "
  view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20);
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, PCM_CHANNELS, true);
  view.setUint32(24, PCM_SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, PCM_BITS_PER_SAMPLE, true);
  // "data"
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61);
  view.setUint32(40, pcmByteLength, true);

  return new Uint8Array(header);
}

/** Fügt PCM16-Chunks zu einem einzelnen WAV-Puffer zusammen. */
export function pcmChunksToWav(pcmChunks: Uint8Array[]): Uint8Array {
  const total = pcmChunks.reduce((n, p) => n + p.byteLength, 0);
  const header = buildWavHeader(total);
  const out = new Uint8Array(header.byteLength + total);
  out.set(header, 0);
  let offset = header.byteLength;
  for (const p of pcmChunks) {
    out.set(p, offset);
    offset += p.byteLength;
  }
  return out;
}

/**
 * Führt asynchrone Tasks mit begrenzter Parallelität aus und behält die
 * Reihenfolge der Ergebnisse bei.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}
