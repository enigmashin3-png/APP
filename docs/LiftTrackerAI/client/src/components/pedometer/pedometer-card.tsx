import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Footprints } from "lucide-react";
import {
  calculateCalories,
  fetchAppleHealthSteps,
  fetchGoogleFitSteps,
  fetchSamsungHealthSteps,
} from "@/lib/fitness";

interface PedometerCardProps {
  weightKg: number;
  met?: number;
  googleToken?: string;
  samsungToken?: string;
  appleToken?: string;
}

export default function PedometerCard({
  weightKg,
  met = 3.5,
  googleToken,
  samsungToken,
  appleToken,
}: PedometerCardProps) {
  const [steps, setSteps] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    async function loadExternalSteps() {
      let total = 0;
      if (googleToken) total += await fetchGoogleFitSteps(googleToken);
      if (samsungToken) total += await fetchSamsungHealthSteps(samsungToken);
      if (appleToken) total += await fetchAppleHealthSteps(appleToken);
      setSteps(total);
    }
    loadExternalSteps().catch(() => {
      /* ignore network errors */
    });
  }, [googleToken, samsungToken, appleToken]);

  useEffect(() => {
    let lastStep = 0;
    function onMotion(e: DeviceMotionEvent) {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt(
        (acc.x || 0) * (acc.x || 0) + (acc.y || 0) * (acc.y || 0) + (acc.z || 0) * (acc.z || 0),
      );
      const now = Date.now();
      if (magnitude > 12 && now - lastStep > 300) {
        if (!startTime) setStartTime(now);
        setSteps((s) => s + 1);
        lastStep = now;
      }
    }
    if (typeof window !== "undefined" && "ondevicemotion" in window) {
      window.addEventListener("devicemotion", onMotion);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("devicemotion", onMotion);
      }
    };
  }, [startTime]);

  const durationMinutes = startTime ? (Date.now() - startTime) / 60000 : 0;
  const calories = calculateCalories(met, weightKg, durationMinutes);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Steps</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{steps}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{calories.toFixed(1)} kcal</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-50 rounded-lg flex items-center justify-center">
            <Footprints className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
