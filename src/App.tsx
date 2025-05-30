
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import BasicInfo from "./pages/BasicInfo";
import AadhaarInfo from "./pages/AadhaarInfo";
import VerificationProcessing from "./pages/VerificationProcessing";
import KYCVerified from "./pages/KYCVerified";
import BankInfo from "./pages/BankInfo";
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
          <Route path="/aadhaar-info" element={<AadhaarInfo />} />
          <Route path="/verification-processing" element={<VerificationProcessing />} />
          <Route path="/kyc-verified" element={<KYCVerified />} />
          <Route path="/bank-info" element={<BankInfo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
