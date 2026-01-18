import { Link } from "wouter";
import { 
  ArrowUpRight, 
  Users, 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Plus,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function Home() {
  // Fetch data from API
  const { data: vouchers = [], isLoading: vouchersLoading } = trpc.voucher.list.useQuery();
  const { data: vendors = [], isLoading: vendorsLoading } = trpc.vendor.list.useQuery();

  const isLoading = vouchersLoading || vendorsLoading;

  // Calculate stats
  const pending = vouchers.filter(v => v.status === "pending");
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const completedMonth = vouchers.filter(v => {
    const vDate = new Date(v.date);
    return v.status === "completed" && 
           vDate.getMonth() === currentMonth && 
           vDate.getFullYear() === currentYear;
  });

  const stats = {
    pendingCount: pending.length,
    pendingAmount: pending.reduce((sum, v) => sum + parseFloat(v.amount), 0),
    completedMonthAmount: completedMonth.reduce((sum, v) => sum + parseFloat(v.amount), 0),
    totalVendors: vendors.length,
  };

  // Get recent 5 vouchers
  const recentVouchers = [...vouchers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getVendorName = (id: number) => {
    return vendors.find(v => v.id === id)?.name || "未知廠商";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">總覽</h2>
          <p className="text-muted-foreground mt-1">歡迎回來，這是目前的財務概況。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/vouchers">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> 新增憑證
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="swiss-card border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待核銷金額</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              共 {stats.pendingCount} 筆待處理
            </p>
          </CardContent>
        </Card>

        <Card className="swiss-card border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本月已核銷</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.completedMonthAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              本月累計支出
            </p>
          </CardContent>
        </Card>

        <Card className="swiss-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">合作廠商</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              建立的廠商檔案
            </p>
          </CardContent>
        </Card>

        <Card className="swiss-card border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">系統狀態</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">雲端同步</div>
            <p className="text-xs text-muted-foreground mt-1">
              資料已連接資料庫
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 swiss-card">
          <CardHeader>
            <CardTitle>最近新增憑證</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVouchers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  尚無憑證資料
                </div>
              ) : (
                recentVouchers.map((voucher) => (
                  <div key={voucher.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        voucher.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        voucher.status === 'void' ? 'bg-red-100 text-red-600' : 
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{getVendorName(voucher.vendorId)}</p>
                        <p className="text-xs text-muted-foreground">{voucher.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono font-bold text-sm">{formatCurrency(parseFloat(voucher.amount))}</span>
                      <span className="text-xs text-muted-foreground">{voucher.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentVouchers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <Link href="/vouchers">
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                    查看所有憑證 <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 swiss-card">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/vendors">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">管理廠商</h3>
                  <p className="text-xs text-muted-foreground">新增或編輯合作夥伴資訊</p>
                </div>
              </div>
            </Link>
            
            <Link href="/vouchers">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium">憑證核銷</h3>
                  <p className="text-xs text-muted-foreground">處理待核銷的費用憑證</p>
                </div>
              </div>
            </Link>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h3 className="font-medium text-sm mb-2">系統提示</h3>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>資料已同步至雲端資料庫</li>
                <li>可在多個裝置上存取相同資料</li>
                <li>已核銷的憑證無法修改金額</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
