import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Award, Target, Calendar, Dumbbell, Zap } from "lucide-react";
import { formatTimeAgo } from "@/lib/workout-utils";
import type { WorkoutSession, WorkoutSet, Exercise } from "@shared/schema";

const MOCK_USER_ID = "user-1";

export default function Progress() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("3months");
  const [selectedExercise, setSelectedExercise] = useState("all");

  const { data: sessions } = useQuery<WorkoutSession[]>({
    queryKey: ["/api/workout-sessions?userId=" + MOCK_USER_ID],
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: allSets } = useQuery<WorkoutSet[]>({
    queryKey: ["/api/workout-sets"],
  });

  // Filter data by timeframe
  const filteredSessions =
    sessions?.filter((session) => {
      if (selectedTimeframe === "all") return true;

      const sessionDate = new Date(session.startedAt);
      const now = new Date();

      switch (selectedTimeframe) {
        case "week":
          return now.getTime() - sessionDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return now.getTime() - sessionDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        case "3months":
          return now.getTime() - sessionDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
        case "year":
          return now.getTime() - sessionDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    }) || [];

  // Calculate progress statistics
  const completedSessions = filteredSessions.filter((s) => s.completedAt);
  const totalWorkouts = completedSessions.length;
  const totalVolume = completedSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  const avgDuration =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;

  // Prepare chart data for workout frequency
  const workoutFrequencyData = completedSessions
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .reduce((acc: any[], session) => {
      const date = new Date(session.startedAt).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.workouts += 1;
        existing.volume += session.totalVolume || 0;
      } else {
        acc.push({
          date,
          workouts: 1,
          volume: session.totalVolume || 0,
        });
      }
      return acc;
    }, [])
    .slice(-30); // Last 30 data points

  // Prepare strength progression data
  const strengthData =
    allSets
      ?.filter((set) => selectedExercise === "all" || set.exerciseId === selectedExercise)
      ?.sort(
        (a, b) => new Date(a.completedAt || "").getTime() - new Date(b.completedAt || "").getTime(),
      )
      ?.map((set, index) => ({
        session: index + 1,
        weight: set.weight || 0,
        reps: set.reps || 0,
        oneRepMax: Math.round((set.weight || 0) * (1 + (set.reps || 0) / 30)), // Epley formula
        date: new Date(set.completedAt || "").toLocaleDateString(),
      }))
      ?.slice(-20) || []; // Last 20 sets

  // Find personal records
  const personalRecords =
    exercises
      ?.map((exercise) => {
        const exerciseSets = allSets?.filter((set) => set.exerciseId === exercise.id) || [];
        const maxWeight = Math.max(...exerciseSets.map((s) => s.weight || 0), 0);
        const maxVolume = Math.max(...exerciseSets.map((s) => (s.weight || 0) * (s.reps || 0)), 0);
        const bestSet = exerciseSets.find((s) => s.weight === maxWeight);

        return {
          exercise: exercise.name,
          maxWeight,
          maxVolume,
          date: bestSet?.completedAt ? formatTimeAgo(bestSet.completedAt) : "Never",
        };
      })
      .filter((pr) => pr.maxWeight > 0)
      .slice(0, 5) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor your fitness journey and achievements
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalWorkouts}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Dumbbell className="h-6 w-6 text-success-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(totalVolume / 1000)}k
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(avgDuration / 60)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Duration (min)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {personalRecords.length}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personal Records</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workout Frequency Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Workout Frequency</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="workouts" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strength Progression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Strength Progression</span>
                </div>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exercises</SelectItem>
                    {exercises?.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={strengthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Weight (lbs)"
                  />
                  <Line
                    type="monotone"
                    dataKey="oneRepMax"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Estimated 1RM"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Personal Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Personal Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {personalRecords.length > 0 ? (
              <div className="space-y-4">
                {personalRecords.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {record.exercise}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{record.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {record.maxWeight} lbs
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {record.maxVolume} volume
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No personal records yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start logging workouts to track your personal bests!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume Progression */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <span>Volume Progression</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workoutFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Volume (lbs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
