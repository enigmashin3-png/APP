import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/settings-context";
import ProgressChart from "@/components/workout/progress-chart";
import { useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Weight, 
  Flame, 
  Trophy, 
  Play, 
  Dumbbell, 
  Zap, 
  ChevronRight,
  Star,
  Timer
} from "lucide-react";
import type { WorkoutStats, WorkoutPlan, WorkoutSession } from "@shared/schema";

// Mock user ID - in real app this would come from auth context
const MOCK_USER_ID = "user-1";

export default function Dashboard() {
  const { formatWeight, convertWeight } = useSettings();
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = useQuery<WorkoutStats>({
    queryKey: ["/api/users", MOCK_USER_ID, "stats"],
  });

  const { data: templatePlans } = useQuery<WorkoutPlan[]>({
    queryKey: ["/api/workout-plans?templates=true"],
  });

  const { data: recentSessions } = useQuery<WorkoutSession[]>({
    queryKey: ["/api/workout-sessions?userId=" + MOCK_USER_ID],
  });

  const { data: activeSession } = useQuery<WorkoutSession | null>({
    queryKey: ["/api/workout-sessions/active", MOCK_USER_ID],
  });

  const handleStartWorkout = () => {
    setLocation("/workout");
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your fitness journey</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="lg:hidden p-2 text-gray-500 hover:text-primary-600">
              <Timer className="h-5 w-5" />
            </button>
            <Button onClick={handleStartWorkout} className="bg-primary-600 hover:bg-primary-700">
              <Play className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Start Workout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "..." : stats?.weeklyWorkouts || 0}
                  </p>
                  <p className="text-xs text-success-600">+2 from last week</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "..." : `${(stats?.totalVolume || 0) / 1000}k`}
                  </p>
                  <p className="text-xs text-success-600">+8% this month</p>
                </div>
                <div className="w-12 h-12 bg-success-50 dark:bg-success-50 rounded-lg flex items-center justify-center">
                  <Weight className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "..." : stats?.currentStreak || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">days</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-50 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PR This Month</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? "..." : stats?.personalRecords || 0}
                  </p>
                  <p className="text-xs text-success-600">new records</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Workout Card */}
        {activeSession && (
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{activeSession.name}</h3>
                  <p className="text-primary-100">
                    Started {formatTimeAgo(activeSession.startedAt.toString())}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {activeSession.duration ? formatDuration(activeSession.duration) : "0:00"}
                  </div>
                  <p className="text-sm text-primary-100">Duration</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-primary-100">Exercise</p>
                    <p className="font-medium">Bench Press</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-100">Set</p>
                    <p className="font-medium">3 of 4</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-100">Weight</p>
                    <p className="font-medium">{formatWeight(185)}</p>
                  </div>
                </div>
                <Button variant="secondary" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0">
                  Continue
                </Button>
              </div>
              
              <div className="w-full bg-primary-800 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <p className="text-sm text-primary-100 mt-2">3 of 4 exercises completed</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workout Plans */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Workout Plans</h3>
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                  View All
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {templatePlans?.slice(0, 3).map((plan) => (
                <div key={plan.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        plan.level === "beginner" ? "bg-blue-100 dark:bg-blue-900" :
                        plan.level === "intermediate" ? "bg-primary-100 dark:bg-primary-900" :
                        "bg-red-100 dark:bg-red-900"
                      }`}>
                        {plan.level === "beginner" ? (
                          <Dumbbell className="h-5 w-5 text-blue-600" />
                        ) : plan.level === "intermediate" ? (
                          <Dumbbell className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Zap className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{plan.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        plan.level === "beginner" ? "secondary" :
                        plan.level === "intermediate" ? "default" :
                        "destructive"
                      } className="capitalize">
                        {plan.level}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress Chart */}
          <ProgressChart />
        </div>

        {/* Recent Workouts */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Workouts</h3>
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                View History
              </Button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentSessions?.slice(0, 3).map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-success-50 dark:bg-success-900 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{session.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(session.startedAt.toString())} • {session.duration ? formatDuration(session.duration) : "N/A"}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">6 exercises</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {session.totalVolume ? `${formatWeight(Math.round(session.totalVolume))} total` : "No volume"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.rating || "4.5"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{session.notes || "Great workout!"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
