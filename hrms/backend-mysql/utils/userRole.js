export const getUserRole = (user) => (user?.employeeId ? "employee" : "admin");

export const isAdmin = (user) => getUserRole(user) === "admin";

export const toAuthUser = (user) => ({
  id: user.user_id,
  username: user.user_name,
  employeeId: user.employee_id ?? null,
  role: user.employee_id ? "employee" : "admin",
});
