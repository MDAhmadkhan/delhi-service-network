"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = { id: number; name: string; phone: string; service: string; packageName: string; area: string; address: string; timeSlot: string; paymentMode: string; problem: string; status: string; assignedVendor: string; customerRating: number };
type Vendor = { id: number; businessName: string; phone: string; service: string; areas: string; status: string; rating: number };

const adminPin = "7860";
const statuses = ["New", "Assigned", "Accepted", "On the way", "Completed", "Cancelled"];
const services = [
  "AC Repair", "RO Service", "Laptop Repair", "Mobile Repair", "Electrician", "Plumber", "Home Cleaning", "CCTV Install",
  "Washing Machine Repair", "Refrigerator Repair", "Microwave Repair", "Geyser Repair", "Chimney Repair", "Inverter Battery",
  "Fan Cooler Repair", "TV Repair", "Carpenter", "Painter", "Mason Tiles Repair", "False Ceiling", "Door Lock Repair",
  "Furniture Assembly", "Waterproofing", "Sofa Bed Repair", "Bathroom Cleaning", "Kitchen Cleaning", "Sofa Cleaning",
  "Carpet Cleaning", "Water Tank Cleaning", "Car Cleaning", "Move In Out Cleaning", "Salon At Home", "Haircut At Home",
  "Makeup Artist", "Massage At Home", "Mehendi Artist", "Fitness Trainer", "Yoga Trainer", "Office Cleaning",
  "Laptop Desktop AMC", "Printer Repair", "Networking WiFi Setup", "Biometric Attendance", "Website Digital Marketing",
  "Photographer", "Videographer", "DJ Service", "Decoration", "Catering", "Birthday Planner", "Wedding Makeup",
  "Tent Lighting", "Packers Movers", "Tempo Mini Truck", "Driver On Demand", "Furniture Rental", "Appliance Rental",
  "Property Rental Leads", "Home Tutor", "Computer Classes", "Spoken English", "Tuition Coaching Inquiry", "Music Dance Teacher",
  "Career Counseling",
];
const checklist = ["Call new lead in 10 min", "Assign best matching vendor", "Confirm price and slot", "Update live status", "Record rating"];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("Secure admin login required.");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");

  async function loadData() {
    const [leadResponse, vendorResponse] = await Promise.all([fetch("/api/leads"), fetch("/api/vendors")]);
    if (leadResponse.ok) {
      const data = await leadResponse.json();
      setLeads(data.leads ?? []);
    }
    if (vendorResponse.ok) {
      const data = await vendorResponse.json();
      setVendors(data.vendors ?? []);
    }
  }

  useEffect(() => {
    if (unlocked) loadData().catch(() => setMessage("Data load nahi hua. Refresh karke try karo."));
  }, [unlocked]);

  const visibleLeads = useMemo(() => {
    return leads.filter((lead) => {
      const term = query.trim().toLowerCase();
      const text = `${lead.name} ${lead.phone} ${lead.service} ${lead.area} ${lead.assignedVendor} ${lead.problem}`.toLowerCase();
      return (!term || text.includes(term)) && (statusFilter === "All" || lead.status === statusFilter) && (serviceFilter === "All" || lead.service === serviceFilter);
    });
  }, [leads, query, serviceFilter, statusFilter]);

  const metrics = [
    ["Total leads", leads.length],
    ["Vendors", vendors.length],
    ["Needs assign", leads.filter((lead) => lead.status === "New" || lead.assignedVendor === "Auto match ready").length],
    ["Active", leads.filter((lead) => !["Completed", "Cancelled"].includes(lead.status)).length],
    ["Completed", leads.filter((lead) => lead.status === "Completed").length],
    ["Cancelled", leads.filter((lead) => lead.status === "Cancelled").length],
  ];

  function login() {
    if (pin === adminPin) {
      setUnlocked(true);
      setMessage("Admin unlocked. Lead command center ready.");
    } else {
      setMessage("Wrong PIN. Access denied.");
    }
  }

  async function updateLead(lead: Lead, status: string, customerRating = lead.customerRating, assignedVendor = lead.assignedVendor) {
    const response = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status, customerRating, assignedVendor }),
    });
    if (!response.ok) return setMessage("Lead update nahi hua.");
    const data = await response.json();
    setLeads((current) => current.map((item) => (item.id === lead.id ? data.lead : item)));
    setMessage(`Lead #${lead.id} updated.`);
  }

  function exportCsv() {
    const headers = ["id", "name", "phone", "service", "area", "status", "vendor", "slot", "payment", "rating"];
    const rows = visibleLeads.map((lead) => [lead.id, lead.name, lead.phone, lead.service, lead.area, lead.status, lead.assignedVendor, lead.timeSlot, lead.paymentMode, lead.customerRating || "Pending"]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "delhi-service-network-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`${visibleLeads.length} leads exported.`);
  }

  async function copySummary(lead: Lead) {
    const summary = `Lead #${lead.id}\nName: ${lead.name}\nPhone: ${lead.phone}\nService: ${lead.service}\nArea: ${lead.area}\nSlot: ${lead.timeSlot}\nAddress: ${lead.address}\nProblem: ${lead.problem || "Not provided"}\nVendor: ${lead.assignedVendor}\nStatus: ${lead.status}`;
    await navigator.clipboard?.writeText(summary);
    setMessage(`Lead #${lead.id} summary copied.`);
  }

  return (
    <main className="min-h-screen bg-[#f3f5f1] text-[#161816]">
      <header className="border-b border-[#dfe4dc] bg-[#101411] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded bg-[#f29d35] font-black text-[#17120b]">DS</span>
            <span><strong className="block">Delhi Service Network</strong><span className="text-xs text-white/60">Private admin panel</span></span>
          </a>
          <a href="/" className="rounded border border-white/20 px-4 py-2 text-sm font-black">Back to Website</a>
        </div>
      </header>

      {!unlocked ? (
        <section className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4">
          <div className="w-full rounded border border-[#dfe4dc] bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Secure access</p>
            <h1 className="mt-2 text-3xl font-black">Admin Login</h1>
            <p className="mt-3 text-sm leading-6 text-[#637067]">Ye panel public website se alag hai. PIN ke bina leads, vendors, export aur assignment tools hidden rahenge.</p>
            <input value={pin} onChange={(event) => setPin(event.target.value)} onKeyDown={(event) => event.key === "Enter" && login()} className="mt-5 w-full rounded border border-[#ccd5ce] p-3" placeholder="Admin PIN" type="password" />
            <button onClick={login} className="mt-3 w-full rounded bg-[#0d4f3c] px-5 py-3 font-black text-white">Open Admin</button>
            <p className="mt-3 rounded bg-[#eef3ec] p-3 text-sm font-bold text-[#4d5a51]">{message}</p>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Operations</p><h1 className="mt-2 text-4xl font-black">Lead Command Center</h1><p className="mt-3 max-w-2xl leading-7 text-[#637067]">Search, assign, call, WhatsApp, update status, rate and export all leads from one private workspace.</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={loadData} className="rounded bg-[#161816] px-4 py-3 text-sm font-black text-white">Refresh</button><button onClick={exportCsv} className="rounded bg-[#0d4f3c] px-4 py-3 text-sm font-black text-white">Export CSV</button><button onClick={() => { setUnlocked(false); setPin(""); setMessage("Admin locked."); }} className="rounded border border-[#161816] px-4 py-3 text-sm font-black">Lock</button></div>
          </div>
          <p className="mt-4 rounded bg-[#eef3ec] p-3 text-sm font-bold text-[#4d5a51]">{message}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{metrics.map(([label, value]) => <div key={label} className="rounded border border-[#dfe4dc] bg-white p-4"><p className="text-3xl font-black">{value}</p><p className="text-sm font-bold text-[#637067]">{label}</p></div>)}</div>
          <div className="mt-5 grid gap-3 rounded bg-white p-4 ring-1 ring-[#dfe4dc] sm:grid-cols-5">{checklist.map((item) => <div key={item} className="rounded bg-[#f7f8f5] p-3 text-sm font-black">{item}</div>)}</div>

          <div className="mt-5 grid gap-3 rounded border border-[#dfe4dc] bg-white p-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="rounded border border-[#ccd5ce] p-3" placeholder="Search name, phone, service, area, vendor" />
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="rounded border border-[#ccd5ce] bg-white p-3"><option>All</option>{services.map((service) => <option key={service}>{service}</option>)}</select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded border border-[#ccd5ce] bg-white p-3"><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
          </div>

          <div className="mt-5 grid gap-4">
            {visibleLeads.length === 0 && <p className="rounded border border-[#dfe4dc] bg-white p-4 text-sm font-bold text-[#637067]">No leads found.</p>}
            {visibleLeads.map((lead) => {
              const serviceVendors = vendors.filter((vendor) => vendor.service === lead.service);
              const waText = encodeURIComponent(`Delhi Service Network: ${lead.service} lead\nName: ${lead.name}\nArea: ${lead.area}\nSlot: ${lead.timeSlot}\nProblem: ${lead.problem || "Not provided"}`);
              return (
                <div key={lead.id} className="rounded border border-[#dfe4dc] bg-white p-4 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr_1fr]">
                    <div><div className="flex flex-wrap gap-2"><span className="rounded bg-[#0d4f3c] px-3 py-1 text-xs font-black text-white">#{lead.id}</span><span className="rounded bg-[#eef3ec] px-3 py-1 text-xs font-black text-[#0d4f3c]">{lead.status}</span></div><h2 className="mt-3 text-xl font-black">{lead.service}</h2><p className="mt-1 text-sm font-bold text-[#637067]">{lead.name} - {lead.phone}</p><p className="text-sm text-[#637067]">{lead.packageName}</p></div>
                    <div><p className="font-black">{lead.area}</p><p className="mt-1 text-sm text-[#637067]">{lead.address}</p><p className="mt-1 text-sm text-[#637067]">{lead.timeSlot}</p><p className="mt-1 text-sm text-[#637067]">{lead.paymentMode}</p></div>
                    <div><p className="text-sm font-black">Problem</p><p className="mt-1 text-sm leading-6 text-[#637067]">{lead.problem || "Not provided"}</p><p className="mt-2 text-sm font-bold text-[#637067]">Rating: {lead.customerRating || "Pending"}</p></div>
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-[#edf0eb] pt-4 lg:grid-cols-[1fr_1.2fr]">
                    <label className="grid gap-2 text-sm font-bold">Assign vendor<select value={lead.assignedVendor} onChange={(event) => updateLead(lead, event.target.value === "Auto match ready" ? "New" : "Assigned", lead.customerRating, event.target.value)} className="rounded border border-[#ccd5ce] bg-white p-3"><option>Auto match ready</option>{serviceVendors.map((vendor) => <option key={vendor.id}>{vendor.businessName}</option>)}{!serviceVendors.length && <option disabled>No vendor for this service</option>}</select></label>
                    <div className="flex flex-wrap items-end gap-2"><a href={`tel:${lead.phone}`} className="rounded bg-[#161816] px-4 py-3 text-sm font-black text-white">Call customer</a><a href={`https://wa.me/91${lead.phone}?text=${waText}`} target="_blank" rel="noreferrer" className="rounded bg-[#0d4f3c] px-4 py-3 text-sm font-black text-white">WhatsApp</a><button onClick={() => copySummary(lead)} className="rounded bg-[#eef3ec] px-4 py-3 text-sm font-black text-[#0d4f3c]">Copy summary</button></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">{statuses.map((status) => <button key={status} onClick={() => updateLead(lead, status)} className={`rounded px-3 py-2 text-xs font-black ${lead.status === status ? "bg-[#0d4f3c] text-white" : "bg-[#eef3ec] text-[#0d4f3c]"}`}>{status}</button>)}{[1, 2, 3, 4, 5].map((rating) => <button key={rating} onClick={() => updateLead(lead, "Completed", rating)} className="rounded bg-[#fff4df] px-3 py-2 text-xs font-black text-[#8a4d00]">{rating} star</button>)}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Vendor directory</p><h2 className="mt-1 text-2xl font-black">Registered vendors</h2></div><p className="text-sm font-bold text-[#637067]">{vendors.length} vendors</p></div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">{vendors.map((vendor) => <div key={vendor.id} className="rounded border border-[#dfe4dc] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{vendor.businessName}</h3><p className="text-sm text-[#637067]">{vendor.service} - {vendor.areas}</p></div><span className="rounded bg-[#e8f3ee] px-3 py-1 text-xs font-black text-[#0d4f3c]">{vendor.status}</span></div><div className="mt-3 flex flex-wrap gap-2"><a href={`tel:${vendor.phone}`} className="rounded bg-[#161816] px-3 py-2 text-xs font-black text-white">Call</a><a href={`https://wa.me/91${vendor.phone}`} target="_blank" rel="noreferrer" className="rounded bg-[#0d4f3c] px-3 py-2 text-xs font-black text-white">WhatsApp</a><span className="rounded bg-[#f7f8f5] px-3 py-2 text-xs font-black text-[#637067]">Rating {vendor.rating / 10}/5</span></div></div>)}</div>
          </div>
        </section>
      )}
    </main>
  );
}
