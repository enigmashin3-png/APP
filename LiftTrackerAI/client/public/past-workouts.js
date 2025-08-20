document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.getElementById('history-list');
  const storedHistory = localStorage.getItem('workoutHistory');

  if (!storedHistory) {
    historyList.innerHTML = '<li>No past workouts found.</li>';
    return;
  }

  try {
    const workouts = JSON.parse(storedHistory);
    if (workouts.length === 0) {
      historyList.innerHTML = '<li>No past workouts found.</li>';
      return;
    }

    workouts.forEach(workout => {
      const workoutItem = document.createElement('li');
      workoutItem.innerHTML = `<strong>${workout.date}</strong>`;
      const exerciseList = document.createElement('ul');

      workout.exercises.forEach(ex => {
        const exerciseItem = document.createElement('li');
        const weightText = ex.weight > 0 ? ` with ${ex.weight} lbs` : '';
        exerciseItem.textContent = `${ex.name} - ${ex.sets}x${ex.reps}${weightText}`;
        exerciseList.appendChild(exerciseItem);
      });

      workoutItem.appendChild(exerciseList);
      historyList.appendChild(workoutItem);
    });
  } catch (error) {
    console.error('Error loading workout history:', error);
    historyList.innerHTML = '<li>Error loading workout history.</li>';
  }
});
