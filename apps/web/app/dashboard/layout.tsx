import { AuthGuard } from "~/components/chrome/auth-guard";
import { DashboardSidebar } from "~/components/chrome/dashboard-sidebar";
import { CommandPalette } from "~/components/chrome/command-palette";
import { DashboardShell } from "~/components/chrome/dashboard-shell";
import { MobileBottomNav } from "~/components/layout/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell sidebar={<DashboardSidebar />}>
        {children}
        <CommandPalette />
      </DashboardShell>
      <MobileBottomNav />
    </AuthGuard>
  );
}
