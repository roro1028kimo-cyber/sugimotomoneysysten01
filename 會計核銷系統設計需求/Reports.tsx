import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, eachMonthOfInterval, subMonths, isSameMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("6"); // months

  // Fetch vouchers from API
  const { data: vouchers = [], isLoading } = trpc.voucher.list.useQuery();

  // Calculate monthly expenses
  const monthlyData = eachMonthOfInterval({
    start: subMonths(new Date(), parseInt(timeRange) - 1),
    end: new Date(),
  }).map((date) => {
    const monthVouchers = vouchers.filter(
      (v) => isSameMonth(new Date(v.date), date) && v.status === "completed"
    );
    return {
      name: format(date, "MM月"),
      amount: monthVouchers.reduce((sum, v) => sum + parseFloat(v.amount), 0),
    };
  });

  // Calculate expenses by category (using description as category for now)
  // In a real system, we would have a dedicated category field
  const categoryData = vouchers
    .filter((v) => v.status === "completed")
    .reduce((acc, v) => {
      // Simple heuristic: use first 4 chars of description as category if no dedicated field
      const category = (v.description || "其他").substring(0, 4); 
      const existing = acc.find((c) => c.name === category);
      if (existing) {
        existing.value += parseFloat(v.amount);
      } else {
        acc.push({ name: category, value: parseFloat(v.amount) });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories

  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">財務報表</h2>
          <p className="text-muted-foreground mt-2">分析支出趨勢與費用分佈</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="選擇時間範圍" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">最近 3 個月</SelectItem>
            <SelectItem value="6">最近 6 個月</SelectItem>
            <SelectItem value="12">最近 12 個月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>每月支出趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `NT$ ${value.toLocaleString()}`}
                    cursor={{ fill: '#f3f4f6' }}
                  />
                  <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>費用分佈 (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `NT$ ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  尚無已核銷的憑證資料
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>詳細數據</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="font-medium">{item.name}</span>
                <span className="font-mono">NT$ {item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 font-bold text-lg">
              <span>總計</span>
              <span>
                NT$ {monthlyData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
