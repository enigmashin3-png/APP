import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { WorkoutSet, Exercise } from "@shared/schema";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

const MOCK_USER_ID = "user-1";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
);

interface ChartDataPoint {
  date: string;
  weight: number;
}

export default function ProgressChart() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: exerciseSets } = useQuery<WorkoutSet[]>({
    queryKey: ["/api/workout-sets", { exerciseId: selectedExerciseId, userId: MOCK_USER_ID }],
    enabled: !!selectedExerciseId,
  });

  // Process data for chart
  const chartData: ChartDataPoint[] = exerciseSets
    ? exerciseSets
        .reduce((acc: ChartDataPoint[], set) => {
          const date = new Date(set.completedAt).toISOString().split("T")[0];
          const existingPoint = acc.find((point) => point.date === date);

          if (existingPoint) {
            if ((set.weight || 0) > existingPoint.weight) {
              existingPoint.weight = set.weight || 0;
            }
          } else {
            acc.push({
              date,
              weight: set.weight || 0,
            });
          }

          return acc;
        }, [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-12)
    : [];

  const selectedExercise = exercises?.find((ex) => ex.id === selectedExerciseId);
  const currentMax = chartData.length > 0 ? Math.max(...chartData.map((d) => d.weight)) : 0;
  const previousMax = chartData.length > 1 ? chartData[chartData.length - 2].weight : 0;
  const progressPercentage =
    previousMax > 0 ? Math.round(((currentMax - previousMax) / previousMax) * 100) : 0;

  const chartJsData = {
    labels: chartData.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    datasets: [
      {
        label: selectedExercise?.name ?? "Weight",
        data: chartData.map((d) => d.weight),
        borderColor: "hsl(var(--primary-600))",
        backgroundColor: "hsl(var(--primary-600))",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${Math.round(context.parsed.y)} lbs`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#e5e7eb" },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
    },
  } as const;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strength Progress</h3>
          <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CardContent className="p-6">
        {chartData.length > 0 ? (
          <>
            <div className="h-48 mb-4">
              <Line data={chartJsData} options={chartOptions} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Max Weight</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentMax} lbs</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                <p
                  className={`text-xl font-bold ${
                    progressPercentage > 0
                      ? "text-success-600"
                      : progressPercentage < 0
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {progressPercentage > 0 ? "+" : ""}
                  {progressPercentage}%
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">No data available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {selectedExerciseId
                  ? "Complete some workouts to see your progress"
                  : "Select an exercise to view progress"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
