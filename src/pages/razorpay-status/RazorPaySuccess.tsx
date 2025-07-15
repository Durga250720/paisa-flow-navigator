import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const RazorPaySuccess = () => {
    const [searchParams] = useSearchParams();

    // Get payment details from the URL query parameters provided by Razorpay
    const paymentId = searchParams.get('razorpay_payment_id');
    const orderId = searchParams.get('razorpay_order_id');
    const signature = searchParams.get('razorpay_signature');

    // This effect can be used to send payment details to your backend for verification
    useEffect(() => {
        if (paymentId && orderId && signature) {
            // You should implement an actual API call to your backend to verify the payment signature
            // and confirm the transaction on your server.
            console.log('Payment details for verification:', { paymentId, orderId, signature });
        }
    }, [paymentId, orderId, signature]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
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
        </div>
    );
};

export default RazorPaySuccess;