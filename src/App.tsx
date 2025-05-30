
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import BasicInfo from "./pages/BasicInfo";
import KYCDetails from "./pages/KYCDetails";
import VerificationProcessing from "./pages/VerificationProcessing";
import KYCVerified from "./pages/KYCVerified";
import BankInfo from "./pages/BankInfo";
import EmploymentInfo from "./pages/EmploymentInfo";
import LoanApplicationStatus from "./pages/LoanApplicationStatus";
import Congratulations from "./pages/Congratulations";
import LoanDetails from "./pages/LoanDetails";
import TransferSuccess from "./pages/TransferSuccess";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import "./styles/global.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/basic-info" element={<BasicInfo />} />
          <Route path="/kyc-details" element={<KYCDetails />} />
          <Route path="/verification-processing" element={<VerificationProcessing />} />
          <Route path="/kyc-verified" element={<KYCVerified />} />
          <Route path="/bank-info" element={<BankInfo />} />
          <Route path="/employment-info" element={<EmploymentInfo />} />
          <Route path="/loan-application-status" element={<LoanApplicationStatus />} />
          <Route path="/congratulations" element={<Congratulations />} />
          <Route path="/loan-details" element={<LoanDetails />} />
          <Route path="/transfer-success" element={<TransferSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
