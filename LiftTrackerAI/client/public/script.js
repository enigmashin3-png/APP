let currentWorkout = [];
const workoutList = document.getElementById('workout-list');
const exerciseForm = document.getElementById('exercise-form');

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    exerciseForm.classList.add('hidden');
    loadWorkout();
});

function toggleExerciseForm() {
    exerciseForm.classList.toggle('hidden');
}

function addExercise() {
    const exerciseName = document.getElementById('exercise-name').value.trim();
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value || '0';

    if (exerciseName && sets && reps) {
        const exercise = {
            name: exerciseName,
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseInt(weight),
            id: Date.now() // Unique ID for each exercise
        };

        currentWorkout = [...currentWorkout, exercise];
        renderWorkoutList();
        
        // Reset form
        document.getElementById('exercise-form').reset();
        toggleExerciseForm();
    } else {
        alert('Please fill in all required fields (Exercise Name, Sets, and Reps)');
    }
}

function renderWorkoutList() {
    workoutList.innerHTML = '';
    
    if (currentWorkout.length === 0) {
        workoutList.innerHTML = '<li class="exercise-item" style="text-align: center; color: #718096;">No exercises added yet. Click "Add Exercise" to get started!</li>';
        return;
    }
    
    currentWorkout.forEach((exercise, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'exercise-item';
        listItem.innerHTML = `
            <div class="exercise-info">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">
                    ${exercise.sets} sets × ${exercise.reps} reps
                    ${exercise.weight > 0 ? `• ${exercise.weight} lbs` : ''}
                </div>
            </div>
            <button onclick="removeExercise(${index})" class="delete-btn">Remove</button>
        `;
        workoutList.appendChild(listItem);
    });
}

function removeExercise(index) {
    currentWorkout = currentWorkout.filter((_, i) => i !== index);
    renderWorkoutList();
    saveWorkout(); // Auto-save after removal
}

function saveWorkout() {
    if (currentWorkout.length === 0) {
        alert('No exercises to save! Add some exercises first.');
        return;
    }
    
    try {
        localStorage.setItem('savedWorkout', JSON.stringify(currentWorkout));
        alert('✅ Workout saved successfully! You can reload the page and your workout will be there.');
    } catch (error) {
        alert('❌ Error saving workout. Your browser may not support local storage.');
    }
}

function loadWorkout() {
    try {
        const savedData = localStorage.getItem('savedWorkout');
        if (savedData) {
            currentWorkout = JSON.parse(savedData);
            renderWorkoutList();
        }
    } catch (error) {
        console.error('Error loading workout:', error);
        alert('Error loading saved workout. The data might be corrupted.');
    }
}

function clearWorkout() {
    if (confirm('Are you sure you want to clear your current workout? This cannot be undone.')) {
        currentWorkout = [];
        localStorage.removeItem('savedWorkout');
        renderWorkoutList();
        alert('Workout cleared successfully!');
    }
}

// Add keyboard support
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !exerciseForm.classList.contains('hidden')) {
        addExercise();
    }
});

