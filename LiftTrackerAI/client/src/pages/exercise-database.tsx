import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Dumbbell, Users, BookOpen, Zap } from "lucide-react";
import { getMuscleGroupColor } from "@/lib/workout-utils";
import type { Exercise } from "@shared/schema";

export default function ExerciseDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Filter exercises based on search and category
  const filteredExercises = exercises?.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(muscle => muscle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = exercises ? Array.from(new Set(exercises.map(ex => ex.category))) : [];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      chest: Dumbbell,
      back: Dumbbell,
      legs: Dumbbell,
      shoulders: Dumbbell,
      arms: Dumbbell,
      core: Dumbbell,
      cardio: Zap,
    };
    
    const IconComponent = icons[category] || Dumbbell;
    return <IconComponent className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      chest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      back: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      legs: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      shoulders: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      arms: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      core: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      cardio: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Database</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive library of exercises with form guides
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {exercises?.length || 0} exercises
          </Badge>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search exercises, muscle groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="capitalize">{category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((category) => {
            const categoryExercises = exercises?.filter(ex => ex.category === category) || [];
            return (
              <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white capitalize text-sm">
                    {category}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {categoryExercises.length} exercises
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Exercise Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <Dialog key={exercise.id}>
                <DialogTrigger asChild>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {exercise.name}
                        </h3>
                        <Badge className={getCategoryColor(exercise.category)}>
                          {exercise.category}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Muscle Groups</p>
                          <div className="flex flex-wrap gap-1">
                            {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                              <Badge key={muscle} variant="outline" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                            {exercise.muscleGroups.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{exercise.muscleGroups.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {exercise.equipment && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Dumbbell className="h-4 w-4" />
                            <span>{exercise.equipment}</span>
                          </div>
                        )}

                        <Button variant="outline" size="sm" className="w-full mt-4">
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <span>{exercise.name}</span>
                      <Badge className={getCategoryColor(exercise.category)}>
                        {exercise.category}
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Muscle Groups</h4>
                      <div className="flex flex-wrap gap-2">
                        {exercise.muscleGroups.map((muscle) => (
                          <Badge key={muscle} className={getMuscleGroupColor(muscle)}>
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {exercise.equipment && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Equipment</h4>
                        <div className="flex items-center space-x-2">
                          <Dumbbell className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{exercise.equipment}</span>
                        </div>
                      </div>
                    )}

                    {exercise.instructions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {exercise.instructions}
                        </p>
                      </div>
                    )}

                    {exercise.tips && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips</h4>
                        <div className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                          <p className="text-primary-800 dark:text-primary-200">
                            {exercise.tips}
                          </p>
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
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No exercises found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search terms or category filter
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
