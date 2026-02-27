const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function cleanUsername(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function validateUsername(name) {
  if (name.length < 5 || name.length > 20) {
    return "Invalid: must be 5-20 characters";
  }
  if (!/^[a-zA-Z]/.test(name.charAt(0))) {
    return "Invalid: must start with a letter";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return "Invalid: only letters, numbers, underscores allowed";
  }
  return "Valid";
}

rl.question("Enter username: ", (input) => {
  let cleaned = cleanUsername(input);
  console.log("Cleaned Username:", cleaned);
  console.log("Validation:", validateUsername(cleaned));
  rl.close();
});