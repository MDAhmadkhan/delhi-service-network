"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  name: string;
  phone: string;
  service: string;
  area: string;
  problem: string;
  status: string;
  assignedVendor: string;
};

type Vendor = {
  id: number;
  businessName: string;
  phone: string;
  service: string;
  areas: string;
  status: string;
  rating: number;
};

const services = [
  { name: "AC Repair", time: "30-60 min", demand: "High", price: "Starts Rs 299" },
  { name: "RO Service", time: "45-90 min", demand: "High", price: "Starts Rs 249" },
  { name: "Laptop Repair", time: "Same day", demand: "Medium", price: "Inspection first" },
  { name: "Mobile Repair", time: "Same day", demand: "High", price: "Inspection first" },
  { name: "Electrician", time: "30-90 min", demand: "High", price: "Starts Rs 199" },
  { name: "Plumber", time: "30-90 min", demand: "High", price: "Starts Rs 199" },
  { name: "Home Cleaning", time: "Today/Tomorrow", demand: "Medium", price: "Quote after call" },
  { name: "CCTV Install", time: "Site visit", demand: "Medium", price: "Quote after call" },
];

const areas = ["Rohini", "Dwarka", "Laxmi Nagar", "Karol Bagh", "Janakpuri", "Pitampura", "Saket", "Mayur Vihar", "Vasant Kunj", "Noida/Delhi NCR"];
const statuses = ["New", "Assigned", "Contacted", "Completed", "Cancelled"];

const starterLeads: Lead[] = [
  { id: 1001, name: "Demo Customer", phone: "9999999999", service: "AC Repair", area: "Rohini", problem: "Cooling kam hai", status: "New", assignedVendor: "Auto match ready" },
  { id: 1002, name: "Sample Lead", phone: "8888888888", service: "RO Service", area: "Dwarka", problem: "Filter change", status: "Assigned", assignedVendor: "AquaFix Delhi" },
];

const starterVendors: Vendor[] = [
  { id: 201, businessName: "AquaFix Delhi", phone: "9876543210", service: "RO Service", areas: "Dwarka, Janakpuri", status: "Verified", rating: 46 },
  { id: 202, businessName: "CoolCare Experts", phone: "9876500000", service: "AC Repair", areas: "Rohini, Pitampura", status: "Verified", rating: 48 },
];

