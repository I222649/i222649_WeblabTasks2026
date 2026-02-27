const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function checkPassword(password) {
  const hasUppercase = password.split("").some(c => c >= "A" && c <= "Z");
  const hasLowercase = password.split("").some(c => c >= "a" && c <= "z");
  const hasNumber = password.match(/[0-9]/);
  const hasSpecial = ["@", "#", "$", "%"].some(c => password.includes(c));
  const isLongEnough = password.length >= 8;

  let score = [hasUppercase, hasLowercase, hasNumber, hasSpecial, isLongEnough]
    .filter(Boolean).length;

  if (score <= 2) return "Weak";
  if (score <= 4) return "Medium";
  return "Strong";
}

rl.question("Enter password: ", (password) => {
  console.log("Password Strength:", checkPassword(password));
  rl.close();
});