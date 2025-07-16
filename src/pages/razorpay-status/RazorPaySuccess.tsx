import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, XCircle } from 'lucide-react';

const RazorPaySuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); // State to track success for display logic

  // Get payment details from the URL query parameters
  const paymentId = searchParams.get('razorpay_payment_id');
  const orderId = searchParams.get('razorpay_order_id');
  const signature = searchParams.get('razorpay_signature');
  const status = searchParams.get('status'); // Get the status from URL

  // NEW: Parse status from the URL and update state
  useEffect(() => {
    if (status === 'SUCCESS') {
      setPaymentStatus('success');
      setIsSuccess(true);
    } else if (status === 'FAILED') { // Using FAILED for clarity
      setPaymentStatus('failure');
      setIsSuccess(false);
    } else {
      setPaymentStatus(null); // Reset if no status
    }
  }, [status]);

  // NEW: Success Component
  const SuccessView = () => (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center transition-all duration-300">
      {/* Animated Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-bounce">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="text-xl md:text-2xl font-medium text-green-900 mt-6">
        Payment Successful!
      </h1>

      <p className="text-gray-600 text-sm mt-4">
        Thank you for your payment. Your transaction has been completed and a confirmation has been sent to your email.
      </p>

      {/* Payment Details Section */}
      {paymentId && orderId && (
        <div className="mt-8 text-left border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Transaction Details</h2>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Transaction ID:</span>
            <span className="font-mono text-gray-800 text-xs md:text-sm break-all">{paymentId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Order ID:</span>
            <span className="font-mono text-gray-800 text-xs md:text-sm break-all">{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Payment Date:</span>
            <span className="font-medium text-gray-800">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-10">
        <Link
          to="/admin/my-repayments"
          className="group inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1"
        >
          <span>Go to Repayments</span>
          <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        If you have any questions, please <Link to="/contact-support" className="text-primary hover:underline">contact our support team</Link>.
      </p>
    </div>
  );

  // NEW: Failure Component
  const FailureView = () => (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center transition-all duration-300">
      {/* Animated Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 animate-shake">
        <XCircle className="h-12 w-12 text-red-600" />
      </div>

      <h1 className="text-xl md:text-2xl font-medium text-red-900 mt-6">
        Payment Failed!
      </h1>

      <p className="text-gray-600 text-sm mt-4">
        Your payment could not be processed. Please check your payment details or try again later.
      </p>

      {/* Payment Details Section - even for failure, some details might be useful */}
      {orderId && (
        <div className="mt-8 text-left border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Transaction Attempt Details</h2>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Order ID:</span>
            <span className="font-mono text-gray-800 text-xs md:text-sm break-all">{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Attempt Date:</span>
            <span className="font-medium text-gray-800">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      )}

      {/* Action Button - Rephrased for failure */}
      <div className="mt-10">
        <Link
          to="/admin/my-repayments"
          className="group inline-flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <span>Try Again or Go Back to Repayments</span>
          <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        If you continue to experience issues, please <Link to="/contact-support" className="text-primary hover:underline">contact our support team</Link>.
      </p>
    </div>
  );

  // Modified Main Return
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
      {paymentStatus === 'success' ? (
        <SuccessView />
      ) : paymentStatus === 'failure' ? (
        <FailureView />
      ) : (
        // NEW: Default view if status is not available in URL
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h1 className="text-xl font-medium text-primary">
            Processing Payment Status...
          </h1>
          <p className="text-gray-600 text-sm mt-4">
            Please wait while we verify your payment.
          </p>
        </div>
      )}
    </div>
  );
};

export default RazorPaySuccess;