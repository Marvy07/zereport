import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-6">
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
