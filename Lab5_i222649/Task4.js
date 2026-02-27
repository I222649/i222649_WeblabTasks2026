// A) Bug: arr.map() doesn't modify sum — it just returns a new array
// Fix: use forEach so we actually add to sum
const getAverage = (arr) => {
  let sum = 0;
  arr.forEach(num => sum += num); // Fixed
  return sum / arr.length;
};

console.log("A) getAverage([10,20,30]):", getAverage([10, 20, 30])); // Expected: 20


// B) Bug: reduce is missing a return statement for when b is longer
// Fix: add return b in the else case
function findLongestWord(str) {
  let words = str.split(" ");
  return words.reduce((a, b) => {
    if (a.length > b.length)
      return a;
    return b; // Fixed
  });
}

console.log("B) findLongestWord:", findLongestWord("JavaScript is very powerful language")); // Expected: JavaScript


// C) Bug: filter() returns an array which is always truthy, even if empty
// Fix: use every() to check that ALL marks are passing
const checkPass = (marks) => {
  if (marks.every(m => m >= 50)) // Fixed
    return "Pass";
  else
    return "Fail";
};

console.log("C) checkPass([20,30,40]):", checkPass([20, 30, 40])); // Expected: Fail
console.log("C) checkPass([50,60,70]):", checkPass([50, 60, 70])); // Expected: Pass