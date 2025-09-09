type SpeechResultEvent = { results?: Array<Array<{ transcript?: string }>> };
type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: SpeechResultEvent) => void;
  onend: () => void;
  start: () => void;
};

export function isVoiceSupported() {
  return (
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  );
}

export function startDictation(onText: (text: string) => void, onEnd?: () => void) {
  const ctor = (window as unknown as Record<string, unknown>).SpeechRecognition as
    | SpeechRecognitionCtor
    | undefined;
  const webkitCtor = (window as unknown as Record<string, unknown>).webkitSpeechRecognition as
    | SpeechRecognitionCtor
    | undefined;
  const SR = ctor || webkitCtor;
  if (!SR) return false;
  const rec = new SR();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e: SpeechResultEvent) => {
    const text = e.results?.[0]?.[0]?.transcript ?? "";
    onText(text);
  };
  rec.onend = () => onEnd?.();
  rec.start();
  return true;
}

/** Extract two numbers from a phrase like "eighty by eight" or "80 x 8" */
export function parseWeightReps(text: string): { weight?: number; reps?: number } {
  const cleaned = text.toLowerCase().replace(/by|x|times/g, " ");
  const nums = cleaned.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  return { weight: nums[0], reps: nums[1] };
}
