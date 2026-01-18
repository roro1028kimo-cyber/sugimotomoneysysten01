import { useEffect, useState, useRef } from "react";
import { useRoute } from "wouter";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { VoucherPrint } from "@/components/VoucherPrint";
import { getVouchers, getVendors } from "@/lib/storage";
import { Voucher, Vendor } from "@/lib/types";

export default function VoucherPrintPreview() {
  const [, params] = useRoute("/vouchers/:id/print");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `支出證明單_${voucher?.id}`,
  });

  useEffect(() => {
    if (params?.id) {
      const vouchers = getVouchers();
      const foundVoucher = vouchers.find((v) => v.id === params.id);
      
      if (foundVoucher) {
        setVoucher(foundVoucher);
        const vendors = getVendors();
        const foundVendor = vendors.find((v) => v.id === foundVoucher.vendorId);
        setVendor(foundVendor || null);
      }
    }
  }, [params?.id]);

  if (!voucher || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">找不到憑證資料</p>
        <Link href="/vouchers">
          <Button variant="outline">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/vouchers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> 返回
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">列印預覽</h1>
        </div>
        <Button onClick={() => handlePrint()} className="bg-primary text-primary-foreground">
          <Printer className="mr-2 h-4 w-4" /> 列印 / 另存 PDF
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-8 overflow-auto flex justify-center items-start print:p-0 print:overflow-visible">
        <div className="shadow-lg print:shadow-none">
          <VoucherPrint ref={componentRef} voucher={voucher} vendor={vendor} />
        </div>
      </div>
    </div>
  );
}
