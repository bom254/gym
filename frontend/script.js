document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    document.getElementById('workoutDate').value = now.toISOString().slice(0, 16);
    loadWorkouts();
    updateDashboard();
    document.getElementById('workoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveWorkout();
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    if (sectionId === 'history') {
        displayWorkoutHistory();
    } else if (sectionId === 'dashboard') {
        updateDashboard();
    }
}

function toggleInstructions(id) {
    const instructions = document.getElementById(id);
    const button = instructions.previousElementSibling;
    if (instructions.style.display === 'none') {
        instructions.style.display = 'block';
        button.textContent = 'Hide Instructions';
    } else {
        instructions.style.display = 'none';
        button.textContent = 'Show Instructions';
    }
}

function addExercise() {
    const container = document.getElementById('exerciseContainer');
    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-entry';
    newExercise.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Exercise Name</label>
                <input type="text" name="exerciseName" placeholder="e.g., Bench Press" required>
            </div>
            <div class="form-group">
                <label>Sets</label>
                <input type="number" name="sets" min="1" placeholder="3" required>
            </div>
            <div class="form-group">
                <label>Reps</label>
                <input type="number" name="reps" min="1" placeholder="10" required>
            </div>
            <div class="form-group">
                <label>Weight (kg)</label>
                <input type="number" name="weight" min="0" step="0.5" placeholder="50">
            </div>
        </div>
        <button type="button" onclick="this.parentNode.remove()" style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin: 5px 0; cursor: pointer;">Remove</button>
    `;
    container.appendChild(newExercise);
}

async function quickLogWorkout() {
    const workout = {
        name: "Quick Workout",
        date: new Date().toISOString(),
        duration: 0,
        type: "quick",
        notes: "Quick log entry",
        exercises: []
    };
    try {
        const response = await fetch('http://localhost:3000/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
        });
        if (response.ok) {
            showMessage('Workout logged successfully!', 'success');
            loadWorkouts();
            updateDashboard();
        } else {
            showMessage('Failed to log workout.', 'error');
        }
    } catch (error) {
        showMessage('Error logging workout.', 'error');
    }
}

async function saveWorkout() {
    showLoading(true);
    const workoutName = document.getElementById('workoutName').value;
    const workoutDate = document.getElementById('workoutDate').value;
    const duration = document.getElementById('duration').value;
    const workoutType = document.getElementById('workoutType').value;
    const notes = document.getElementById('notes').value;
    const exercises = [];
    document.querySelectorAll('.exercise-entry').forEach(exercise => {
        exercises.push({
            name: exercise.querySelector('input[name="exerciseName"]').value,
            sets: parseInt(exercise.querySelector('input[name="sets"]').value),
            reps: parseInt(exercise.querySelector('input[name="reps"]').value),
            weight: parseFloat(exercise.querySelector('input[name="weight"]').value) || 0
        });
    });
    const workout = {
        name: workoutName,
        date: workoutDate,
        duration: parseInt(duration),
        type: workoutType,
        notes: notes,
        exercises: exercises
    };
    try {
        const response = await fetch('http://localhost:3000/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
        });
        if (response.ok) {
            this.reset();
            document.getElementById('exerciseContainer').innerHTML = `
                <div class="exercise-entry">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Exercise Name</label>
                            <input type="text" name="exerciseName" placeholder="e.g., Bench Press" required>
                        </div>
                        <div class="form-group">
                            <label>Sets</label>
                            <input type="number" name="sets" min="1" placeholder="3" required>
                        </div>
                        <div class="form-group">
                            <label>Reps</label>
                            <input type="number" name="reps" min="1" placeholder="10" required>
                        </div>
                        <div class="form-group">
                            <label>Weight (kg)</label>
                            <input type="number" name="weight" min="0" step="0.5" placeholder="50">
                        </div>
                    </div>
                </div>
            `;
            const now = new Date();
            document.getElementById('workoutDate').value = now.toISOString().slice(0, 16);
            showMessage('Workout saved successfully!', 'success');
            loadWorkouts();
            updateDashboard();
        } else {
            showMessage('Failed to save workout.', 'error');
        }
    } catch (error) {
        showMessage('Error saving workout.', 'error');
    }
    showLoading(false);
}

async function uploadWorkoutFile() {
    const fileInput = document.getElementById('workoutFile');
    const file = fileInput.files[0];
    if (!file) {
        showMessage('Please select a JSON file to upload.', 'error');
        return;
    }
    if (!file.name.endsWith('.json')) {
        showMessage('Please upload a valid JSON file.', 'error');
        return;
    }
    showLoading(true);
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const workout = JSON.parse(e.target.result);
            if (!isValidWorkout(workout)) {
                showMessage('Invalid workout data format.', 'error');
                showLoading(false);
                return;
            }
            workout.date = new Date(workout.date).toISOString();
            const response = await fetch('http://localhost:3000/api/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workout)
            });
            if (response.ok) {
                fileInput.value = '';
                showMessage('Workout uploaded successfully!', 'success');
                loadWorkouts();
                updateDashboard();
                displayWorkoutHistory();
            } else {
                showMessage('Failed to upload workout.', 'error');
            }
            showLoading(false);
        } catch (error) {
            showLoading(false);
            showMessage('Error parsing JSON file.', 'error');
        }
    };
    reader.onerror = function() {
        showLoading(false);
        showMessage('Error reading file.', 'error');
    };
    reader.readAsText(file);
}

function isValidWorkout(workout) {
    const requiredFields = ['name', 'date', 'duration', 'type', 'exercises'];
    const validTypes = ['strength', 'cardio', 'flexibility', 'sports', 'other', 'quick'];
    const requiredExerciseFields = ['name', 'sets', 'reps'];
    if (!requiredFields.every(field => field in workout)) {
        return false;
    }
    if (typeof workout.name !== 'string' || workout.name.trim() === '') {
        return false;
    }
    if (isNaN(new Date(workout.date).getTime())) {
        return false;
    }
    if (typeof workout.duration !== 'number' || workout.duration < 0) {
        return false;
    }
    if (!validTypes.includes(workout.type)) {
        return false;
    }
    if (!Array.isArray(workout.exercises)) {
        return false;
    }
    for (const exercise of workout.exercises) {
        if (!requiredExerciseFields.every(field => field in exercise)) {
            return false;
        }
        if (typeof exercise.name !== 'string' || exercise.name.trim() === '') {
            return false;
        }
        if (typeof exercise.sets !== 'number' || exercise.sets < 1) {
            return false;
        }
        if (typeof exercise.reps !== 'number' || exercise.reps < 1) {
            return false;
        }
        if ('weight' in exercise && (typeof exercise.weight !== 'number' || exercise.weight < 0)) {
            return false;
        }
    }
    if ('notes' in workout && typeof workout.notes !== 'string') {
        return false;
    }
    return true;
}

async function loadWorkouts() {
    try {
        const response = await fetch('http://localhost:3000/api/workouts');
        if (response.ok) {
            const workouts = await response.json();
            if (workouts.length > 0) {
                displayWorkoutHistory(workouts);
                updateDashboard(workouts);
            } else {
                displayWorkoutHistory([]);
                updateDashboard([]);
            }
        } else {
            showMessage('Failed to load workouts.', 'error');
        }
    } catch (error) {
        showMessage('Error loading workouts.', 'error');
    }
}

function displayWorkoutHistory(workouts) {
    const historyContainer = document.getElementById('workoutHistory');
    if (!workouts || workouts.length === 0) {
        historyContainer.innerHTML = '<p>No workouts logged yet.</p>';
        return;
    }
    let html = '';
    workouts.forEach(workout => {
        const date = new Date(workout.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        html += `
            <div class="workout-item" data-id="${workout._id}">
                <div class="workout-header">
                    <h3 class="workout-title">${workout.name}</h3>
                    <span class="workout-date">${formattedDate}</span>
                    <button onclick="deleteWorkout('${workout._id}')" style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Delete</button>
                </div>
                <p><strong>Type:</strong> ${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</p>
                <p><strong>Duration:</strong> ${workout.duration} minutes</p>
                ${workout.notes ? `<p><strong>Notes:</strong> ${workout.notes}</p>` : ''}
                <h4 style="margin-top: 15px;">Exercises</h4>
                <div class="exercise-list">
                    ${workout.exercises.map(exercise => `
                        <div class="exercise-item">
                            <div class="exercise-name">${exercise.name}</div>
                            <div class="exercise-details">
                                ${exercise.sets} sets × ${exercise.reps} reps
                                ${exercise.weight > 0 ? `@ ${exercise.weight}kg` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    historyContainer.innerHTML = html;
}

async function deleteWorkout(id) {
    try {
        const response = await fetch('http://localhost:3000/api/workouts/' + id, {
            method: 'DELETE'
        });
        if (response.ok) {
            showMessage('Workout deleted successfully.', 'success');
            loadWorkouts();
            updateDashboard();
        } else {
            showMessage('Failed to delete workout.', 'error');
        }
    } catch (error) {
        showMessage('Error deleting workout.', 'error');
    }
}

function updateDashboard(workouts) {
    workouts = workouts || [];
    document.getElementById('totalWorkouts').textContent = workouts.length;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisWeekWorkouts = workouts.filter(workout => {
        return new Date(workout.date) >= startOfWeek;
    });
    document.getElementById('thisWeekWorkouts').textContent = thisWeekWorkouts.length;
    const totalExercises = workouts.reduce((total, workout) => {
        return total + workout.exercises.length;
    }, 0);
    document.getElementById('totalExercises').textContent = totalExercises;
    const avgDuration = workouts.length > 0 
        ? Math.round(workouts.reduce((total, workout) => total + workout.duration, 0) / workouts.length)
        : 0;
    document.getElementById('avgWorkoutTime').textContent = avgDuration;
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all workout data? This action cannot be undone.')) {
        fetch('http://localhost:3000/api/workouts')
            .then(response => response.json())
            .then(workouts => {
                workouts.forEach(workout => {
                    deleteWorkout(workout._id);
                });
            });
        showMessage('All workout data has been reset.', 'success');
        updateDashboard([]);
        displayWorkoutHistory([]);
    }
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
