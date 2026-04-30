const Book = require("../models/Book");
const Student = require("../models/Student");
const Borrow = require("../models/Borrow");

const stats = async (_req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalCopies = await Book.aggregate([{ $group: { _id: null, sum: { $sum: "$quantity" } } }]);
    const copiesInLibrary = totalCopies[0]?.sum ?? 0;

    const borrowedActive = await Borrow.countDocuments({ returnedAt: null });
    const returnedCount = await Borrow.countDocuments({ returnedAt: { $ne: null } });

    const now = new Date();
    const lateReturned = await Borrow.countDocuments({
      returnedAt: { $ne: null },
      $expr: { $gt: ["$returnedAt", "$returnDueDate"] },
    });

    const overdueActive = await Borrow.countDocuments({
      returnedAt: null,
      returnDueDate: { $lt: now },
    });

    return res.json({
      totalBookTitles: totalBooks,
      totalCopiesInLibrary: copiesInLibrary,
      totalStudents,
      borrowedActive,
      returnedCount,
      lateReturned,
      overdueActive,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { stats };
