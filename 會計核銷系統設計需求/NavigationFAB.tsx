import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  Calculator,
  Menu,
  X,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Notebook } from "./Notebook";

export function NavigationFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "總覽", icon: LayoutDashboard },
    { href: "/vendors", label: "廠商管理", icon: Users },
    { href: "/employees", label: "人事管理", icon: Users },
    { href: "/payroll", label: "薪資結算", icon: Calculator },
    { href: "/vouchers", label: "會計憑證", icon: Receipt },
    { href: "/reports", label: "財務報表", icon: BarChart3 },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
      {/* Navigation Items */}
      <div
        className={cn(
          "flex flex-col items-start gap-3 transition-all duration-300 ease-in-out",
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-95 pointer-events-none"
        )}
      >
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "secondary"}
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-md transition-transform hover:scale-110",
                      location === item.href
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2 px-3 py-1.5 text-sm font-medium bg-gray-900 text-white border-none">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Main FAB & Notebook */}
      <div className="flex items-center gap-4">
        {/* Notebook Button (Always visible) */}
        <Notebook />

        {/* Main Toggle Button */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-all duration-300",
            isOpen ? "bg-gray-900 rotate-90" : "bg-black hover:scale-105"
          )}
          onClick={toggleMenu}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
