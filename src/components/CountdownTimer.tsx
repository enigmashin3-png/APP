import React, { useEffect, useState } from "react";

type Props = {
  seconds: number;
  running: boolean;
  onComplete?: () => void;
};

export default function CountdownTimer({ seconds, running, onComplete }: Props) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    setTime(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      onComplete?.();
      return;
    }
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(id);
          onComplete?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, time, onComplete]);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return <span>{format(time)}</span>;
}
