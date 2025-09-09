let currentWorkout = [];
const workoutList = document.getElementById('workout-list');
const exerciseForm = document.getElementById('exercise-form');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  console.log('Workout Tracker initialized');
  if (exerciseForm) exerciseForm.style.display = 'none';
  loadWorkout(); // Load saved workout on startup
});

function toggleExerciseForm() {
  if (!exerciseForm) return;
  if (exerciseForm.style.display === 'none') {
    exerciseForm.style.display = 'block';
    const nameEl = document.getElementById('exercise-name');
    if (nameEl) nameEl.focus();
  } else {
    exerciseForm.style.display = 'none';
  }
}

function addExercise() {
  const nameEl = document.getElementById('exercise-name');
  const setsEl = document.getElementById('sets');
  const repsEl = document.getElementById('reps');
  const weightEl = document.getElementById('weight');
  if (!nameEl || !setsEl || !repsEl || !weightEl) return;

  const exerciseName = String(nameEl.value || '').trim();
  const sets = setsEl.value;
  const reps = repsEl.value;
  const weight = weightEl.value || '0';

  // Validation
  if (!exerciseName || !sets || !reps) {
    alert('Please fill in Exercise Name, Sets, and Reps!');
    return;
  }

  if (isNaN(sets) || isNaN(reps) || isNaN(weight)) {
    alert('Please enter valid numbers for Sets, Reps, and Weight!');
    return;
  }

  // Create exercise object
  const exercise = {
    name: exerciseName,
    sets: parseInt(sets, 10),
    reps: parseInt(reps, 10),
    weight: parseInt(weight, 10) || 0,
    id: Date.now(),
  };

  // Add to current workout
  currentWorkout = [...currentWorkout, exercise];

  // Update display
  renderWorkoutList();

  // Reset and hide form
  const formEl = document.getElementById('exercise-form');
  if (formEl) formEl.reset();
  toggleExerciseForm();
}

// Render workout list to screen
function renderWorkoutList() {
  if (!workoutList) return;
  workoutList.innerHTML = '';

  if (currentWorkout.length === 0) {
    workoutList.innerHTML =
      '<li style="text-align: center; color: #666; padding: 20px;">No exercises yet. Add your first exercise!</li>';
    return;
  }

  currentWorkout.forEach((exercise, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'exercise-item';
    listItem.innerHTML = `
      <div class="exercise-content">
        <strong>${exercise.name}</strong>
        <div class="exercise-details">
          ${exercise.sets} sets · ${exercise.reps} reps
          ${exercise.weight > 0 ? `· ${exercise.weight} lbs` : ''}
        </div>
      </div>
      <button class="delete-btn" onclick="removeExercise(${index})">×</button>
    `;
    workoutList.appendChild(listItem);
  });
}

// Remove individual exercise
function removeExercise(index) {
  if (confirm('Remove this exercise from your workout?')) {
    currentWorkout = currentWorkout.filter((_, i) => i !== index);
    renderWorkoutList();
    saveWorkout();
  }
}

// Save workout to localStorage
function saveWorkout() {
  if (currentWorkout.length === 0) {
    alert('No exercises to save! Add some exercises first.');
    return;
  }

  try {
    localStorage.setItem('savedWorkout', JSON.stringify(currentWorkout));
    alert('Workout saved successfully!');
  } catch (_error) {
    alert('Error saving workout.');
  }
}

// Load workout from localStorage
function loadWorkout() {
  try {
    const savedData = localStorage.getItem('savedWorkout');
    if (savedData) {
      currentWorkout = JSON.parse(savedData);
      renderWorkoutList();
    }
  } catch (_error) {
    alert('Error loading saved workout.');
  }
}

// Clear entire workout
function clearWorkout() {
  if (confirm('Are you sure you want to clear your entire workout?')) {
    currentWorkout = [];
    localStorage.removeItem('savedWorkout');
    renderWorkoutList();
    alert('Workout cleared!');
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && exerciseForm && exerciseForm.style.display === 'block') {
    toggleExerciseForm();
  }
});

// Expose functions to window so inline HTML handlers can use them
window.addExercise = addExercise;
window.removeExercise = removeExercise;
window.toggleExerciseForm = toggleExerciseForm;
window.clearWorkout = clearWorkout;
window.saveWorkout = saveWorkout;
window.loadWorkout = loadWorkout;

