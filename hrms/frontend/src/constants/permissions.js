export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

export const ADMIN_NAV = [
  { to: "/", label: "Employees", end: true },
  { to: "/departments", label: "Departments" },
  { to: "/positions", label: "Positions" },
  { to: "/users", label: "Users" },
  { to: "/reports", label: "Reports" },
];

export const EMPLOYEE_NAV = [{ to: "/my-profile", label: "My Profile", end: true }];

export const isAdmin = (user) => user?.role === ROLES.ADMIN || !user?.employeeId;

export const isEmployee = (user) => user?.role === ROLES.EMPLOYEE || !!user?.employeeId;
