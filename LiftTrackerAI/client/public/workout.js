let currentWorkout = [];
let workoutHistory = [];
let workoutList;

// Load workout on page load
// Initialize workoutList and load saved workout data
// We delay DOM access until content is loaded to ensure elements exist
// This prevents null references if the script is loaded in the head.
document.addEventListener('DOMContentLoaded', () => {
    workoutList = document.getElementById('workout-list');
    loadWorkout();
});

// Function to add exercise
function addExercise() {
    const exerciseName = document.getElementById('exercise-name').value;
    const sets = parseInt(document.getElementById('sets').value, 10);
    const reps = parseInt(document.getElementById('reps').value, 10);
    const weightInput = document.getElementById('weight').value;
    const weight = parseInt(weightInput, 10);

    const validSets = !isNaN(sets) && sets > 0;
    const validReps = !isNaN(reps) && reps > 0;

    if (exerciseName && validSets && validReps) {
        // Create exercise object
        const exercise = {
            name: exerciseName,
            sets: sets,
            reps: reps,
            weight: !isNaN(weight) ? weight : 0 // Default to 0 if empty or invalid
        };

        // Add to current workout array WITHOUT push
        currentWorkout = [...currentWorkout, exercise];

        // Update the display
        renderWorkoutList();

        // Reset form and hide it
        const exerciseForm = document.getElementById('exercise-form');
        if (exerciseForm) {
            exerciseForm.reset();
            hideExerciseForm();
        }
    } else {
        alert('Please enter valid numbers greater than 0 for sets and reps');
    }
}

// Render workout list from data
function renderWorkoutList() {
    if (!workoutList) return;
    workoutList.innerHTML = ''; // Clear the list first
    
    currentWorkout.forEach((exercise, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'exercise-item';
        const weightText = exercise.weight > 0 ? ` with ${exercise.weight} lbs` : '';
        listItem.textContent = `${exercise.name} - ${exercise.sets}x${exercise.reps}${weightText} `;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => removeExercise(index));

        listItem.appendChild(deleteBtn);
        workoutList.appendChild(listItem);
    });
}

// Remove exercise
function removeExercise(index) {
    currentWorkout = currentWorkout.filter((_, i) => i !== index);
    renderWorkoutList();
}

// Save workout
function saveWorkout() {
    if (currentWorkout.length === 0) {
        alert('No exercises to save!');
        return;
    }

    const workout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        exercises: currentWorkout,
    };

    workoutHistory = [...workoutHistory, workout];
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    alert('Workout saved successfully!');
}

// Load workout
function loadWorkout() {
    const storedHistory = localStorage.getItem('workoutHistory');

    if (storedHistory) {
        try {
            workoutHistory = JSON.parse(storedHistory);
            if (workoutHistory.length > 0) {
                currentWorkout = workoutHistory[workoutHistory.length - 1].exercises;
                renderWorkoutList();
                alert('Last workout loaded successfully!');
            } else {
                alert('No saved workouts found.');
            }
        } catch (error) {
            console.error('Error loading workout history:', error);
            alert('Error loading workout history. Data might be corrupted.');
        }
    } else {
        alert('No saved workouts found.');
    }
}

// Clear workout
function clearWorkout() {
    if (confirm('Are you sure you want to clear the current workout?')) {
        currentWorkout = [];
        if (workoutList) {
            workoutList.innerHTML = '';
        }
    }
}

// Toggle exercise form visibility
function toggleExerciseForm() {
    const form = document.getElementById('exercise-form');
    if (form) {
        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
        } else {
            form.classList.add('hidden');
        }
    }
}

// Hide the exercise form by adding the "hidden" class
function hideExerciseForm() {
    const form = document.getElementById('exercise-form');
    if (form) {
        form.classList.add('hidden');
    }
}

// Show the exercise form by removing the "hidden" class
function showExerciseForm() {
    const form = document.getElementById('exercise-form');
    if (form) {
        form.classList.remove('hidden');
    }
}

