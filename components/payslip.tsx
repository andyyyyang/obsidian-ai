import type { Payroll } from "@prisma/client";
import { ntd } from "@/lib/payroll";

type Employee = {
  name: string;
  employeeNo: string;
  department: string | null;
  jobTitle: string | null;
  email: string;
};

export function Payslip({ payroll, employee }: { payroll: Payroll; employee: Employee }) {
  const grossPositive =
    payroll.baseSalary +
    payroll.overtimePay +
    payroll.fullAttendanceBonus +
    payroll.otherBonus;
  const totalDeduction =
    payroll.lateDeduction +
    payroll.leaveDeduction +
    payroll.laborInsurance +
    payroll.healthInsurance +
    payroll.laborPensionSelf +
    payroll.incomeTax +
    payroll.otherDeduction;

  return (
    <article className="payslip mx-auto max-w-2xl rounded-3xl bg-white p-8 text-slate-900 shadow-sm print:max-w-full print:rounded-none print:p-6 print:shadow-none">
      <header className="mb-6 border-b border-slate-300 pb-4">
        <h1 className="text-2xl font-bold">薪資明細表</h1>
        <p className="mt-1 text-sm text-slate-500">
          {payroll.year} 年 {payroll.month} 月
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <Field label="員工姓名" value={employee.name} />
        <Field label="員工編號" value={employee.employeeNo} />
        <Field label="部門" value={employee.department ?? "—"} />
        <Field label="職稱" value={employee.jobTitle ?? "—"} />
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">出勤統計</h2>
        <div className="grid grid-cols-4 gap-3 rounded-2xl bg-slate-50 p-4 text-center">
          <Mini label="應出勤" value={`${payroll.expectedDays} 天`} />
          <Mini label="實出勤" value={`${payroll.actualDays} 天`} />
          <Mini label="請假" value={`${payroll.leaveDays} 天`} />
          <Mini label="缺勤" value={`${payroll.absentDays} 天`} />
          <Mini label="總工時" value={`${(payroll.totalMinutes / 60).toFixed(1)} h`} />
          <Mini label="遲到" value={`${payroll.lateMinutes} 分`} />
          <Mini label="早退" value={`${payroll.earlyLeaveMinutes} 分`} />
          <Mini label="加班" value={`${payroll.overtimeMinutes} 分`} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">薪資項目</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-200">
            <Row label="本薪" amount={payroll.baseSalary} />
            {payroll.overtimePay > 0 && <Row label="加班費" amount={payroll.overtimePay} />}
            {payroll.fullAttendanceBonus > 0 && <Row label="全勤獎金" amount={payroll.fullAttendanceBonus} />}
            {payroll.otherBonus > 0 && <Row label="其他獎金" amount={payroll.otherBonus} />}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-semibold">
              <td className="py-2">小計</td>
              <td className="py-2 text-right tabular-nums">{ntd(grossPositive)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">扣款項目</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-200">
            {payroll.lateDeduction > 0 && <Row label="遲到扣款" amount={-payroll.lateDeduction} negative />}
            {payroll.leaveDeduction > 0 && <Row label="請假扣款" amount={-payroll.leaveDeduction} negative />}
            {payroll.laborInsurance > 0 && <Row label="勞保自負額" amount={-payroll.laborInsurance} negative />}
            {payroll.healthInsurance > 0 && <Row label="健保自負額" amount={-payroll.healthInsurance} negative />}
            {payroll.laborPensionSelf > 0 && <Row label="勞退自願提撥" amount={-payroll.laborPensionSelf} negative />}
            {payroll.incomeTax > 0 && <Row label="所得稅" amount={-payroll.incomeTax} negative />}
            {payroll.otherDeduction > 0 && <Row label="其他扣款" amount={-payroll.otherDeduction} negative />}
            {totalDeduction === 0 && (
              <tr>
                <td className="py-2 text-slate-400" colSpan={2}>無</td>
              </tr>
            )}
          </tbody>
          {totalDeduction > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td className="py-2">小計</td>
                <td className="py-2 text-right tabular-nums text-rose-600">-{ntd(totalDeduction)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </section>

      <section className="mt-8 rounded-2xl bg-slate-900 p-5 text-white print:bg-slate-100 print:text-slate-900">
        <div className="flex items-baseline justify-between">
          <span className="text-sm">實領金額</span>
          <span className="text-3xl font-bold tabular-nums">{ntd(payroll.netPay)}</span>
        </div>
      </section>

      {payroll.note && (
        <section className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <div className="mb-1 text-xs font-semibold text-slate-400">備註</div>
          {payroll.note}
        </section>
      )}

      <footer className="mt-8 border-t border-slate-200 pt-3 text-xs text-slate-400">
        產生時間：{payroll.generatedAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
      </footer>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Row({ label, amount, negative }: { label: string; amount: number; negative?: boolean }) {
  return (
    <tr>
      <td className="py-2 text-slate-700">{label}</td>
      <td className={`py-2 text-right tabular-nums ${negative ? "text-rose-600" : "text-slate-900"}`}>
        {ntd(amount)}
      </td>
    </tr>
  );
}