export default function Home() {
  const [selectedService, setSelectedService] = useState("AC Repair");
  const [selectedArea, setSelectedArea] = useState("Rohini");
  const [leads, setLeads] = useState<Lead[]>(starterLeads);
  const [vendors, setVendors] = useState<Vendor[]>(starterVendors);
  const [notice, setNotice] = useState("System ready. Customer lead submit karo ya vendor add karo.");

  async function loadData() {
    const [leadResponse, vendorResponse] = await Promise.all([fetch("/api/leads"), fetch("/api/vendors")]);
    if (leadResponse.ok) {
      const data = await leadResponse.json();
      if (data.leads?.length) setLeads(data.leads);
    }
    if (vendorResponse.ok) {
      const data = await vendorResponse.json();
      if (data.vendors?.length) setVendors(data.vendors);
    }
  }

  useEffect(() => {
    loadData().catch(() => setNotice("Preview data visible hai. Live database deploy ke baad active rahega."));
  }, []);

  const activeVendor = useMemo(() => {
    return vendors.find((vendor) => vendor.service === selectedService && vendor.areas.toLowerCase().includes(selectedArea.toLowerCase())) ?? vendors.find((vendor) => vendor.service === selectedService);
  }, [selectedArea, selectedService, vendors]);

  const metrics = [
    `${leads.length} leads`,
    `${vendors.length} vendors`,
    `${Math.round((leads.filter((lead) => lead.status !== "New").length / Math.max(leads.length, 1)) * 100)}% contacted`,
    `${leads.filter((lead) => lead.status === "Completed").length} completed`,
  ];

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      service: selectedService,
      area: selectedArea,
      problem: String(form.get("problem") ?? ""),
    };
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) {
      setNotice("Lead save nahi hui. Database ready hone ke baad try karo.");
      return;
    }
    const data = await response.json();
    setLeads((current) => [data.lead, ...current.filter((lead) => lead.id < 1000)]);
    setNotice(`Lead saved. Suggested vendor: ${activeVendor?.businessName ?? "Auto match ready"}.`);
    event.currentTarget.reset();
  }

  async function submitVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      businessName: String(form.get("businessName") ?? ""),
      phone: String(form.get("vendorPhone") ?? ""),
      service: String(form.get("vendorService") ?? ""),
      areas: String(form.get("areas") ?? ""),
    };
    const response = await fetch("/api/vendors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) {
      setNotice("Vendor save nahi hua. Database ready hone ke baad try karo.");
      return;
    }
    const data = await response.json();
    setVendors((current) => [data.vendor, ...current.filter((vendor) => vendor.id < 200)]);
    setNotice("Vendor pilot network me add ho gaya.");
    event.currentTarget.reset();
  }

  async function updateLead(lead: Lead, status: string) {
    const assignedVendor = activeVendor?.businessName ?? lead.assignedVendor;
    const response = await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status, assignedVendor }) });
    if (response.ok) {
      const data = await response.json();
      setLeads((current) => current.map((item) => (item.id === lead.id ? data.lead : item)));
    } else {
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status, assignedVendor } : item)));
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#161816]">
      <header className="sticky top-0 z-20 border-b border-[#dfe4dc] bg-[#f7f8f5]/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a className="flex items-center gap-3" href="#top" aria-label="Delhi Service Network home">
            <span className="grid h-10 w-10 place-items-center rounded bg-[#0d4f3c] font-bold text-white">DS</span>
            <span><span className="block text-sm font-bold uppercase tracking-wide">Delhi Service Network</span><span className="block text-xs text-[#637067]">Free pilot leads for verified vendors</span></span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-medium text-[#4c574e] md:flex"><a href="#services">Services</a><a href="#book">Book</a><a href="#vendors">Vendors</a><a href="#dashboard">Dashboard</a></nav>
          <a className="rounded bg-[#f29d35] px-4 py-2 text-sm font-bold text-[#17120b]" href="#book">Book Service</a>
        </div>
      </header>

      <section id="top" className="border-b border-[#dfe4dc]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Delhi NCR local services</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Customer lead aayegi, system vendor ko smartly assign karega.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4d5a51]">AC, RO, repair, cleaning, plumbing, electrician aur CCTV services ke liye working lead platform. Pehle trust aur data build karo, monetization baad me add karo.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><a className="rounded bg-[#0d4f3c] px-5 py-3 text-center font-bold text-white" href="#book">Create Customer Lead</a><a className="rounded border border-[#0d4f3c] px-5 py-3 text-center font-bold text-[#0d4f3c]" href="#vendors">Register Vendor</a></div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">{["8 services", "10 Delhi areas", "0% commission pilot"].map((item) => <div className="border-l-4 border-[#f29d35] bg-white p-3" key={item}><p className="text-sm font-bold">{item}</p></div>)}</div>
          </div>

          <div id="book" className="bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]">
            <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-2xl font-black">Book a Service</h2><p className="text-sm text-[#637067]">Customer lead database me save hogi</p></div><span className="rounded bg-[#e8f3ee] px-3 py-1 text-xs font-bold text-[#0d4f3c]">Live Form</span></div>
            <form className="grid gap-4" onSubmit={submitLead}>
              <label className="grid gap-2 text-sm font-bold">Service<select className="rounded border border-[#ccd5ce] bg-white p-3" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>{services.map((service) => <option key={service.name}>{service.name}</option>)}</select></label>
              <label className="grid gap-2 text-sm font-bold">Area<select className="rounded border border-[#ccd5ce] bg-white p-3" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Name<input name="name" className="rounded border border-[#ccd5ce] p-3" placeholder="Customer name" required /></label><label className="grid gap-2 text-sm font-bold">Phone<input name="phone" className="rounded border border-[#ccd5ce] p-3" placeholder="10 digit mobile" required /></label></div>
              <label className="grid gap-2 text-sm font-bold">Problem<textarea name="problem" className="min-h-24 rounded border border-[#ccd5ce] p-3" placeholder="Problem short me likho" /></label>
              <button className="rounded bg-[#0d4f3c] px-5 py-3 font-bold text-white" type="submit">Submit Lead</button>
              <p className="rounded bg-[#f7f8f5] p-3 text-sm text-[#4d5a51]">{notice}</p>
            </form>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Service catalogue</p><h2 className="text-3xl font-black">Professional services ready for lead routing</h2></div><p className="max-w-xl text-sm leading-6 text-[#637067]">Start free pilot with limited categories, then expand after real demand data.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{services.map((service) => <button className="min-h-40 rounded border border-[#dfe4dc] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#0d4f3c]" key={service.name} onClick={() => setSelectedService(service.name)}><span className="text-xs font-bold uppercase tracking-wide text-[#f29d35]">{service.demand} demand</span><h3 className="mt-3 text-xl font-black">{service.name}</h3><p className="mt-2 text-sm text-[#637067]">{service.time}</p><p className="mt-4 text-sm font-bold text-[#0d4f3c]">{service.price}</p></button>)}</div>
      </section>

      <section id="vendors" className="border-y border-[#dfe4dc] bg-[#eef3ec]">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-2">
          <div><p className="text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Vendor network</p><h2 className="mt-2 text-3xl font-black">Verified vendors ko free pilot leads</h2><p className="mt-4 leading-7 text-[#4d5a51]">Pehle 30 days commission nahi. Vendor sirf job status update karega. Tum performance, response time aur customer rating track karoge.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["KYC/proof optional", "Area based matching", "Rating after every job", "Warning and block status"].map((item) => <div className="rounded border border-[#d7dfd8] bg-white p-4 font-bold" key={item}>{item}</div>)}</div></div>
          <form className="grid gap-4 bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]" onSubmit={submitVendor}>
            <h3 className="text-2xl font-black">Join as Vendor</h3>
            <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Business name<input name="businessName" className="rounded border border-[#ccd5ce] p-3" placeholder="Vendor/company" required /></label><label className="grid gap-2 text-sm font-bold">Mobile<input name="vendorPhone" className="rounded border border-[#ccd5ce] p-3" placeholder="WhatsApp number" required /></label></div>
            <label className="grid gap-2 text-sm font-bold">Service category<select name="vendorService" className="rounded border border-[#ccd5ce] bg-white p-3">{services.map((service) => <option key={service.name}>{service.name}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-bold">Areas served<input name="areas" className="rounded border border-[#ccd5ce] p-3" placeholder="Rohini, Pitampura, Dwarka..." required /></label>
            <button className="rounded bg-[#f29d35] px-5 py-3 font-bold text-[#17120b]" type="submit">Add Vendor to Pilot</button>
          </form>
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5"><p className="text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Admin dashboard</p><h2 className="text-3xl font-black">Lead tracking, vendor assignment, performance</h2></div>
        <div className="grid gap-3 sm:grid-cols-4">{metrics.map((metric) => <div className="rounded border border-[#dfe4dc] bg-white p-4" key={metric}><p className="text-2xl font-black">{metric.split(" ")[0]}</p><p className="text-sm font-bold text-[#637067]">{metric.substring(metric.indexOf(" ") + 1)}</p></div>)}</div>
        <div className="mt-5 overflow-hidden rounded border border-[#dfe4dc] bg-white">{leads.map((lead) => <div className="grid gap-3 border-b border-[#edf0eb] p-4 text-sm last:border-b-0 lg:grid-cols-[1fr_0.8fr_1.1fr_1.2fr]" key={lead.id}><div><strong>{lead.service}</strong><p className="text-[#637067]">{lead.name} · {lead.phone}</p></div><span>{lead.area}</span><span>{lead.assignedVendor}</span><div className="flex flex-wrap gap-2">{statuses.map((status) => <button className={`rounded px-3 py-2 text-xs font-bold ${lead.status === status ? "bg-[#0d4f3c] text-white" : "bg-[#eef3ec] text-[#0d4f3c]"}`} key={status} onClick={() => updateLead(lead, status)}>{status}</button>)}</div></div>)}</div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">{vendors.map((vendor) => <div className="rounded border border-[#dfe4dc] bg-white p-4" key={vendor.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{vendor.businessName}</h3><p className="text-sm text-[#637067]">{vendor.service} · {vendor.areas}</p></div><span className="rounded bg-[#e8f3ee] px-3 py-1 text-xs font-bold text-[#0d4f3c]">{vendor.status}</span></div><p className="mt-3 text-sm font-bold">WhatsApp: {vendor.phone}</p></div>)}</div>
      </section>
    </main>
  );
}
