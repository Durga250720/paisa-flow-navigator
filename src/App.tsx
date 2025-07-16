
import { Toaster } from "@/components/ui/toaster";
import 'react-toastify/dist/ReactToastify.css';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OTP from "./pages/OTP";
import BasicInfo from "./pages/BasicInfo";
import KYCDetails from "./pages/KYCDetails";
import VerificationProcessing from "./pages/VerificationProcessing";
import KYCVerified from "./pages/KYCVerified";
import LoanAmount from "./pages/LoanAmount";
import BankInfo from "./pages/BankInfo";
import IncomeVerification from "./pages/IncomeVerification";
import EmploymentInfo from "./pages/EmploymentInfo";
import LoanApplicationStatus from "./pages/LoanApplicationStatus";
import Congratulations from "./pages/Congratulations";
import LoanDetails from "./pages/LoanDetails";
import TransferSuccess from "./pages/TransferSuccess";
import KYCVerification from "./pages/KYCVerification";
import NotFound from "./pages/NotFound";
import "./styles/global.css";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import PANInfo from "./pages/PANInfo";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { ToastContainer } from 'react-toastify';
import PreApprovedLoadAmount from "./pages/PreApprovedLoanAmount";
import KycVerificationPage from "@/pages/KycVerificationPage.tsx";
import UnderwritingVerification from "./pages/UnderwritingVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ToastContainer position="bottom-right" autoClose={5000} toastClassName="text-sm text-gray-600"/>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/basic-info" element={<BasicInfo />} />
          {/*<Route path="/kyc-details" element={<KYCDetails />} />*/}
          {/*<Route path="/pan-info" element={<PANInfo />} />*/}
          <Route path="/digi-kyc" element={<KycVerificationPage />} />
          <Route path="/verification-processing" element={<VerificationProcessing />} />
          <Route path="/kyc-verification" element={<KYCVerification />} />
          <Route path="/kyc-verified" element={<KYCVerified />} />
          <Route path="/loan-amount" element={<LoanAmount />} />
          <Route path="/approved-loan-amount" element={<PreApprovedLoadAmount />}/>
          <Route path="/bank-info" element={<BankInfo />} />
          <Route path="/income-verification" element={<IncomeVerification />} />
          <Route path="/employment-info" element={<EmploymentInfo />} />
          <Route path="/loan-application-status" element={<LoanApplicationStatus />} />
          <Route path="/congratulations" element={<Congratulations />} />
          <Route path="/loan-details" element={<LoanDetails />} />
          <Route path="/transfer-success" element={<TransferSuccess />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/underwriting-verification" element={<UnderwritingVerification />} />
          <Route path="/admin/*" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
