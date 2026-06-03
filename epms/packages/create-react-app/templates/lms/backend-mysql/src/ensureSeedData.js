const bcrypt = require("bcryptjs");
const { query } = require("./config/db");

async function ensureSeedData() {
  const log = [];

  const userPairs = [
    { username: "admin", email: "admin@exam.local", password: "admin123", role: "admin" },
    { username: "librarian", email: "librarian@exam.local", password: "librarian123", role: "librarian" },
  ];
  let usersCreated = 0;
  for (const { username, email, password, role } of userPairs) {
    const exists = await query("SELECT id FROM users WHERE username = ?", [username]);
    if (exists.length) continue;
    await query("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)", [
      username,
      email,
      await bcrypt.hash(password, 10),
      role,
    ]);
    usersCreated += 1;
  }
  if (usersCreated) log.push(`${usersCreated} user(s)`);

  const studentCount = await query("SELECT COUNT(*) AS c FROM students");
  if (studentCount[0].c === 0) {
    await query(
      "INSERT INTO students (full_name, gender, class_name, phone, email) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)",
      [
        "Marie Uwase", "Female", "Senior 3", "+250788100001", "marie.demo@school.test",
        "David Nkurunziza", "Male", "Senior 2", "+250788100002", "david.demo@school.test",
      ]
    );
    log.push("2 students");
  }

  const bookCount = await query("SELECT COUNT(*) AS c FROM books");
  if (bookCount[0].c === 0) {
    await query(
      "INSERT INTO books (title, author, category, quantity, published_year) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)",
      [
        "Computer Science Basics", "Teaching Team", "Textbook", 5, 2021,
        "Stories for Young Readers", "A. Mukamana", "Literature", 8, 2019,
      ]
    );
    log.push("2 books");
  }

  if (log.length) {
    console.log(`LMS seed: created ${log.join(", ")}.`);
  }
}

module.exports = ensureSeedData;
