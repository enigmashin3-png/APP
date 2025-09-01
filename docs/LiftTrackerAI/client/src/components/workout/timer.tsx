import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatDuration } from "@/lib/workout-utils";

interface TimerProps {
  initialTime?: number;
  isRestTimer?: boolean;
  onComplete?: () => void;
  previousSet?: { weight?: number | null; reps?: number | null } | null;
}

export default function Timer({
  initialTime = 0,
  isRestTimer = false,
  onComplete,
  previousSet,
}: TimerProps) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(isRestTimer);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTime(initialTime);
    setIsRunning(isRestTimer);
  }, [initialTime, isRestTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          const next = isRestTimer ? prev - 1 : prev + 1;
          if (isRestTimer && next <= 0) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isRestTimer, onComplete]);

  const adjustTime = (delta: number) => {
    setTime((prev) => Math.max(0, prev + delta));
  };

  const resetTime = () => {
    setTime(initialTime);
    setIsRunning(isRestTimer);
  };

  return (
    <>
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {previousSet && (
              <span className="text-sm text-gray-600">
                Last: {previousSet.weight ?? "-"}
                {previousSet.weight ? " lbs" : ""} × {previousSet.reps ?? "-"}
              </span>
            )}
            <button onClick={() => setOpen(true)} className="text-xl font-bold font-mono">
              {formatDuration(Math.abs(time))}
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col items-center space-y-4">
          <div className="text-6xl font-bold font-mono">{formatDuration(Math.abs(time))}</div>
          <div className="flex space-x-4">
            <Button onClick={() => adjustTime(-30)} variant="outline">
              -30s
            </Button>
            <Button onClick={() => adjustTime(30)} variant="outline">
              +30s
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsRunning((r) => !r)}>
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetTime} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
