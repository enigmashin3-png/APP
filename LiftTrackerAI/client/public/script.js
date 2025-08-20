let currentWorkout = [];
const workoutList = document.getElementById('workout-list');
const exerciseForm = document.getElementById('exercise-form');

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    loadWorkout();
    exerciseForm.style.display = 'none';
});

function toggleExerciseForm() {
    exerciseForm.style.display = exerciseForm.style.display === 'none' ? 'block' : 'none';
}

function addExercise() {
    const exerciseName = document.getElementById('exercise-name').value;
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value || '0';

    if (exerciseName && sets && reps) {
        const exercise = {
            name: exerciseName,
            sets: parseInt(sets),
            reps: parseInt(reps),
            weight: parseInt(weight)
        };

        currentWorkout = [...currentWorkout, exercise];
        renderWorkoutList();
        
        document.getElementById('exercise-form').reset();
        toggleExerciseForm();
    } else {
        alert('Please fill in all required fields (name, sets, reps)');
    }
}

function renderWorkoutList() {
    workoutList.innerHTML = '';
    
    currentWorkout.forEach((exercise, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'exercise-item';
        listItem.innerHTML = `
            <span>${exercise.name} - ${exercise.sets}x${exercise.reps} 
            ${exercise.weight > 0 ? `with ${exercise.weight} lbs` : ''}</span>
            <button onclick="removeExercise(${index})" class="delete-btn">X</button>
        `;
        workoutList.appendChild(listItem);
    });
}

function removeExercise(index) {
    currentWorkout = currentWorkout.filter((_, i) => i !== index);
    renderWorkoutList();
}

function saveWorkout() {
    if (currentWorkout.length === 0) {
        alert('No exercises to save!');
        return;
    }
    
    localStorage.setItem('savedWorkout', JSON.stringify(currentWorkout));
    alert('Workout saved successfully!');
}

function loadWorkout() {
    const savedData = localStorage.getItem('savedWorkout');
    
    if (savedData) {
        try {
            currentWorkout = JSON.parse(savedData);
            renderWorkoutList();
        } catch (error) {
            console.error('Error loading workout:', error);
            alert('Error loading saved workout.');
        }
    }
}

function clearWorkout() {
    if (confirm('Are you sure you want to clear the current workout?')) {
        currentWorkout = [];
        workoutList.innerHTML = '';
        localStorage.removeItem('savedWorkout');
    }
}

