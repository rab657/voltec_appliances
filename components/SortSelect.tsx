"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams?.toString());
    if (e.target.value === "default") params.delete("sort");
    else params.set("sort", e.target.value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <label className="shop-sort">
      Sort
      <select value={value} onChange={onChange}>
        <option value="default">Featured</option>
        <option value="az">Name A–Z</option>
      </select>
    </label>
  );
}
