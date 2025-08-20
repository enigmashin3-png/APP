let currentWorkout = [];
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
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value;

    if (exerciseName && sets && reps) {
        // Create exercise object
        const exercise = {
            name: exerciseName,
            sets: sets,
            reps: reps,
            weight: weight || '0' // Default to 0 if empty
        };

        // Add to current workout array WITHOUT push
        currentWorkout = [...currentWorkout, exercise];
        
        // Update the display
        renderWorkoutList();
        
        // Reset form
        document.getElementById('exercise-form').reset();
        toggleExerciseForm();
    } else {
        alert('Please fill in all required fields (name, sets, reps)');
    }
}

// Render workout list from data
function renderWorkoutList() {
    if (!workoutList) return;
    workoutList.innerHTML = ''; // Clear the list first
    
    currentWorkout.forEach((exercise, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'exercise-item';
        listItem.innerHTML = `
            ${exercise.name} - ${exercise.sets}x${exercise.reps} 
            ${exercise.weight > 0 ? `with ${exercise.weight} lbs` : ''}
            <button onclick="removeExercise(${index})" class="delete-btn">X</button>
        `;
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
    
    // Save the data array, not HTML
    localStorage.setItem('savedWorkout', JSON.stringify(currentWorkout));
    alert('Workout saved successfully!');
}

// Load workout
function loadWorkout() {
    const savedData = localStorage.getItem('savedWorkout');
    
    if (savedData) {
        try {
            currentWorkout = JSON.parse(savedData);
            renderWorkoutList();
            alert('Workout loaded successfully!');
        } catch (error) {
            console.error('Error loading workout:', error);
            alert('Error loading saved workout. Data might be corrupted.');
        }
    } else {
        alert('No saved workout found.');
    }
}

// Clear workout
function clearWorkout() {
    if (confirm('Are you sure you want to clear the current workout?')) {
        currentWorkout = [];
        if (workoutList) {
            workoutList.innerHTML = '';
        }
        localStorage.removeItem('savedWorkout');
    }
}

// Toggle exercise form visibility
function toggleExerciseForm() {
    const form = document.getElementById('exercise-form');
    if (form) {
        form.classList.toggle('hidden');
    }
}

