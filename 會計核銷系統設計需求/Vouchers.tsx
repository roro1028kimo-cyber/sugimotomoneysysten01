import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Filter, FileText, CheckCircle2, AlertCircle, XCircle, Calendar, DollarSign, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";

import { trpc } from "@/lib/trpc";

type VoucherStatus = "pending" | "completed" | "void";

const voucherSchema = z.object({
  vendorId: z.string().min(1, "請選擇廠商"),
  amount: z.coerce.number().min(1, "金額必須大於 0"),
  date: z.string().min(1, "請選擇日期"),
  description: z.string().min(1, "請輸入摘要"),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

// Type for voucher from API
type ApiVoucher = {
  id: number;
  vendorId: number;
  amount: string;
  date: string;
  description: string | null;
  status: "pending" | "completed" | "void";
  createdAt: Date;
  updatedAt: Date;
};

// Type for vendor from API
type ApiVendor = {
  id: number;
  name: string;
  taxId: string;
  phone: string | null;
  bankAccount: string | null;
  contactPerson: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function Vouchers() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<ApiVoucher | null>(null);

  // tRPC queries and mutations
  const { data: vouchers = [], isLoading: vouchersLoading, refetch: refetchVouchers } = trpc.voucher.list.useQuery();
  const { data: vendors = [], isLoading: vendorsLoading } = trpc.vendor.list.useQuery();

  const createMutation = trpc.voucher.create.useMutation({
    onSuccess: () => {
      toast.success("憑證已建立");
      setIsDialogOpen(false);
      refetchVouchers();
    },
    onError: (error) => {
      toast.error(error.message || "新增失敗");
    },
  });

  const updateMutation = trpc.voucher.update.useMutation({
    onSuccess: () => {
      toast.success("憑證已更新");
      setIsDialogOpen(false);
      setEditingVoucher(null);
      refetchVouchers();
    },
    onError: (error) => {
      toast.error(error.message || "更新失敗");
    },
  });

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: {
      vendorId: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
  });

  useEffect(() => {
    if (editingVoucher) {
      form.reset({
        vendorId: String(editingVoucher.vendorId),
        amount: parseFloat(editingVoucher.amount),
        date: editingVoucher.date,
        description: editingVoucher.description || "",
      });
    } else {
      form.reset({
        vendorId: "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
      });
    }
  }, [editingVoucher, form]);

  const onSubmit = (data: VoucherFormValues) => {
    if (editingVoucher) {
      updateMutation.mutate({
        id: editingVoucher.id,
        vendorId: parseInt(data.vendorId),
        amount: String(data.amount),
        date: data.date,
        description: data.description,
      });
    } else {
      createMutation.mutate({
        vendorId: parseInt(data.vendorId),
        amount: String(data.amount),
        date: data.date,
        description: data.description,
      });
    }
  };

  const handleStatusChange = (id: number, status: VoucherStatus) => {
    updateMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`憑證狀態已更新為：${getStatusLabel(status)}`);
          refetchVouchers();
        },
      }
    );
  };

  const getVendorName = (id: number) => {
    return vendors.find((v) => v.id === id)?.name || "未知廠商";
  };

  const getStatusLabel = (status: VoucherStatus) => {
    switch (status) {
      case "pending": return "待核銷";
      case "completed": return "已核銷";
      case "void": return "已作廢";
      default: return status;
    }
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">待核銷</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">已核銷</Badge>;
      case "void":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">已作廢</Badge>;
    }
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = 
      (voucher.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      getVendorName(voucher.vendorId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isLoading = vouchersLoading || vendorsLoading;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">會計憑證</h2>
          <p className="text-muted-foreground mt-1">管理與追蹤所有費用憑證</p>
        </div>
        <Button 
          onClick={() => {
            setEditingVoucher(null);
            setIsDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> 新增憑證
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 bg-card p-2 rounded-md border border-border shadow-sm flex-1 max-w-md">
          <Search className="h-5 w-5 text-muted-foreground ml-2" />
          <Input
            placeholder="搜尋摘要或廠商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0"
          />
        </div>
        
        <div className="flex items-center space-x-2 bg-card p-2 rounded-md border border-border shadow-sm w-full sm:w-48">
          <Filter className="h-5 w-5 text-muted-foreground ml-2" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VoucherStatus | "all")}>
            <SelectTrigger className="border-none shadow-none focus:ring-0">
              <SelectValue placeholder="狀態篩選" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="pending">待核銷</SelectItem>
              <SelectItem value="completed">已核銷</SelectItem>
              <SelectItem value="void">已作廢</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">載入中...</span>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">日期</TableHead>
                <TableHead className="w-[100px]">狀態</TableHead>
                <TableHead>廠商</TableHead>
                <TableHead>摘要</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="text-right w-[150px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">{voucher.date}</TableCell>
                  <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                  <TableCell className="font-medium">{getVendorName(voucher.vendorId)}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={voucher.description || ""}>
                    {voucher.description}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${parseFloat(voucher.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {voucher.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="核銷"
                            onClick={() => handleStatusChange(voucher.id, "completed")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="列印"
                            onClick={() => setLocation(`/vouchers/${voucher.id}/print`)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="編輯"
                            onClick={() => {
                              setEditingVoucher(voucher);
                              setIsDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="作廢"
                            onClick={() => handleStatusChange(voucher.id, "void")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {voucher.status !== "pending" && (
                        <span className="text-xs text-muted-foreground py-2 px-1">已封存</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                      <p>尚無符合條件的憑證資料</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? "編輯憑證" : "新增憑證"}</DialogTitle>
            <DialogDescription>
              請填寫憑證詳細資訊。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>日期</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="date" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>金額</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input type="number" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>廠商</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇廠商" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={String(vendor.id)}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>摘要說明</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="請輸入費用說明..." 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  儲存
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
