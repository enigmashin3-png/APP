let currentWorkout = [];
const workoutList = document.getElementById('workout-list');
const exerciseForm = document.getElementById('exercise-form');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Workout Tracker initialized');
    exerciseForm.style.display = 'none';
    loadWorkout(); // Load saved workout on startup
});

function toggleExerciseForm() {
    if (exerciseForm.style.display === 'none') {
        exerciseForm.style.display = 'block';
        document.getElementById('exercise-name').focus();
    } else {
        exerciseForm.style.display = 'none';
    }
}

function addExercise() {
    const exerciseName = document.getElementById('exercise-name').value.trim();
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value || '0';

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
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseInt(weight),
        id: Date.now()
    };

    // Add to current workout
    currentWorkout = [...currentWorkout, exercise];
    
    // Update display
    renderWorkoutList();
    
    // Reset and hide form
    document.getElementById('exercise-form').reset();
    toggleExerciseForm();
}

// NEW FUNCTION: Render workout list to screen
function renderWorkoutList() {
    workoutList.innerHTML = '';
    
    if (currentWorkout.length === 0) {
        workoutList.innerHTML = '<li style="text-align: center; color: #666; padding: 20px;">No exercises yet. Add your first exercise!</li>';
        return;
    }
    
    currentWorkout.forEach((exercise, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'exercise-item';
        listItem.innerHTML = `
            <div class="exercise-content">
                <strong>${exercise.name}</strong>
                <div class="exercise-details">
                    ${exercise.sets} sets × ${exercise.reps} reps
                    ${exercise.weight > 0 ? `• ${exercise.weight} lbs` : ''}
                </div>
            </div>
            <button class="delete-btn" onclick="removeExercise(${index})">×</button>
        `;
        workoutList.appendChild(listItem);
    });
}

// NEW FUNCTION: Remove individual exercise
function removeExercise(index) {
    if (confirm('Remove this exercise from your workout?')) {
        currentWorkout = currentWorkout.filter((_, i) => i !== index);
        renderWorkoutList();
        saveWorkout();
    }
}

// FIXED: Save workout to localStorage
function saveWorkout() {
    if (currentWorkout.length === 0) {
        alert('No exercises to save! Add some exercises first.');
        return;
    }
    
    try {
        localStorage.setItem('savedWorkout', JSON.stringify(currentWorkout));
        alert('✅ Workout saved successfully!');
    } catch (error) {
        alert('❌ Error saving workout.');
    }
}

// FIXED: Load workout from localStorage
function loadWorkout() {
    try {
        const savedData = localStorage.getItem('savedWorkout');
        if (savedData) {
            currentWorkout = JSON.parse(savedData);
            renderWorkoutList();
        }
    } catch (error) {
        alert('Error loading saved workout.');
    }
}

// FIXED: Clear entire workout
function clearWorkout() {
    if (confirm('Are you sure you want to clear your entire workout?')) {
        currentWorkout = [];
        localStorage.removeItem('savedWorkout');
        renderWorkoutList();
        alert('Workout cleared!');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && exerciseForm.style.display === 'block') {
        toggleExerciseForm();
    }
});

