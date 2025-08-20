document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('progressChart').getContext('2d');
  const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');

  const labels = history.map(h => new Date(h.date).toLocaleDateString());
  const data = history.map(h => h.exercises.reduce((total, ex) => total + (ex.weight * ex.reps * ex.sets), 0));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Volume',
        data,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }]
    }
  });
});
