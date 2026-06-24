"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "~/lib/auth-client";
import {
  Sparkles,
  LayoutDashboard,
  FormInput,
  Settings,
  LogOut,
  Plus,
  Layers,
  Folder,
  FolderPlus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useListFolders, useCreateFolder, useDeleteFolder, useUpdateFolder } from "~/hooks/api/folder";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveFolder(params.get("folder"));
  }, [pathname]);

  const { folders } = useListFolders();
  const { createFolder } = useCreateFolder();
  const { deleteFolder } = useDeleteFolder();
  const { updateFolderAsync } = useUpdateFolder();

  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/signin");
    return null;
  }

  const user = session.user;

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FormInput, label: "Forms", href: "/dashboard/forms" },
    { icon: Layers, label: "Templates", href: "/dashboard/templates" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const handleFolderClick = (folderId: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (folderId) {
      params.set("folder", folderId);
    } else {
      params.delete("folder");
    }
    const qs = params.toString();
    router.push(qs ? `/dashboard/forms?${qs}` : "/dashboard/forms");
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder({ name: newFolderName.trim() });
    setNewFolderName("");
    setIsCreating(false);
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    deleteFolder({ id: folderId });
    if (activeFolder === folderId) {
      handleFolderClick(null);
    }
  };

  const handleEditFolder = async (folderId: string) => {
    if (!editFolderName.trim()) return;
    await updateFolderAsync({ id: folderId, name: editFolderName.trim() });
    setEditingFolder(null);
    setEditFolderName("");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border flex flex-col">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormForge</span>
          </Link>
        </div>

        <div className="px-3 py-2">
          <button
            onClick={() => router.push("/dashboard/forms")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Form
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href) ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}

          {pathname.startsWith("/dashboard/forms") && (
            <>
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</span>
                  <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isCreating && (
                <div className="flex items-center gap-1 px-3 py-1">
                  <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    placeholder="Folder name..."
                    className="flex-1 bg-transparent text-sm border-b border-border outline-none py-1"
                    autoFocus
                  />
                  <button onClick={handleCreateFolder} className="text-green-500 hover:text-green-400">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => handleFolderClick(null)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  !activeFolder ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <FormInput className="h-4 w-4" />
                All Forms
              </button>

              {folders?.map((folder) => (
                <div key={folder.id} className="group flex items-center">
                  {editingFolder === folder.id ? (
                    <div className="flex items-center gap-1 px-3 py-1 w-full">
                      <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleEditFolder(folder.id)}
                        className="flex-1 bg-transparent text-sm border-b border-border outline-none py-1"
                        autoFocus
                      />
                      <button onClick={() => handleEditFolder(folder.id)} className="text-green-500 hover:text-green-400">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingFolder(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFolderClick(folder.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeFolder === folder.id
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Folder className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1 text-left">{folder.name}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFolder(folder.id);
                            setEditFolderName(folder.name);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              setEditingFolder(folder.id);
                              setEditFolderName(folder.name);
                            }
                          }}
                          className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteFolder(e, folder.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              deleteFolder({ id: folder.id });
                              if (activeFolder === folder.id) {
                                handleFolderClick(null);
                              }
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
