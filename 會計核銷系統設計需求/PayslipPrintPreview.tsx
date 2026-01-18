import { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { PayslipPrint } from "@/components/PayslipPrint";
import { getPayrollByPeriod } from "@/lib/payroll-storage";
import { PayrollRecord } from "@/lib/payroll-types";

export default function PayslipPrintPreview() {
  const [location, setLocation] = useLocation();
  const componentRef = useRef<HTMLDivElement>(null);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [period, setPeriod] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const p = searchParams.get("period");
    if (p) {
      setPeriod(p);
      const data = getPayrollByPeriod(p);
      setRecords(data);
    }
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `薪資單-${period}`,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 no-print">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/payroll")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回薪資結算
            </Button>
            <h1 className="text-2xl font-bold">薪資單預覽</h1>
          </div>
          <Button onClick={() => handlePrint()}>
            <Printer className="w-4 h-4 mr-2" />
            列印薪資單
          </Button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[80vh]">
            <PayslipPrint ref={componentRef} records={records} period={period} />
          </div>
        </div>
      </div>
    </div>
  );
}
