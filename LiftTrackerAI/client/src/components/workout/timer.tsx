import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatDuration } from "@/lib/workout-utils";

interface TimerProps {
  initialTime?: number;
  isRestTimer?: boolean;
  onComplete?: () => void;
}

export default function Timer({ initialTime = 0, isRestTimer = false, onComplete }: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(isRestTimer ? 120 : 0); // 2 minutes default rest

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = isRestTimer ? prevTime - 1 : prevTime + 1;
          
          // Rest timer completed
          if (isRestTimer && newTime <= 0) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isRestTimer, onComplete]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(isRestTimer ? targetTime : 0);
  };

  const handleRestTimeSet = (seconds: number) => {
    setTargetTime(seconds);
    setTime(seconds);
    setIsRunning(false);
  };

  const progressPercentage = isRestTimer && targetTime > 0 
    ? ((targetTime - time) / targetTime) * 100 
    : 0;

  return (
    <Card className={`w-full max-w-sm mx-auto ${
      isRestTimer ? 'bg-orange-50 border-orange-200 dark:bg-orange-900 dark:border-orange-800' : ''
    }`}>
      <CardContent className="p-6 text-center">
        <div className={`text-4xl font-bold mb-4 ${
          isRestTimer ? 'text-orange-800 dark:text-orange-200' : 'text-gray-900 dark:text-white'
        }`}>
          {formatDuration(Math.abs(time))}
        </div>

        {isRestTimer && (
          <div className="mb-4">
            <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2 mb-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Rest Time</p>
          </div>
        )}

        <div className="flex space-x-2 mb-4">
          <Button
            onClick={handleStartPause}
            className={`flex-1 ${
              isRestTimer 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          
          <Button onClick={handleReset} variant="outline" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {isRestTimer && (
          <div className="flex space-x-1">
            {[60, 90, 120, 180, 300].map((seconds) => (
              <Button
                key={seconds}
                onClick={() => handleRestTimeSet(seconds)}
                variant="outline"
                size="sm"
                className={`text-xs ${
                  targetTime === seconds ? 'bg-orange-100 border-orange-300 dark:bg-orange-800' : ''
                }`}
              >
                {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
