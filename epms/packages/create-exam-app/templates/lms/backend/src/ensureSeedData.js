const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Student = require("./models/Student");
const Book = require("./models/Book");

async function ensureSeedData() {
  let log = [];

  const userPairs = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "librarian", password: "librarian123", role: "librarian" },
  ];
  let usersCreated = 0;
  for (const { username, password, role } of userPairs) {
    const exists = await User.findOne({ username });
    if (exists) continue;
    await User.create({
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role,
    });
    usersCreated += 1;
  }
  if (usersCreated) log.push(`${usersCreated} user(s)`);

  if ((await Student.countDocuments()) === 0) {
    await Student.create([
      {
        fullName: "Marie Uwase",
        gender: "Female",
        className: "Senior 3",
        phone: "+250788100001",
        email: "marie.demo@school.test",
      },
      {
        fullName: "David Nkurunziza",
        gender: "Male",
        className: "Senior 2",
        phone: "+250788100002",
        email: "david.demo@school.test",
      },
    ]);
    log.push("2 students");
  }

  if ((await Book.countDocuments()) === 0) {
    await Book.create([
      {
        title: "Computer Science Basics",
        author: "Teaching Team",
        category: "Textbook",
        quantity: 5,
        publishedYear: 2021,
      },
      {
        title: "Stories for Young Readers",
        author: "A. Mukamana",
        category: "Literature",
        quantity: 8,
        publishedYear: 2019,
      },
    ]);
    log.push("2 books");
  }

  if (log.length) {
    console.log(`LMS seed: created ${log.join(", ")}.`);
  }
}

module.exports = ensureSeedData;
