"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  parentId: number | null;
  vertical: "SHOP" | "SERVICES" | "LOCAL";
  kind: "CATEGORY" | "SUBCATEGORY";
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
};

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("Create categories without changing source code.");
  const [vertical, setVertical] = useState<Category["vertical"]>("SERVICES");

  async function loadCategories() {
    const response = await fetch("/api/admin/categories");
    if (!response.ok) return setMessage("Categories load nahi hui.");
    const data = await response.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time admin category fetch after unlock
    loadCategories().catch(() => setMessage("Categories load nahi hui."));
  }, []);

  const parents = useMemo(() => categories.filter((category) => category.vertical === vertical && category.parentId === null), [categories, vertical]);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        slug: data.get("slug"),
        vertical,
        kind: data.get("parentId") ? "SUBCATEGORY" : "CATEGORY",
        parentId: data.get("parentId") || null,
        description: data.get("description"),
        displayOrder: Number(data.get("displayOrder") || 0),
        isFeatured: data.get("isFeatured") === "on",
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(result.error ?? "Category create nahi hui.");
    setCategories((current) => [...current, result.category]);
    setMessage(`${result.category.name} category created.`);
    form.reset();
  }

  async function toggleCategory(category: Category) {
    const response = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...category, isActive: !category.isActive }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(result.error ?? "Category update nahi hui.");
    setCategories((current) => current.map((item) => item.id === category.id ? result.category : item));
    setMessage(`${result.category.name} ${result.category.isActive ? "active" : "paused"}.`);
  }

  return (
    <section className="mt-8 border-y border-[#dfe4dc] bg-white py-6">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-sm font-black uppercase text-[#0d4f3c]">Marketplace configuration</p>
          <h2 className="mt-2 text-2xl font-black">Category engine</h2>
          <p className="mt-3 leading-7 text-[#637067]">Shop, Services aur Local ke liye category ya subcategory create karo. Nayi category ke liye developer change nahi chahiye.</p>
          <p className="mt-4 bg-[#eef3ec] p-3 text-sm font-bold text-[#4d5a51]">{message}</p>
        </div>
        <form onSubmit={createCategory} className="grid gap-3 border border-[#dfe4dc] p-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">Vertical<select value={vertical} onChange={(event) => setVertical(event.target.value as Category["vertical"])} className="border border-[#ccd5ce] bg-white p-3"><option value="SHOP">Shop</option><option value="SERVICES">Services</option><option value="LOCAL">Local</option></select></label>
          <label className="grid gap-2 text-sm font-bold">Parent<select name="parentId" className="border border-[#ccd5ce] bg-white p-3"><option value="">Root category</option>{parents.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-bold">Name<input name="name" required maxLength={80} className="border border-[#ccd5ce] p-3" placeholder="Electronics" /></label>
          <label className="grid gap-2 text-sm font-bold">Slug<input name="slug" maxLength={80} className="border border-[#ccd5ce] p-3" placeholder="electronics (auto if blank)" /></label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">Description<input name="description" maxLength={400} className="border border-[#ccd5ce] p-3" placeholder="Short customer-facing description" /></label>
          <label className="grid gap-2 text-sm font-bold">Display order<input name="displayOrder" type="number" min="0" defaultValue="0" className="border border-[#ccd5ce] p-3" /></label>
          <label className="flex items-center gap-3 border border-[#dfe4dc] p-3 text-sm font-bold"><input name="isFeatured" type="checkbox" /> Featured</label>
          <button className="bg-[#0d4f3c] px-5 py-3 font-black text-white sm:col-span-2">Create Category</button>
        </form>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between gap-3 border border-[#dfe4dc] p-4">
            <div><p className="text-xs font-black text-[#637067]">{category.vertical} · {category.parentId ? "SUBCATEGORY" : "CATEGORY"}</p><h3 className="mt-1 font-black">{category.name}</h3><p className="text-sm text-[#637067]">/{category.slug}</p></div>
            <button onClick={() => toggleCategory(category)} className={`px-3 py-2 text-xs font-black ${category.isActive ? "bg-[#e8f3ee] text-[#0d4f3c]" : "bg-[#f1e8e4] text-[#7b2d16]"}`}>{category.isActive ? "Active" : "Paused"}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
