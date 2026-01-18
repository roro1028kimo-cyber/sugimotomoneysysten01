import { Clock, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TimeClock() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">打卡系統整合</h2>
        <p className="text-muted-foreground mt-2">匯入外部打卡資料以計算薪資</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              匯入出勤紀錄
            </CardTitle>
            <CardDescription>
              支援 Excel 或 CSV 格式的打卡資料匯入
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="attendance-file">選擇檔案</Label>
              <Input id="attendance-file" type="file" accept=".csv,.xlsx,.xls" />
            </div>
            <Button className="w-full">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              開始匯入
            </Button>
            <div className="text-xs text-muted-foreground mt-2">
              <p>支援欄位：員工編號、日期、上班時間、下班時間</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              系統狀態
            </CardTitle>
            <CardDescription>
              目前的打卡系統連線狀態
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span>準備就緒</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              尚未連結外部打卡機。若您使用實體打卡鐘，請定期匯出資料並透過左側面板匯入。
            </p>
            <Button variant="outline" className="w-full">
              設定連線參數
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
