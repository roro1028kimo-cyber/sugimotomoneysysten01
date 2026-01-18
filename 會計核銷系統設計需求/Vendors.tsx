import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Trash2, Edit2, Phone, User, Building2, CreditCard, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { trpc } from "@/lib/trpc";

const vendorSchema = z.object({
  name: z.string().min(1, "公司名稱為必填"),
  taxId: z.string().min(8, "統一編號至少8碼").max(8, "統一編號最多8碼"),
  phone: z.string().min(1, "電話為必填"),
  bankAccount: z.string().min(1, "銀行帳戶為必填"),
  contactPerson: z.string().min(1, "負責人姓名為必填"),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

// Type for vendor from API (id is number)
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

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ApiVendor | null>(null);

  // tRPC queries and mutations
  const { data: vendors = [], isLoading, refetch } = trpc.vendor.list.useQuery();
  const createMutation = trpc.vendor.create.useMutation({
    onSuccess: () => {
      toast.success("廠商已新增");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "新增失敗");
    },
  });
  const updateMutation = trpc.vendor.update.useMutation({
    onSuccess: () => {
      toast.success("廠商資料已更新");
      setIsDialogOpen(false);
      setEditingVendor(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "更新失敗");
    },
  });
  const deleteMutation = trpc.vendor.delete.useMutation({
    onSuccess: () => {
      toast.success("廠商已刪除");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "刪除失敗");
    },
  });

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      taxId: "",
      phone: "",
      bankAccount: "",
      contactPerson: "",
    },
  });

  useEffect(() => {
    if (editingVendor) {
      form.reset({
        name: editingVendor.name,
        taxId: editingVendor.taxId || "",
        phone: editingVendor.phone || "",
        bankAccount: editingVendor.bankAccount || "",
        contactPerson: editingVendor.contactPerson || "",
      });
    } else {
      form.reset({
        name: "",
        taxId: "",
        phone: "",
        bankAccount: "",
        contactPerson: "",
      });
    }
  }, [editingVendor, form]);

  const onSubmit = (data: VendorFormValues) => {
    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vendor.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">廠商管理</h2>
          <p className="text-muted-foreground mt-1">管理供應商與合作夥伴資訊</p>
        </div>
        <Button 
          onClick={() => {
            setEditingVendor(null);
            setIsDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> 新增廠商
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-md border border-border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input
          placeholder="搜尋廠商名稱或負責人..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">載入中...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="swiss-card p-6 rounded-lg flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{vendor.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">統編：{vendor.taxId || "未填寫"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setEditingVendor(vendor);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>確認刪除？</AlertDialogTitle>
                          <AlertDialogDescription>
                            您即將刪除廠商「{vendor.name}」。此操作無法復原，且若該廠商有相關聯的憑證，將無法刪除。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(vendor.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            確認刪除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary/60" />
                    <span>{vendor.contactPerson || "未填寫"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary/60" />
                    <span>{vendor.phone || "未填寫"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary/60" />
                    <span className="font-mono">{vendor.bankAccount || "未填寫"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredVendors.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p>尚無廠商資料，請點擊右上角新增。</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingVendor ? "編輯廠商" : "新增廠商"}</DialogTitle>
            <DialogDescription>
              請輸入廠商的基本資料。所有欄位皆為必填。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公司名稱</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：台積電" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>統一編號</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：12345678" maxLength={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>負責人姓名</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：張忠謀" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：03-563-6688" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>銀行帳戶</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：000-12345678901234" {...field} />
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
