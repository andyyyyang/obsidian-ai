export type LeaveEvent = {
  id: string;
  requesterId: string;
  name: string;
  department: string | null;
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDayPeriod: "AM" | "PM" | null;
  status: "APPROVED" | "PENDING";
};

export type BirthdayEvent = {
  userId: string;
  name: string;
  department: string | null;
  date: Date;
};

export type AnniversaryEvent = {
  userId: string;
  name: string;
  department: string | null;
  date: Date;
  years: number;
};

export type CalendarEvents = {
  leaves: LeaveEvent[];
  birthdays: BirthdayEvent[];
  anniversaries: AnniversaryEvent[];
};

export type CalendarMode = "month" | "week" | "day";
