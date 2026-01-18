import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Vendors from "./pages/Vendors";
import Vouchers from "./pages/Vouchers";
import VoucherPrintPreview from "./pages/VoucherPrintPreview";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Payroll from "./pages/Payroll";
import PayslipPrintPreview from "./pages/PayslipPrintPreview";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/vendors" component={Vendors} />
        <Route path={"/vouchers"} component={Vouchers} />
      <Route path={"/vouchers/print"} component={VoucherPrintPreview} />
      <Route path={"/employees"} component={Employees} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/payroll"} component={Payroll} />
      <Route path={"/payroll/print"} component={PayslipPrintPreview} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
