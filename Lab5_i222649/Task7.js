const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getInitials(department) {
  return department
    .split(" ")
    .map(word => word.charAt(0).toLowerCase())
    .join("");
}

function generateEmail(fullName, department) {
  let parts = fullName.split(" ");
  let firstName = parts[0].toLowerCase();
  let lastName = parts[parts.length - 1].toLowerCase();
  let initials = getInitials(department);
  return `${firstName}.${lastName}@${initials}.uni.edu`;
}

rl.question("Enter full name: ", (fullName) => {
  rl.question("Enter department: ", (department) => {
    console.log("Department Initials:", getInitials(department));
    console.log("Generated Email:", generateEmail(fullName, department));
    rl.close();
  });
});