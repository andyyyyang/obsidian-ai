/**
 * 薪資計算：將 MonthlyTotals + SalaryConfig 算出本薪、扣款、實領金額。
 */

import type { SalaryConfig } from "@prisma/client";
import type { MonthlyTotals } from "./attendance";

export type PayrollBreakdown = {
  baseSalary: number;
  fullAttendanceBonus: number;
  lateDeduction: number;
  leaveDeduction: number;
  laborInsurance: number;
  healthInsurance: number;
  laborPensionSelf: number;
};

/**
 * 計算本薪與扣款（不含加班費 / 所得稅 / 其他獎金，那些由 HR 在生成後手動填）。
 */
export function calculatePayroll(
  config: SalaryConfig,
  totals: MonthlyTotals,
): PayrollBreakdown {
  let baseSalary = 0;
  let leaveDeduction = 0;

  switch (config.type) {
    case "MONTHLY": {
      baseSalary = config.amount;
      // 請假扣款：若有自訂日扣款用之，否則用 月薪/應出勤天數
      if (totals.leaveDays > 0) {
        const perDay =
          config.leaveDeductPerDay ??
          (totals.expectedDays > 0 ? config.amount / totals.expectedDays : 0);
        leaveDeduction = round2(perDay * totals.leaveDays);
      }
      break;
    }
    case "HOURLY": {
      const hours = totals.totalMinutes / 60;
      baseSalary = round2(config.amount * hours);
      break;
    }
    case "DAILY": {
      baseSalary = round2(config.amount * totals.actualDays);
      break;
    }
  }

  const lateDeduction = round2(config.lateDeductionPerMinute * totals.lateMinutes);
  const fullAttendanceBonus = totals.hasFullAttendance ? config.fullAttendanceBonus : 0;

  return {
    baseSalary,
    fullAttendanceBonus,
    lateDeduction,
    leaveDeduction,
    laborInsurance: config.laborInsurance,
    healthInsurance: config.healthInsurance,
    laborPensionSelf: config.laborPensionSelf,
  };
}

/** 算實領金額 = 本薪 + 各種獎金/加班 - 各種扣款 */
export function calculateNetPay(parts: {
  baseSalary: number;
  overtimePay: number;
  fullAttendanceBonus: number;
  otherBonus: number;
  lateDeduction: number;
  leaveDeduction: number;
  laborInsurance: number;
  healthInsurance: number;
  laborPensionSelf: number;
  incomeTax: number;
  otherDeduction: number;
}): number {
  const positive =
    parts.baseSalary + parts.overtimePay + parts.fullAttendanceBonus + parts.otherBonus;
  const negative =
    parts.lateDeduction +
    parts.leaveDeduction +
    parts.laborInsurance +
    parts.healthInsurance +
    parts.laborPensionSelf +
    parts.incomeTax +
    parts.otherDeduction;
  return round2(positive - negative);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 格式化 NTD 顯示 */
export function ntd(n: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}
