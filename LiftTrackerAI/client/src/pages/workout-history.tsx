import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Weight, TrendingUp, Star, Eye, Filter, BarChart3 } from "lucide-react";
import { formatDuration, formatTimeAgo } from "@/lib/workout-utils";
import { calculateVolume } from "@/lib/progressive-overload";
import type { WorkoutSession, WorkoutSet, Exercise } from "@shared/schema";

const MOCK_USER_ID = "user-1";

export default function WorkoutHistory() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  const { data: sessions, isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ["/api/workout-sessions?userId=" + MOCK_USER_ID],
  });

  const { data: sessionSets } = useQuery<WorkoutSet[]>({
    queryKey: ["/api/workout-sets", { sessionId: selectedSession?.id }],
    enabled: !!selectedSession?.id,
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Filter sessions by time period
  const filteredSessions = sessions?.filter(session => {
    if (timeFilter === "all") return true;
    
    const sessionDate = new Date(session.startedAt);
    const now = new Date();
    
    switch (timeFilter) {
      case "week":
        return (now.getTime() - sessionDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
      case "month":
        return (now.getTime() - sessionDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
      case "3months":
        return (now.getTime() - sessionDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  }) || [];

  // Calculate statistics
  const completedSessions = filteredSessions.filter(s => s.completedAt);
  const totalWorkouts = completedSessions.length;
  const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalVolume = completedSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
  const avgRating = completedSessions.length > 0 
    ? completedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / completedSessions.length
    : 0;

  // Group sets by exercise for selected session
  const exerciseGroups = sessionSets?.reduce((groups: Record<string, WorkoutSet[]>, set) => {
    if (!groups[set.exerciseId]) {
      groups[set.exerciseId] = [];
    }
    groups[set.exerciseId].push(set);
    return groups;
  }, {}) || {};

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your progress and review past sessions
            </p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="3months">Past 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalWorkouts}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalDuration > 0 ? `${Math.round(totalDuration / 3600)}h` : "0h"}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Weight className="h-6 w-6 text-success-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : "0"}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Workout Sessions List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Dialog key={session.id}>
                <DialogTrigger asChild>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            session.completedAt 
                              ? "bg-success-50 dark:bg-success-900" 
                              : "bg-orange-50 dark:bg-orange-900"
                          }`}>
                            {session.completedAt ? (
                              <div className="w-3 h-3 bg-success-600 rounded-full"></div>
                            ) : (
                              <Clock className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                              {session.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(session.startedAt)}
                              {session.duration && ` • ${formatDuration(session.duration)}`}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              {session.totalVolume && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {Math.round(session.totalVolume)} lbs total
                                </span>
                              )}
                              {session.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {session.rating}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={session.completedAt ? "default" : "secondary"}>
                            {session.completedAt ? "Completed" : "In Progress"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <span>{session.name}</span>
                      <Badge variant={session.completedAt ? "default" : "secondary"}>
                        {session.completedAt ? "Completed" : "In Progress"}
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Session Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Calendar className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(session.startedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                      </div>
                      <div className="text-center">
                        <Clock className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.duration ? formatDuration(session.duration) : "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      </div>
                      <div className="text-center">
                        <Weight className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.totalVolume ? `${Math.round(session.totalVolume)} lbs` : "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                      </div>
                      <div className="text-center">
                        <Star className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.rating || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    {Object.keys(exerciseGroups).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Exercises</h4>
                        <div className="space-y-4">
                          {Object.entries(exerciseGroups).map(([exerciseId, sets]) => {
                            const exercise = exercises?.find(ex => ex.id === exerciseId);
                            const exerciseVolume = calculateVolume(sets);
                            const maxWeight = Math.max(...sets.map(s => s.weight || 0));
                            
                            return (
                              <Card key={exerciseId}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                      {exercise?.name || "Unknown Exercise"}
                                    </h5>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                      <span>{sets.length} sets</span>
                                      <span>{Math.round(exerciseVolume)} lbs</span>
                                      <span>Max: {maxWeight} lbs</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {sets.map((set, index) => (
                                      <div key={set.id} className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Set {index + 1}</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {set.weight} × {set.reps}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {session.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300">{session.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No workout history found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {timeFilter === "all" 
                  ? "Start your first workout to begin tracking your progress"
                  : "No workouts found for the selected time period"
                }
              </p>
              {timeFilter !== "all" && (
                <Button 
                  onClick={() => setTimeFilter("all")}
                  variant="outline"
                >
                  View All History
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
