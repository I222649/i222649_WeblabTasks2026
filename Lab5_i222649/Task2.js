let attendees = [];
const MAX_CAPACITY = 100;

function addAttendee(name, email, ticketType) {
  if (isFull()) {
    console.log("Conference is full!");
    return;
  }
  attendees.push({ name, email, ticketType });
  console.log(`Added: ${name}`);
}

function isFull() {
  return attendees.length >= MAX_CAPACITY;
}

function listAttendees() {
  console.log("\n--- Attendee List ---");
  attendees.forEach((a, i) => {
    console.log(`${i + 1}. ${a.name} | ${a.email} | ${a.ticketType}`);
  });
}

function countByTicketType(type) {
  return attendees.filter(a => a.ticketType === type).length;
}

// Test
addAttendee("Ali Khan", "ali@gmail.com", "VIP");
addAttendee("Sara Ahmed", "sara@gmail.com", "General");
addAttendee("Shehryar Amin", "shehryar@gmail.com", "VIP");
addAttendee("ahmad", "ahmad@gmail.com", "Speaker");

listAttendees();
console.log("\nVIP Count:", countByTicketType("VIP"));
console.log("General Count:", countByTicketType("General"));
console.log("Is Full:", isFull());