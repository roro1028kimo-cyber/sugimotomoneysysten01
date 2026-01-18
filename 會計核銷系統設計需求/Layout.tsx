import { NavigationFAB } from "./NavigationFAB";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 md:p-8 pb-0">
        <div className="max-w-6xl mx-auto flex justify-between items-end border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">會計核銷系統</h1>
            <p className="text-sm text-muted-foreground mt-1">Swiss Style Edition</p>
          </div>
          <div className="text-xs text-muted-foreground hidden md:block">
            &copy; 2025 Accounting System
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
          {children}
        </div>
      </main>

      {/* Navigation FAB */}
      <NavigationFAB />
    </div>
  );
}
