export type SubordinateRow = {
  id: string;
  employeeNo: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  hireDate: string;
  active: boolean;
  annualLeaveEnabled: boolean;
  balance: {
    entitlement: number;
    adjustments: number;
    used: number;
    pending: number;
    remaining: number;
    yearStart: string | null;
    yearEnd: string | null;
    annualLeaveEnabled: boolean;
  };
  pendingCount: number;
  thisMonthUsed: number;
};

export type SubordinateLeave = {
  id: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayPeriod: "AM" | "PM" | null;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason: string;
  createdAt: string;
  decidedAt: string | null;
};
