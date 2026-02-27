let steps = [4500, 6200, 5800, 7100, 4900, 8300, 6700];

function addSteps(dayIndex, newSteps) {
  steps[dayIndex] = newSteps;
}

function getHighestSteps() {
  return Math.max(...steps);
}

function getLowestSteps() {
  return Math.min(...steps);
}

function getAverageSteps() {
  let total = steps.reduce((sum, s) => sum + s, 0);
  return total / steps.length;
}

function getAboveAverageDays() {
  let avg = getAverageSteps();
  return steps.filter(s => s > avg);
}

// Test
addSteps(0, 5000);

console.log("Steps:", steps);
console.log("Highest Steps:", getHighestSteps());
console.log("Lowest Steps:", getLowestSteps());
console.log("Average Steps:", getAverageSteps());
console.log("Above Average Days (steps):", getAboveAverageDays());