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
        id: Date.now() // Unique ID
    };

    // Add to current workout
    currentWorkout = [...currentWorkout, exercise];
    
    // Update display
    renderWorkoutList();
    
    // Reset and hide form
    document.getElementById('exercise-form').reset();
    toggleExerciseForm();
    
    console.log('Exercise added:', exercise);
}

// NEW FUNCTION: Render workout list
function renderWorkoutList() {
    workoutList.innerHTML = ''; // Clear current list
    
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

// NEW FUNCTION: Remove exercise
function removeExercise(index) {
    if (confirm('Remove this exercise from your workout?')) {
        currentWorkout = currentWorkout.filter((_, i) => i !== index);
        renderWorkoutList();
        saveWorkout(); // Auto-save after removal
    }
}

// FIXED: Save workout function
function saveWorkout() {
    if (currentWorkout.length === 0) {
        alert('No exercises to save! Add some exercises first.');
        return;
    }
    
    try {
        localStorage.setItem('savedWorkout', JSON.stringify(currentWorkout));
        alert('✅ Workout saved successfully! You can reload the page and your workout will be there.');
    } catch (error) {
        console.error('Save error:', error);
        alert('❌ Error saving workout. Your browser may not support local storage.');
    }
}

// FIXED: Load workout function
function loadWorkout() {
    try {
        const savedData = localStorage.getItem('savedWorkout');
        if (savedData) {
            currentWorkout = JSON.parse(savedData);
            renderWorkoutList();
            console.log('Workout loaded:', currentWorkout);
        }
    } catch (error) {
        console.error('Load error:', error);
        alert('Error loading saved workout. The data might be corrupted.');
    }
}

// FIXED: Clear workout function
function clearWorkout() {
    if (confirm('Are you sure you want to clear your entire workout? This cannot be undone.')) {
        currentWorkout = [];
        localStorage.removeItem('savedWorkout');
        renderWorkoutList();
        alert('Workout cleared successfully!');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close form
    if (e.key === 'Escape' && exerciseForm.style.display === 'block') {
        toggleExerciseForm();
    }
    
    // Enter key to submit form (when form is visible and in input field)
    if (e.key === 'Enter' && exerciseForm.style.display === 'block') {
        const activeElement = document.activeElement;
        if (['exercise-name', 'sets', 'reps', 'weight'].includes(activeElement.id)) {
            addExercise();
        }
    }
});

// Optional: Sample data function
function addSampleData() {
    if (currentWorkout.length === 0 && confirm('Load sample workout data?')) {
        currentWorkout = [
            { name: 'Push-ups', sets: 3, reps: 15, weight: 0, id: 1 },
            { name: 'Squats', sets: 4, reps: 12, weight: 0, id: 2 },
            { name: 'Bench Press', sets: 3, reps: 10, weight: 135, id: 3 }
        ];
        renderWorkoutList();
        alert('Sample workout loaded! Feel free to modify or clear it.');
    }
}
