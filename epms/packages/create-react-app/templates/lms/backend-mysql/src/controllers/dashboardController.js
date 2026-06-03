const { query } = require("../config/db");

const stats = async (_req, res) => {
  try {
    const [{ totalBooks }] = await query("SELECT COUNT(*) AS totalBooks FROM books");
    const [{ totalStudents }] = await query("SELECT COUNT(*) AS totalStudents FROM students");
    const copies = await query("SELECT COALESCE(SUM(quantity), 0) AS sum FROM books");
    const copiesInLibrary = copies[0]?.sum ?? 0;

    const [{ borrowedActive }] = await query("SELECT COUNT(*) AS borrowedActive FROM borrows WHERE returned_at IS NULL");
    const [{ returnedCount }] = await query("SELECT COUNT(*) AS returnedCount FROM borrows WHERE returned_at IS NOT NULL");
    const [{ lateReturned }] = await query(
      "SELECT COUNT(*) AS lateReturned FROM borrows WHERE returned_at IS NOT NULL AND returned_at > return_due_date"
    );
    const [{ overdueActive }] = await query(
      "SELECT COUNT(*) AS overdueActive FROM borrows WHERE returned_at IS NULL AND return_due_date < NOW()"
    );

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
