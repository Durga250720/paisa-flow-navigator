// src/components/RepaymentView.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { config } from '../config/environment';
import { format, differenceInDays, isToday, startOfDay } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";

// Icons
import {
  ArrowLeft,
  User,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  History,
  Paperclip,
  X,
  Link as LinkIcon,
  Wallet
} from 'lucide-react';

// --- MODIFICATION: Add Razorpay to the Window type for TypeScript ---
declare global {
  interface Window {
    Razorpay;
  }
}

// --- Type Definitions ---
type RepaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
type PaymentMode = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH' | 'CHEQUE' | 'ONLINE';
type RepaymentType = 'ONLINE' | 'OFFLINE';

interface PaymentHistoryItem {
  amount: number;
  paidAt: string;
  repaymentType: RepaymentType;
  mode: PaymentMode;
  referenceId: string;
  attachments: string[];
  upiId: string | null;
  cardNumber: string | null;
  cardHolderName: string | null;
  bankName: string | null;
  chequeNumber: string | null;
}

interface RepaymentDetails {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerMobile: string;
  borrowerDisplayId: string;
  loanDisplayId: string;
  dueLoanAmount: number;
  dueDate: string;
  lateDays: number;
  lateFeeCharged: number;
  lateFeePerDay: number;
  amountToBePaid: number;
  amountPaid: number;
  pendingAmount: number;
  lastPaidAt: string | null;
  status: RepaymentStatus;
  paymentHistory: PaymentHistoryItem[];
  latePayment: boolean;
}

// --- NEW: Type for Razorpay's success response ---
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// --- Helper Functions ---
const toTitleCase = (str: string | null) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// --- Custom hook to load the Razorpay SDK script ---
const useRazorpayScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const scriptId = 'razorpay-checkout-js';
    if (document.getElementById(scriptId)) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error("Razorpay SDK could not be loaded.");
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement && scriptElement.parentElement) {
        // It's often better to leave the SDK script loaded
      }
    };
  }, []);

  return isLoaded;
};


