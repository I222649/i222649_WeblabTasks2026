const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function countWords(message) {
  return message.trim().split(/\s+/).length;
}

function countCharacters(message) {
  return message.length;
}

function containsUrgent(message) {
  const urgentWords = ["urgent", "asap", "immediately", "important"];
  let lower = message.toLowerCase();
  return urgentWords.some(word => lower.includes(word));
}

function isShouting(message) {
  let letters = message.replace(/[^a-zA-Z]/g, "");
  let upperCount = letters.split("").filter(c => c === c.toUpperCase()).length;
  return (upperCount / letters.length) > 0.7;
}

rl.question("Enter message: ", (message) => {
  console.log("Words:", countWords(message));
  console.log("Characters:", countCharacters(message));
  console.log("Contains Urgent Word:", containsUrgent(message) ? "Yes" : "No");
  console.log("Shouting:", isShouting(message) ? "Yes" : "No");
  rl.close();
});