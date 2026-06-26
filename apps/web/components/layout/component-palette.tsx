"use client";

import { useState } from "react";
import {
  Search,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckSquare,
  Circle,
  List,
  Upload,
  ToggleLeft,
  Star,
  MessageSquare,
  Link,
  MapPin,
  CreditCard,
} from "lucide-react";

const componentGroups = [
  {
    label: "Text Elements",
    items: [
      { id: "text", name: "Single line", icon: <Type className="w-4 h-4" />, category: "text" },
      { id: "textarea", name: "Multiline", icon: <AlignLeft className="w-4 h-4" />, category: "text" },
      { id: "number", name: "Number", icon: <Hash className="w-4 h-4" />, category: "text" },
      { id: "email", name: "Email", icon: <Mail className="w-4 h-4" />, category: "text" },
      { id: "phone", name: "Phone", icon: <Phone className="w-4 h-4" />, category: "text" },
    ],
  },
  {
    label: "Choice Elements",
    items: [
      { id: "checkbox", name: "Checkbox", icon: <CheckSquare className="w-4 h-4" />, category: "choice" },
      { id: "radio", name: "Radio", icon: <Circle className="w-4 h-4" />, category: "choice" },
      { id: "select", name: "Dropdown", icon: <List className="w-4 h-4" />, category: "choice" },
      { id: "toggle", name: "Toggle", icon: <ToggleLeft className="w-4 h-4" />, category: "choice" },
      { id: "rating", name: "Rating", icon: <Star className="w-4 h-4" />, category: "choice" },
    ],
  },
  {
    label: "Date & Time",
    items: [
      { id: "date", name: "Date", icon: <Calendar className="w-4 h-4" />, category: "datetime" },
      { id: "time", name: "Time", icon: <Clock className="w-4 h-4" />, category: "datetime" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { id: "file", name: "File Upload", icon: <Upload className="w-4 h-4" />, category: "advanced" },
      { id: "url", name: "URL", icon: <Link className="w-4 h-4" />, category: "advanced" },
      { id: "address", name: "Address", icon: <MapPin className="w-4 h-4" />, category: "advanced" },
      { id: "payment", name: "Payment", icon: <CreditCard className="w-4 h-4" />, category: "advanced" },
      { id: "comment", name: "Comment", icon: <MessageSquare className="w-4 h-4" />, category: "advanced" },
    ],
  },
];

interface ComponentPaletteProps {
  onAddField?: (fieldType: string) => void;
}

export function ComponentPalette({ onAddField }: ComponentPaletteProps) {
  const [search, setSearch] = useState("");

  const filteredGroups = componentGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="w-full h-full bg-surface-2 border-r border-border overflow-auto p-4 flex flex-col gap-2">
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="search"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-md text-sm text-text-primary outline-none transition-colors focus:border-border-focus"
        />
      </div>

      {filteredGroups.map((group) => (
        <section key={group.label} className="mb-1">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 py-2">
            {group.label}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {group.items.map((item) => (
              <button
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("fieldType", item.id);
                }}
                onClick={() => onAddField?.(item.id)}
                className="flex items-center gap-2 px-2.5 py-2.5 bg-surface border border-border rounded-md cursor-grab text-text-secondary transition-all hover:border-brand hover:text-brand hover:bg-brand-light hover:shadow-shadow-sm active:cursor-grabbing"
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span className="text-xs font-medium truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
}
