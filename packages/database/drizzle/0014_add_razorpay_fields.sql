-- Add Razorpay subscription fields to users table
ALTER TABLE "users" ADD COLUMN "razorpay_subscription_id" varchar(100);
ALTER TABLE "users" ADD COLUMN "razorpay_customer_id" varchar(100);
ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(20) DEFAULT 'inactive';
