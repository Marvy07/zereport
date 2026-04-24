"use client";

import { useState } from "react";

interface Props {
  flagId: string;
  initialValue: boolean;
}

export function FlagToggle({ flagId, initialValue }: Props) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flags/${flagId}/toggle`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { value: boolean };
      setValue(data.value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? "bg-blue-600" : "bg-gray-300"
      } disabled:opacity-50`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
