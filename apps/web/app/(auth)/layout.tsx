export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="relative z-10 w-full max-w-[420px]">
        {children}
      </div>
    </div>
  );
}