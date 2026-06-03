const mapStudent = (row) => {
  if (!row) return null;
  return {
    _id: String(row.id),
    fullName: row.full_name,
    gender: row.gender,
    className: row.class_name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapBook = (row) => {
  if (!row) return null;
  return {
    _id: String(row.id),
    title: row.title,
    author: row.author,
    category: row.category,
    quantity: row.quantity,
    publishedYear: row.published_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapBorrowRow = (row) => {
  const student = row.student_id
    ? mapStudent({
        id: row.student_id,
        full_name: row.student_full_name,
        gender: row.student_gender,
        class_name: row.student_class_name,
        phone: row.student_phone,
        email: row.student_email,
      })
    : null;
  const book = row.book_id
    ? mapBook({
        id: row.book_id,
        title: row.book_title,
        author: row.book_author,
        category: row.book_category,
        quantity: row.book_quantity,
        published_year: row.book_published_year,
      })
    : null;
  return {
    _id: String(row.id),
    student,
    book,
    borrowDate: row.borrow_date,
    returnDueDate: row.return_due_date,
    returnedAt: row.returned_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const borrowSelect = `
  SELECT b.id, b.borrow_date, b.return_due_date, b.returned_at, b.created_at, b.updated_at,
         s.id AS student_id, s.full_name AS student_full_name, s.gender AS student_gender,
         s.class_name AS student_class_name, s.phone AS student_phone, s.email AS student_email,
         bk.id AS book_id, bk.title AS book_title, bk.author AS book_author,
         bk.category AS book_category, bk.quantity AS book_quantity, bk.published_year AS book_published_year
  FROM borrows b
  JOIN students s ON s.id = b.student_id
  JOIN books bk ON bk.id = b.book_id
`;

module.exports = { mapStudent, mapBook, mapBorrowRow, borrowSelect };
