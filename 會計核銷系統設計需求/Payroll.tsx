import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, subMonths } from "date-fns";
import { Save, Printer, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Type for payroll record from API
type ApiPayrollRecord = {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  baseSalary: string;
  allowance: string;
  bonus: string;
  deduction: string;
  note: string | null;
  status: "draft" | "finalized";
  createdAt: Date;
  updatedAt: Date;
};

// Local record type for editing
type LocalPayrollRecord = {
  id: number | null; // null for new records
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  baseSalary: number;
  allowance: number;
  bonus: number;
  deduction: number;
  note: string;
  status: "draft" | "finalized";
};

export default function Payroll() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [records, setRecords] = useState<LocalPayrollRecord[]>([]);
  const [status, setStatus] = useState<"draft" | "finalized">("draft");
  const [isModified, setIsModified] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // tRPC queries
  const { data: payrollRecords = [], isLoading: payrollLoading, refetch: refetchPayroll } = 
    trpc.payroll.getByPeriod.useQuery({ period });
  const { data: activeEmployees = [], isLoading: employeesLoading } = 
    trpc.employee.listActive.useQuery();

  // tRPC mutations
  const saveBatchMutation = trpc.payroll.saveBatch.useMutation({
    onSuccess: () => {
      toast.success("薪資資料已儲存");
      setIsModified(false);
      refetchPayroll();
    },
    onError: (error) => {
      toast.error(error.message || "儲存失敗");
    },
  });

  const finalizeMutation = trpc.payroll.finalizePeriod.useMutation({
    onSuccess: () => {
      toast.success("薪資已結算完成");
      setStatus("finalized");
      refetchPayroll();
    },
    onError: (error) => {
      toast.error(error.message || "結算失敗");
    },
  });

  // Initialize records when data loads
  useEffect(() => {
    if (payrollLoading || employeesLoading) return;

    if (payrollRecords.length > 0) {
      // Use existing records
      const localRecords: LocalPayrollRecord[] = payrollRecords.map(r => ({
        id: r.id,
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        department: r.department,
        position: r.position,
        period: r.period,
        baseSalary: parseFloat(r.baseSalary),
        allowance: parseFloat(r.allowance),
        bonus: parseFloat(r.bonus),
        deduction: parseFloat(r.deduction),
        note: r.note || "",
        status: r.status,
      }));
      setRecords(localRecords);
      setStatus(payrollRecords[0].status);
    } else if (activeEmployees.length > 0) {
      // Initialize with active employees
      const newRecords: LocalPayrollRecord[] = activeEmployees.map(emp => ({
        id: null,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        position: emp.position,
        period: period,
        baseSalary: parseFloat(emp.baseSalary),
        allowance: parseFloat(emp.allowance),
        bonus: 0,
        deduction: 0,
        note: "",
        status: "draft" as const,
      }));
      setRecords(newRecords);
      setStatus("draft");
    } else {
      setRecords([]);
      setStatus("draft");
    }
    setIsModified(false);
    setIsInitialized(true);
  }, [payrollRecords, activeEmployees, payrollLoading, employeesLoading, period]);

  const handleValueChange = (index: number, field: keyof LocalPayrollRecord, value: string | number) => {
    if (status === "finalized") return;
    
    setRecords(prev => prev.map((record, i) => {
      if (i === index) {
        return { ...record, [field]: value };
      }
      return record;
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    const payload = records.map(r => ({
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      department: r.department,
      position: r.position,
      period: r.period,
      baseSalary: String(r.baseSalary),
      allowance: String(r.allowance),
      bonus: String(r.bonus),
      deduction: String(r.deduction),
      note: r.note,
      status: r.status,
    }));
    saveBatchMutation.mutate(payload);
  };

  const handleFinalize = () => {
    if (confirm("確認結算本月薪資？結算後將無法修改金額。")) {
      // Save first, then finalize
      const payload = records.map(r => ({
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        department: r.department,
        position: r.position,
        period: r.period,
        baseSalary: String(r.baseSalary),
        allowance: String(r.allowance),
        bonus: String(r.bonus),
        deduction: String(r.deduction),
        note: r.note,
        status: "draft" as const,
      }));
      
      saveBatchMutation.mutate(payload, {
        onSuccess: () => {
          finalizeMutation.mutate({ period });
        },
      });
    }
  };

  const calculateTotal = (record: LocalPayrollRecord) => {
    return record.baseSalary + record.allowance + record.bonus - record.deduction;
  };

  const totalAmount = records.reduce((sum, r) => sum + calculateTotal(r), 0);
  const isLoading = payrollLoading || employeesLoading;
  const isSaving = saveBatchMutation.isPending || finalizeMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">薪資結算</h2>
          <p className="text-muted-foreground mt-2">計算與管理每月員工薪資</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(v) => {
            setPeriod(v);
            setIsInitialized(false);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="選擇月份" />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map(i => {
                const d = subMonths(new Date(), i);
                const value = format(d, "yyyy-MM");
                return <SelectItem key={value} value={value}>{format(d, "yyyy年MM月")}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          
          {status === "draft" ? (
            <>
              <Button variant="outline" onClick={handleSave} disabled={!isModified || isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                儲存草稿
              </Button>
              <Button onClick={handleFinalize} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <CheckCircle className="w-4 h-4 mr-2" />
                結算薪資
              </Button>
            </>
          ) : (
            <Button variant="secondary" disabled>
              <Lock className="w-4 h-4 mr-2" />
              已結算
            </Button>
          )}
          
          <Button variant="outline" onClick={() => setLocation(`/payroll/print?period=${period}`)}>
            <Printer className="w-4 h-4 mr-2" />
            列印薪資單
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月總支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">發薪人數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length} 人</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status === "finalized" ? "default" : "outline"} className={status === "finalized" ? "bg-green-600" : ""}>
              {status === "finalized" ? "已結算" : "草稿中"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>薪資明細表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">載入中...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>職稱</TableHead>
                  <TableHead className="text-right">底薪</TableHead>
                  <TableHead className="text-right">津貼</TableHead>
                  <TableHead className="text-right w-[120px]">獎金</TableHead>
                  <TableHead className="text-right w-[120px]">扣款</TableHead>
                  <TableHead className="text-right">實發金額</TableHead>
                  <TableHead className="w-[200px]">備註</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={record.employeeId}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{record.department}</span>
                        <span className="text-xs text-muted-foreground">{record.position}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{record.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{record.allowance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="text-right h-8" 
                        value={record.bonus}
                        onChange={(e) => handleValueChange(index, "bonus", Number(e.target.value))}
                        disabled={status === "finalized"}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="text-right h-8 text-red-500" 
                        value={record.deduction}
                        onChange={(e) => handleValueChange(index, "deduction", Number(e.target.value))}
                        disabled={status === "finalized"}
                      />
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {calculateTotal(record).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Input 
                        className="h-8" 
                        value={record.note}
                        onChange={(e) => handleValueChange(index, "note", e.target.value)}
                        placeholder="備註..."
                        disabled={status === "finalized"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      尚無員工資料，請先至人事管理新增員工
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
