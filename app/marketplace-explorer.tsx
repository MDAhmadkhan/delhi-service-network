"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  parentId: number | null;
  vertical: "SHOP" | "SERVICES" | "LOCAL";
  name: string;
  slug: string;
  description: string;
  isFeatured: boolean;
};

const verticals = [
  { key: "SHOP", label: "Shop", copy: "Products, daily essentials and future categories", accent: "#0d4f3c" },
  { key: "SERVICES", label: "Services", copy: "Book trusted professionals across Delhi NCR", accent: "#b76712" },
  { key: "LOCAL", label: "Local", copy: "Businesses, food, wellness and nearby deals", accent: "#234f78" },
] as const;

export function MarketplaceExplorer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories?parentId=root")
      .then((response) => response.ok ? response.json() : { categories: [] })
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  const grouped = useMemo(() => Object.fromEntries(verticals.map(({ key }) => [key, categories.filter((item) => item.vertical === key)])), [categories]);

  return (
    <section id="marketplace" className="border-b border-[#dfe4dc] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-[#0d4f3c]">One Delhi marketplace</p>
            <h2 className="mt-2 text-3xl font-black">Shop, book services, discover local</h2>
          </div>
          <p className="max-w-xl leading-7 text-[#4d5a51]">Ek search aur category system ke through products, trusted services aur nearby businesses discover karo.</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {verticals.map((vertical) => (
            <article key={vertical.key} className="border border-[#dfe4dc] bg-[#f7f8f5] p-5">
              <div className="h-1.5 w-16" style={{ backgroundColor: vertical.accent }} />
              <h3 className="mt-4 text-2xl font-black">{vertical.label}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#637067]">{vertical.copy}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(grouped[vertical.key] ?? []).slice(0, 6).map((category) => (
                  <span key={category.id} className="border border-[#dfe4dc] bg-white px-3 py-2 text-sm font-bold">{category.name}</span>
                ))}
                {!(grouped[vertical.key] ?? []).length && <span className="text-sm font-bold text-[#637067]">Categories admin se add hongi</span>}
              </div>
              {vertical.key === "SERVICES" ? <a href="#services" className="mt-5 inline-block font-black text-[#0d4f3c]">Browse services</a> : <span className="mt-5 inline-block text-sm font-black text-[#637067]">Foundation ready</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

