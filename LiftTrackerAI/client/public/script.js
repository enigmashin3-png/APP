let currentWorkout = [];
let workoutHistory = [];
const workoutList = document.getElementById('workout-list');
const exerciseForm = document.getElementById('exercise-form');
const restTimerDisplay = document.getElementById('rest-timer');

// Simple exercise database with basic form guidance
const exerciseDatabase = {
    'Push-Up': 'Keep a straight line from head to heels.',
    'Squat': 'Keep your knees behind your toes and chest up.',
    'Bench Press': 'Lower the bar to mid-chest with controlled motion.'
};

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

    // Show form guidance if exercise exists in database
    if (exerciseDatabase[exerciseName]) {
        alert(`Form tip: ${exerciseDatabase[exerciseName]}`);
    }

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

        // Start a default 60 second rest timer
        startRestTimer(60);
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

    saveToHistory();
    alert('Workout saved to history!');
}

function loadWorkout() {
    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');

    if (history.length > 0) {
        currentWorkout = history[history.length - 1].exercises;
        renderWorkoutList();
    }
}

function clearWorkout() {
    if (confirm('Are you sure you want to clear the current workout?')) {
        currentWorkout = [];
        workoutList.innerHTML = '';
    }
}

function saveToHistory() {
    if (currentWorkout.length === 0) return;

    const workout = {
        date: new Date().toISOString(),
        exercises: [...currentWorkout]
    };

    const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    history.push(workout);
    localStorage.setItem('workoutHistory', JSON.stringify(history));

    // Clear current workout after saving to history
    clearWorkout();
}

let timerInterval;
function startRestTimer(seconds) {
    let remaining = seconds;
    let display = restTimerDisplay;
    if (!display) {
        display = document.createElement('div');
        display.id = 'rest-timer';
        document.body.appendChild(display);
    }
    clearInterval(timerInterval);
    display.textContent = `Rest: ${remaining}s`;
    timerInterval = setInterval(() => {
        remaining--;
        display.textContent = `Rest: ${remaining}s`;
        if (remaining <= 0) {
            clearInterval(timerInterval);
            display.textContent = '';
            alert('Rest time over!');
        }
    }, 1000);
}

