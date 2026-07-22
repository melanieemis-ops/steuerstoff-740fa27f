export type TtsVoiceProfile = {
  id: string;
  label: string;
  description: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
};

export const DEFAULT_TTS_MODEL_ID = "eleven_multilingual_v2";

export const TTS_VOICE_PROFILES: TtsVoiceProfile[] = [
  {
    id: "steuerstoff-ki-stimme",
    label: "steuerstoff KI-Stimme",
    description: "Ruhig, professionell und gut geeignet fuer laengere Fachtexte.",
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0.1,
    useSpeakerBoost: true,
  },
];

export function getVoiceProfile(profileId?: string): TtsVoiceProfile {
  if (profileId) {
    const found = TTS_VOICE_PROFILES.find((profile) => profile.id === profileId);
    if (found) return found;
  }
  return TTS_VOICE_PROFILES[0];
}
