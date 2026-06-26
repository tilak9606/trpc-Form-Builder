"use client";

import * as React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useSession } from "~/lib/auth-client";
import { CheckoutButton } from "~/components/checkout-button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started with form building",
    features: [
      "Up to 10 forms",
      "20 responses per form",
      "Basic form fields",
      "Form analytics",
      "Mobile responsive",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/month",
    description: "For professionals who need advanced features",
    features: [
      "Unlimited forms",
      "Unlimited responses",
      "Custom themes & branding",
      "Advanced analytics",
      "Webhooks & integrations",
      "Custom thank-you pages",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹499",
    period: "/month",
    description: "For teams that need full control and support",
    features: [
      "Everything in Pro",
      "Custom domain",
      "File uploads",
      "Multi-page forms",
      "Team collaboration",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/signup?plan=enterprise",
    highlighted: false,
  },
];

export function PricingSection() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <section className="bg-[#f0efe3] px-6 py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-[#4a4a4a] max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? "bg-[#1a1a1a] text-[#f0efe3] shadow-2xl scale-105"
                  : "bg-white text-[#1a1a1a] shadow-lg"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#5B6AF0] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-[#a3a3a3]" : "text-[#666]"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-3 text-sm ${plan.highlighted ? "text-[#a3a3a3]" : "text-[#666]"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-[#5B6AF0]" : "text-[#1a1a1a]"
                      }`}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.highlighted || plan.name === "Enterprise" ? (
                <CheckoutButton
                  plan={plan.name === "Enterprise" ? "enterprise" : "pro"}
                  className={`block w-full text-center py-3 rounded-full font-medium transition-all ${
                    plan.highlighted
                      ? "bg-[#f0efe3] text-[#1a1a1a] hover:bg-white"
                      : "bg-[#1a1a1a] text-[#f0efe3] hover:bg-[#333]"
                  }`}
                >
                  {plan.cta}
                </CheckoutButton>
              ) : (
                <Link
                  href={isLoggedIn ? "/dashboard" : plan.href}
                  className={`block w-full text-center py-3 rounded-full font-medium transition-all ${
                    plan.highlighted
                      ? "bg-[#f0efe3] text-[#1a1a1a] hover:bg-white"
                      : "bg-[#1a1a1a] text-[#f0efe3] hover:bg-[#333]"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
