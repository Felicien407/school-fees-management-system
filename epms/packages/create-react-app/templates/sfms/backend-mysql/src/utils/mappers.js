export const toStudentApi = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    full_name: row.full_name,
    class: row.class_name,
    parent_phone: row.parent_phone,
    created_at: row.created_at,
  };
};

export const toPaymentApi = (row) => {
  if (!row) return null;
  const paymentDate =
    row.payment_date instanceof Date
      ? row.payment_date.toISOString().slice(0, 10)
      : String(row.payment_date ?? '').slice(0, 10);
  const student =
    row.student_id && row.student_full_name
      ? {
          id: String(row.student_id),
          full_name: row.student_full_name,
          class: row.student_class_name,
          parent_phone: row.student_parent_phone,
        }
      : undefined;
  return {
    id: String(row.id),
    student_id: String(row.student_id),
    amount: Number(row.amount),
    payment_date: paymentDate,
    created_at: row.created_at,
    student,
  };
};

export const paymentSelect = `
  SELECT p.id, p.student_id, p.amount, p.payment_date, p.created_at,
         s.full_name AS student_full_name, s.class_name AS student_class_name,
         s.parent_phone AS student_parent_phone
  FROM payments p
  JOIN students s ON s.id = p.student_id
`;
