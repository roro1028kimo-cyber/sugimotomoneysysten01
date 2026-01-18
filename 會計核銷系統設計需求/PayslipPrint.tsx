import React from "react";
import { PayrollRecord } from "@/lib/payroll-types";
import { format } from "date-fns";

interface PayslipPrintProps {
  records: PayrollRecord[];
  period: string;
}

export const PayslipPrint = React.forwardRef<HTMLDivElement, PayslipPrintProps>(
  ({ records, period }, ref) => {
    const year = period.split("-")[0];
    const month = period.split("-")[1];

    return (
      <div ref={ref} className="print-container p-8 bg-white text-black">
        <style type="text/css" media="print">
          {`
            @page { size: A4; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; }
            .page-break { page-break-after: always; }
          `}
        </style>

        {records.map((record, index) => {
          const totalIncome = Number(record.baseSalary) + Number(record.allowance) + Number(record.bonus);
          const netPay = totalIncome - Number(record.deduction);

          return (
            <div key={record.id} className={index < records.length - 1 ? "page-break" : ""}>
              <div className="border-2 border-black p-8 max-w-[210mm] mx-auto h-[140mm] mb-8 relative">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold tracking-widest mb-2">薪 資 明 細 單</h1>
                  <p className="text-lg font-mono">{year} 年 {month} 月</p>
                </div>

                {/* Employee Info */}
                <div className="flex justify-between mb-6 border-b border-black pb-4">
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="font-bold w-16">姓名：</span>
                      <span>{record.employeeName}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold w-16">部門：</span>
                      <span>{record.department}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex gap-2 justify-end">
                      <span className="font-bold">職稱：</span>
                      <span>{record.position}</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <span className="font-bold">列印日期：</span>
                      <span>{format(new Date(), "yyyy/MM/dd")}</span>
                    </div>
                  </div>
                </div>

                {/* Salary Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {/* Income */}
                  <div>
                    <h3 className="font-bold border-b border-black mb-4 pb-1">應發項目</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>本薪</span>
                        <span className="font-mono">{record.baseSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>職務津貼</span>
                        <span className="font-mono">{record.allowance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>獎金</span>
                        <span className="font-mono">{record.bonus.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-gray-400 pt-2 mt-2 font-bold">
                        <span>應發合計</span>
                        <span className="font-mono">{totalIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="font-bold border-b border-black mb-4 pb-1">應扣項目</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>代扣款項</span>
                        <span className="font-mono">{record.deduction.toLocaleString()}</span>
                      </div>
                      {/* Placeholder for future detailed deductions */}
                      <div className="flex justify-between text-transparent">
                        <span>-</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between text-transparent">
                        <span>-</span>
                        <span>0</span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-gray-400 pt-2 mt-2 font-bold">
                        <span>應扣合計</span>
                        <span className="font-mono">{record.deduction.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="border-t-2 border-black pt-4 flex justify-between items-center mb-8">
                  <span className="font-bold text-lg">實發金額</span>
                  <span className="font-bold text-2xl font-mono">NT$ {netPay.toLocaleString()}</span>
                </div>

                {/* Note */}
                {record.note && (
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-bold mr-2">備註：</span>
                    {record.note}
                  </div>
                )}

                {/* Footer */}
                <div className="absolute bottom-8 left-8 right-8 text-center text-xs text-gray-400">
                  此薪資單由系統自動產生，若有疑問請洽人事單位
                </div>
              </div>
              
              {/* Cut Line (for A4 printing 2 slips per page if needed, currently 1 per page for clarity) */}
              {/* <div className="border-b border-dashed border-gray-300 my-8 relative">
                <span className="absolute left-1/2 -top-3 bg-white px-2 text-gray-400 text-xs">剪下線</span>
              </div> */}
            </div>
          );
        })}
      </div>
    );
  }
);

PayslipPrint.displayName = "PayslipPrint";