// --- Attachment Modal Component ---
const AttachmentModal = ({ attachments, onClose }: { attachments: string[]; onClose: () => void }) => {
  if (attachments.length === 0) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Attachments</h3>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <ul className="space-y-3">
              {attachments.map((url, index) => (
                  <li key={index}>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 mr-3 text-primary" />
                      <span className="text-sm font-medium text-blue-600 hover:underline">
                        View Attachment {index + 1}
                      </span>
                    </a>
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
};


// --- Main Repayment View Component ---
const RepaymentView = () => {
  const { repaymentId } = useParams<{ repaymentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [details, setDetails] = useState<RepaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAttachments, setModalAttachments] = useState<string[]>([]);
  const [isPaying, setIsPaying] = useState(false); // --- NEW: State for payment processing

  const isRazorpayLoaded = useRazorpayScript();

  const fetchRepaymentDetails = useCallback(async () => {
    if (!repaymentId) {
      setError("Repayment ID is missing from the URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.baseURL}repayment/${repaymentId}/details`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText} (Status: ${response.status})`);
      }

      const result = await response.json();
      if (result.data) {
        setDetails(result.data);
      } else {
        throw new Error('Repayment details not found in the API response.');
      }
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "API Error",
        description: err.message || "Could not fetch repayment data.",
      });
    } finally {
      setLoading(false);
    }
  }, [repaymentId, toast]);

  useEffect(() => {
    fetchRepaymentDetails();
  }, [fetchRepaymentDetails]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getDueDateInfo = (dueDateString: string | null): JSX.Element => {
    if (!dueDateString) {
      return <p className="font-medium">N/A</p>;
    }
    try {
      const today = startOfDay(new Date());
      const dueDate = startOfDay(new Date(dueDateString));
      const formattedDate = format(new Date(dueDateString), 'd MMM yyyy');

      if (isToday(dueDate)) {
        return <p className="font-semibold text-blue-600">Due Today ({formattedDate})</p>;
      }

      const daysDifference = differenceInDays(dueDate, today);

      if (daysDifference < 0) {
        return <p className="font-semibold text-red-600">Overdue by {Math.abs(daysDifference)} day{Math.abs(daysDifference) > 1 ? 's' : ''}</p>;
      }

      return <p className="font-medium">{formattedDate} (Due in {daysDifference} day{daysDifference > 1 ? 's' : ''})</p>;
    } catch (error) {
      console.error("Error parsing due date:", error);
      try {
        return <p className="font-medium">{format(new Date(dueDateString), 'd MMM yyyy')}</p>;
      } catch {
        return <p className="font-medium text-red-500">Invalid Date</p>
      }
    }
  };

  const getStatusBadge = (status: RepaymentStatus) => {
    const statusConfig = {
      PAID: { classes: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-4 h-4 mr-2" /> },
      OVERDUE: { classes: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle className="w-4 h-4 mr-2" /> },
      PARTIAL: { classes: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="w-4 h-4 mr-2" /> },
      PENDING: { classes: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Clock className="w-4 h-4 mr-2" /> },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
        <Badge className={`${config.classes} text-sm py-1 px-3 border`}>
          {config.icon}
          {toTitleCase(status)}
        </Badge>
    );
  };

  const openAttachmentModal = (attachments: string[]) => {
    setModalAttachments(attachments);
    setIsModalOpen(true);
  };

  const handlePayNow = async () => {
    if (!details || details.pendingAmount <= 0) {
      toast({ variant: "default", title: "No Pending Amount", description: "This repayment has no pending amount to be paid." });
      return;
    }
    if (!isRazorpayLoaded) {
      toast({ title: "Payment Gateway Loading", description: "Please wait a moment and try again." });
      return;
    }
    if (isPaying) return;

    setIsPaying(true);
    try {
      // Create a Razorpay Order from your backend
      const orderResponse = await fetch(`${config.baseURL}payment/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({
          amount: details.pendingAmount, // Amount in paisa
          repaymentId: details.id,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create payment order.');
      }

      const result = await orderResponse.json();
      const orderData = result.data;

      // Configure Razorpay options
      const options = {
        key: "rzp_test_IoCHSYZRCKWYsq",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Paisa108",
        description: `Repayment for Loan ${details.loanDisplayId}`,
        image: "/your-logo.png",
        order_id: orderData.id,
        handler: async function (response: RazorpayResponse) {
          try {
            const verificationResponse = await fetch(`${config.baseURL}payment/razorpay/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verificationResponse.ok) {
              throw new Error('Payment verification failed on the server.');
            }

            toast({
              variant: "default",
              className: "bg-green-100 text-green-800",
              title: "Payment Successful!",
              description: "Your payment has been verified and recorded.",
            });
            fetchRepaymentDetails(); // Refresh data
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: error.message || "Could not verify your payment. Please contact support.",
            });
          }
        },
        prefill: {
          name: details.borrowerName,
          email: details.borrowerEmail,
          contact: details.borrowerMobile,
        },
        notes: {
          repayment_id: details.id,
          loan_id: details.loanDisplayId,
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function() {
            // This function is called when the user closes the modal without paying
            setIsPaying(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      // Razorpay handles closing the modal, so we reset our state on modal close
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: response.error.description || "Your payment could not be processed.",
        });
        setIsPaying(false); // Reset state on failure
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
      });
      setIsPaying(false); // Reset state on error
    }
  };


  if (loading) {
    return (
        <div className="h-full w-full flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-gray-600 mt-4">Loading repayment details...</p>
          </div>
        </div>
    );
  }

  if (error || !details) {
    return (
        <div className="h-full w-full flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-lg text-red-600">{error || 'Repayment not found.'}</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
    );
  }

  return (
      <>
        {isModalOpen && <AttachmentModal attachments={modalAttachments} onClose={() => setIsModalOpen(false)} />}
        <div className="p-4 sm:p-6 h-full w-full bg-gray-50 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-medium text-primary">Your Repayment Details</h1>
                <p className="text-sm text-gray-600">For Loan: {details.loanDisplayId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(details.status)}
              {details.pendingAmount > 0 && details.status !== 'PAID' && (
                  // --- MODIFICATION: Update button text and disabled state based on payment status ---
                  <Button
                      onClick={handlePayNow}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                      disabled={!isRazorpayLoaded || loading || isPaying}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isPaying ? 'Processing...' : (isRazorpayLoaded ? 'Pay Now' : 'Loading...')}
                  </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500">Principal Due</p>
                    <p className="font-semibold text-lg">{formatCurrency(details.dueLoanAmount)}</p>
                  </div>

                  {details.lateFeeCharged > 0 && (
                      <div>
                        <p className="text-gray-500">Late Fee Charged</p>
                        <p className="font-semibold text-lg text-orange-600">{formatCurrency(details.lateFeeCharged)}</p>
                      </div>
                  )}

                  <div>
                    <p className="text-gray-500">Total Amount Due</p>
                    <p className="font-semibold text-lg">{formatCurrency(details.amountToBePaid)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount Paid</p>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(details.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pending Amount</p>
                    <p className="font-semibold text-lg text-red-600">{formatCurrency(details.pendingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    {getDueDateInfo(details.dueDate)}
                  </div>
                  {details.lastPaidAt && (
                      <div>
                        <p className="text-gray-500">Last Paid On</p>
                        <p className="font-medium">{formatDate(details.lastPaidAt)}</p>
                      </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Your Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {details.paymentHistory.length > 0 ? (
                      <div className="space-y-4">
                        {details.paymentHistory.map((item, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-green-600 text-lg">{formatCurrency(item.amount)}</p>
                                  <p className="text-xs text-gray-500">{formatDate(item.paidAt)}</p>
                                </div>
                                <Badge variant="outline">{toTitleCase(item.mode)}</Badge>
                              </div>
                              <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div className="flex"><strong className="w-28 text-gray-500 font-medium shrink-0">Reference ID:</strong> <span className="text-gray-800 break-all">{item.referenceId || 'N/A'}</span></div>
                                {item.mode === 'CHEQUE' && item.chequeNumber && <div className="flex"><strong className="w-28 text-gray-500 font-medium shrink-0">Cheque No:</strong> <span className="text-gray-800">{item.chequeNumber}</span></div>}
                              </div>
                              {item.attachments.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <button onClick={() => openAttachmentModal(item.attachments)} className="flex items-center text-blue-600 hover:underline text-xs font-semibold">
                                      <Paperclip className="w-3 h-3 mr-2" />
                                      View Attachments ({item.attachments.length})
                                    </button>
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                  ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No payment history available.</p>
                  )}
                </CardContent>
              </Card>

              {details.lateFeeCharged > 0 && (
                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-700 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Late Fee Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-orange-600">Late Days</p>
                        <p className="font-semibold text-orange-800">{details.lateDays}</p>
                      </div>
                      <div>
                        <p className="text-orange-600">Late Fee Charged</p>
                        <p className="font-semibold text-orange-800">{formatCurrency(details.lateFeeCharged)}</p>
                      </div>
                      <div>
                        <p className="text-orange-600">Late Fee Per Day</p>
                        <p className="font-semibold text-orange-800">{formatCurrency(details.lateFeePerDay)}</p>
                      </div>
                    </CardContent>
                  </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold">{details.borrowerName}</p>
                    <p className="text-gray-500">Your ID: {details.borrowerDisplayId}</p>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{details.borrowerEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{details.borrowerMobile}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
  );
};

export default RepaymentView;