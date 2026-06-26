"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FormInput,
  Layers,
  Settings,
  LogOut,
  Sparkles,
  Folder,
  FolderPlus,
  ChevronRight,
  Pencil,
  Trash2,
  Files,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

import { useUserStore } from "~/lib/stores/user-store";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { signOut } from "~/lib/auth-client";
import { useListFolders, useCreateFolder, useUpdateFolder, useDeleteFolder } from "~/hooks/api/folder";
import { useListForms } from "~/hooks/api/form";
import { useUserPlan } from "~/hooks/api/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "~/lib/toast";
import { Progress } from "~/components/ui/progress";

const SETTINGS_ITEMS = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

function FolderNavItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { folders } = useListFolders();
  const { createFolderAsync, isPending: creatingFolder } = useCreateFolder();
  const { updateFolderAsync } = useUpdateFolder();
  const { deleteFolderAsync } = useDeleteFolder();

  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [editingFolderId, setEditingFolderId] = React.useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = React.useState("");

  const activeFolder = searchParams.get("folder");
  const isFormsActive = pathname === "/dashboard/forms" || pathname.startsWith("/dashboard/forms/");
  const isFormsExpanded = isFormsActive || (folders?.some(f => f.id === activeFolder) ?? false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await createFolderAsync({ name: folderName.trim() });
      setFolderName("");
      setFolderDialogOpen(false);
      toast.success("Folder created.");
    } catch {
      toast.error("Failed to create folder.");
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) return;
    try {
      await updateFolderAsync({ id: folderId, name: editingFolderName.trim() });
      setEditingFolderId(null);
      toast.success("Folder renamed.");
    } catch {
      toast.error("Failed to rename folder.");
    }
  };

  const handleDeleteFolder = async (folderId: string, name: string) => {
    if (!confirm(`Delete folder "${name}"? Forms will not be deleted.`)) return;
    try {
      await deleteFolderAsync({ id: folderId });
      if (activeFolder === folderId) router.push("/dashboard/forms");
      toast.success("Folder deleted.");
    } catch {
      toast.error("Failed to delete folder.");
    }
  };

  return (
    <>
      <Collapsible open={isFormsExpanded} defaultOpen>
        <SidebarMenuItem>
          <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard/forms"}
                  >
                    <Link href="/dashboard/forms">
                      <FormInput className="size-4" />
                      <span className="flex-1 text-left">Forms</span>
                    </Link>
                  </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction
              className="data-[state=open]:rotate-90"
              showOnHover
            >
              <ChevronRight className="size-3" />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === "/dashboard/forms" && !activeFolder}
                >
                  <Link href="/dashboard/forms">
                    <Files className="size-3.5" />
                    <span>All Forms</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {folders?.map((f) => (
                <SidebarMenuSubItem key={f.id}>
                  <div className="group flex items-center">
                    {editingFolderId === f.id ? (
                      <div className="flex-1 flex items-center gap-1 pl-5 pr-1">
                        <input
                          autoFocus
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onBlur={() => handleRenameFolder(f.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameFolder(f.id);
                            if (e.key === "Escape") setEditingFolderId(null);
                          }}
                          className="flex-1 h-6 px-1.5 text-xs bg-card border border-border rounded outline-none focus:border-ring"
                        />
                      </div>
                    ) : (
                      <SidebarMenuSubButton
                        asChild
                        isActive={activeFolder === f.id}
                      >
                        <Link href={`/dashboard/forms?folder=${f.id}`}>
                          <Folder className="size-3.5" />
                          <span className="truncate">{f.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    )}
                    {editingFolderId !== f.id && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingFolderId(f.id); setEditingFolderName(f.name); }}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                          title="Rename"
                        >
                          <Pencil className="size-2.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(f.id, f.name)}
                          className="p-0.5 rounded text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="size-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </SidebarMenuSubItem>
              ))}
              <SidebarMenuSubItem>
                <button
                  onClick={() => setFolderDialogOpen(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <FolderPlus className="size-3.5" />
                  <span>New Folder</span>
                </button>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Organize your forms into folders.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim() || creatingFolder}>
              {creatingFolder ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UsageMeter() {
  const { plan } = useUserPlan();
  const { forms } = useListForms();

  if (!plan) return null;

  const formCount = forms?.length || 0;
  const formLimit = plan.formLimit === -1 ? Infinity : plan.formLimit;
  const usagePercent = formLimit === Infinity ? 0 : Math.min((formCount / formLimit) * 100, 100);

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">Forms</span>
        <span className="text-foreground font-medium">
          {formCount} / {formLimit === Infinity ? "∞" : formLimit}
        </span>
      </div>
      <Progress value={usagePercent} className="h-1.5" />
      {plan.plan === "free" && formLimit !== Infinity && formCount >= formLimit * 0.8 && (
        <Link
          href="/dashboard/settings?tab=billing"
          className="text-[10px] text-primary hover:underline mt-1 block"
        >
          Upgrade for more
        </Link>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-6 rounded bg-tint-mint flex items-center justify-center">
            <Sparkles className="size-3 text-tint-mint-ink" />
          </div>
          <span className="text-sm font-semibold text-foreground">FormForge</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Forms + Folders */}
              <FolderNavItems />

              {/* Templates */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/templates" || pathname.startsWith("/dashboard/templates/")}
                >
                  <Link href="/dashboard/templates">
                    <Layers className="size-4" />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <UsageMeter />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {SETTINGS_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="size-8 border border-border">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback className="bg-muted text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <button
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
              title="Logout"
              onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/signin"; } } })}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
