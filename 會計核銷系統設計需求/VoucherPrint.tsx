import { forwardRef } from "react";
import { Voucher, Vendor } from "@/lib/types";
import { numberToChinese } from "@/lib/utils";
import { format } from "date-fns";

interface VoucherPrintProps {
  voucher: Voucher;
  vendor: Vendor;
}

export const VoucherPrint = forwardRef<HTMLDivElement, VoucherPrintProps>(({ voucher, vendor }, ref) => {
  const date = new Date(voucher.date);

  return (
    <div ref={ref} className="w-full h-full bg-white text-black p-8 print:p-0">
      {/* A4 Size: 210mm x 297mm */}
      <div className="max-w-[210mm] mx-auto h-[297mm] relative p-12 flex flex-col">
        
        {/* Header Section */}
        <div className="mb-8 relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-widest mb-2">支出證明單</h1>
          </div>
          
          <div className="flex justify-end items-end flex-col text-sm font-medium">
            <div className="mb-1">
              <span className="mr-2">紀錄編號：</span>
              <span className="border-b border-black min-w-[120px] inline-block text-center">
                {voucher.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="mr-2">申請日期：</span>
              <span className="border-b border-black min-w-[120px] inline-block text-center">
                {format(date, "yyyy/MM/dd")}
              </span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="border border-black">
          {/* Row 1: Applicant & Department */}
          <div className="flex border-b border-black">
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold">
              廠商名稱
            </div>
            <div className="flex-1 border-r border-black p-3 flex items-center">
              {vendor.name}
            </div>
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold">
              統一編號
            </div>
            <div className="flex-1 p-3 flex items-center font-mono">
              {vendor.taxId || "-"}
            </div>
          </div>

          {/* Row 2: Subject (Account Title) */}
          <div className="flex border-b border-black">
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold">
              科目
            </div>
            <div className="flex-1 p-3 flex items-center">
              {/* 會計科目 */}
            </div>
          </div>

          {/* Row 3: Description (Reason) */}
          <div className="flex border-b border-black min-h-[80px]">
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold">
              事由
            </div>
            <div className="flex-1 p-3">
              {voucher.description}
            </div>
          </div>

          {/* Row 4: Reason for missing receipt */}
          <div className="flex border-b border-black min-h-[80px]">
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold leading-tight">
              不能取得<br/>單據原因
            </div>
            <div className="flex-1 p-3">
              {/* 預留填寫空間 */}
            </div>
          </div>

          {/* Row 5: Amount */}
          <div className="flex border-b border-black">
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold">
              實付金額
            </div>
            <div className="flex-1 p-3 flex items-center justify-between">
              <span className="text-lg font-bold">
                {numberToChinese(voucher.amount)}
              </span>
              <span className="font-mono text-lg font-bold">
                NT$ {voucher.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Row 6: Remarks */}
          <div className="flex min-h-[100px]">
            <div className="w-32 bg-gray-100 border-r border-black p-3 flex items-center justify-center font-bold">
              備註
            </div>
            <div className="flex-1 p-3">
              付款方式：{vendor.bankAccount ? `匯款 (${vendor.bankAccount})` : "現金/支票"}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-4 gap-4">
          <div className="border border-black h-32 relative">
            <div className="absolute top-0 left-0 w-full bg-gray-100 border-b border-black p-2 text-center font-bold text-sm">
              核准
            </div>
          </div>
          <div className="border border-black h-32 relative">
            <div className="absolute top-0 left-0 w-full bg-gray-100 border-b border-black p-2 text-center font-bold text-sm">
              會計
            </div>
          </div>
          <div className="border border-black h-32 relative">
            <div className="absolute top-0 left-0 w-full bg-gray-100 border-b border-black p-2 text-center font-bold text-sm">
              部門主管
            </div>
          </div>
          <div className="border border-black h-32 relative">
            <div className="absolute top-0 left-0 w-full bg-gray-100 border-b border-black p-2 text-center font-bold text-sm">
              申請人
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-auto text-center text-xs text-gray-400">
          杉本公司會計核銷系統 | 列印日期：{format(new Date(), "yyyy/MM/dd HH:mm")}
        </div>

      </div>
    </div>
  );
});

VoucherPrint.displayName = "VoucherPrint";
