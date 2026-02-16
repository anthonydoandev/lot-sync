import { format } from "date-fns";

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, "M/d h:mma").toLowerCase();
};

export function groupByRetiredMonth<T extends { retired_at: string | null }>(
  items: T[]
): { label: string; items: T[] }[] {
  const groups: Record<string, T[]> = {};
  const order: string[] = [];

  for (const item of items) {
    const key = item.retired_at
      ? format(new Date(item.retired_at), "MMMM yyyy")
      : "Unknown";
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(item);
  }

  return order.map((label) => ({ label, items: groups[label] }));
}

export function groupByIO<T extends { io: string | null }>(
  items: T[]
): { label: string; items: T[] }[] {
  const groups: Record<string, T[]> = {};
  const order: string[] = [];

  for (const item of items) {
    const key = item.io || "No IO";
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(item);
  }

  return order.map((label) => ({ label, items: groups[label] }));
}
