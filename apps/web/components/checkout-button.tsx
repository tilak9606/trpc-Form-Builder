"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCreateSubscription, useVerifyPayment } from "~/hooks/api/payment";
import { toast } from "sonner";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CheckoutButtonProps {
    plan: "pro" | "enterprise";
    children: React.ReactNode;
    className?: string;
}

export function CheckoutButton({ plan, children, className }: CheckoutButtonProps) {
    const router = useRouter();
    const { createSubscriptionAsync, isPending: isCreating } = useCreateSubscription();
    const { verifyPaymentAsync, isPending: isVerifying } = useVerifyPayment();

    const handleCheckout = async () => {
        try {
            const result = await createSubscriptionAsync({ plan });

            const options = {
                key: result.razorpayKeyId,
                subscription_id: result.subscriptionId,
                name: "FormForge",
                description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                handler: async (response: any) => {
                    try {
                        await verifyPaymentAsync({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySubscriptionId: response.razorpay_subscription_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        toast.success("Payment successful! Welcome to Pro.");
                        router.push("/dashboard");
                    } catch (error) {
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                },
                theme: {
                    color: "#1a1a1a",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            toast.error(error.message || "Failed to create subscription");
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={isCreating || isVerifying}
            className={className}
        >
            {isCreating || isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                children
            )}
        </button>
    );
}
