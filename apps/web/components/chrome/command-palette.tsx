"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { FileText, Plus, BookOpen, LayoutDashboard, Layers, Settings } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (value: string) => {
    setOpen(false);
    switch (value) {
      case "create-form":
        router.push("/dashboard/forms/new");
        break;
      case "dashboard":
        router.push("/dashboard");
        break;
      case "forms":
        router.push("/dashboard/forms");
        break;
      case "templates":
        router.push("/dashboard/templates");
        break;
      case "settings":
        router.push("/dashboard/settings");
        break;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search forms, actions, templates..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem value="create-form" onSelect={handleSelect}>
            <Plus className="size-4 mr-2" />
            Create form
          </CommandItem>
          <CommandItem value="dashboard" onSelect={handleSelect}>
            <LayoutDashboard className="size-4 mr-2" />
            Dashboard
          </CommandItem>
          <CommandItem value="forms" onSelect={handleSelect}>
            <FileText className="size-4 mr-2" />
            Forms
          </CommandItem>
          <CommandItem value="templates" onSelect={handleSelect}>
            <Layers className="size-4 mr-2" />
            Templates
          </CommandItem>
          <CommandItem value="settings" onSelect={handleSelect}>
            <Settings className="size-4 mr-2" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
