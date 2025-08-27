import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface WorkoutTimerProps {
  startTime: Date;
}

export default function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const elapsed = now.getTime() - startTime.getTime();
      
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

      if (hours > 0) {
        setDuration(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
      <Clock className="w-4 h-4 text-gray-600" />
      <span className="font-mono font-medium text-gray-900">{duration}</span>
    </div>
  );
}
