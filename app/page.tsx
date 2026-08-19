"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lead = { id: number; name: string; phone: string; service: string; packageName: string; area: string; address: string; timeSlot: string; paymentMode: string; problem: string; status: string; assignedVendor: string; customerRating: number };
type Vendor = { id: number; businessName: string; phone: string; service: string; areas: string; status: string; rating: number };

const services = ["AC Repair", "RO Service", "Laptop Repair", "Mobile Repair", "Electrician", "Plumber", "Home Cleaning", "CCTV Install"];
const areas = ["Rohini", "Dwarka", "Laxmi Nagar", "Karol Bagh", "Janakpuri", "Pitampura", "Saket", "Mayur Vihar", "Vasant Kunj", "Noida/Delhi NCR"];
const statuses = ["New", "Assigned", "Accepted", "On the way", "Completed", "Cancelled"];
const packages = ["Basic Visit - Rs 199", "Standard Service - Rs 499", "Deep Service - Rs 899", "Inspection first"];
const slots = ["Anytime today", "Today 10 AM - 1 PM", "Today 2 PM - 5 PM", "Tomorrow 10 AM - 1 PM", "Tomorrow 2 PM - 5 PM"];
const payments = ["Cash after service", "UPI after service", "Online payment later"];
const serviceCards = [
  ["AC Repair", "Cooling, gas refill, service", "30-60 min"],
  ["RO Service", "Filter, leakage, installation", "45-90 min"],
  ["Laptop Repair", "Diagnosis and doorstep pickup", "Same day"],
  ["Electrician", "Switches, wiring, MCB", "30-90 min"],
  ["Plumber", "Leakage, tap, bathroom repair", "30-90 min"],
  ["Home Cleaning", "Deep cleaning and move-in", "Scheduled"],
  ["CCTV Install", "Camera setup and visit", "Site visit"],
  ["Mobile Repair", "Screen, battery, software", "Same day"],
];

const seedLeads: Lead[] = [
  { id: 1001, name: "Demo Customer", phone: "9999999999", service: "AC Repair", packageName: "Standard Service - Rs 499", area: "Rohini", address: "Sector 7, Rohini", timeSlot: "Today 2 PM - 5 PM", paymentMode: "UPI after service", problem: "Cooling kam hai", status: "New", assignedVendor: "Auto match ready", customerRating: 0 },
  { id: 1002, name: "Sample Lead", phone: "8888888888", service: "RO Service", packageName: "Basic Visit - Rs 199", area: "Dwarka", address: "Sector 12, Dwarka", timeSlot: "Tomorrow 10 AM - 1 PM", paymentMode: "Cash after service", problem: "Filter change", status: "Assigned", assignedVendor: "AquaFix Delhi", customerRating: 0 },
];
const seedVendors: Vendor[] = [
  { id: 201, businessName: "AquaFix Delhi", phone: "9876543210", service: "RO Service", areas: "Dwarka, Janakpuri", status: "Verified", rating: 46 },
  { id: 202, businessName: "CoolCare Experts", phone: "9876500000", service: "AC Repair", areas: "Rohini, Pitampura", status: "Verified", rating: 48 },
];

export default function Home() {
  const [selectedService, setSelectedService] = useState("AC Repair");
  const [selectedArea, setSelectedArea] = useState("Rohini");
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [vendors, setVendors] = useState<Vendor[]>(seedVendors);
  const [notice, setNotice] = useState("System ready. Lead ya vendor submit karo.");
  const [adminOpen, setAdminOpen] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [trackingPhone, setTrackingPhone] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");

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
    loadData().catch(() => setNotice("Database connect nahi hua, demo data visible hai."));
  }, []);

  const matchedVendor = useMemo(() => {
    const area = selectedArea.toLowerCase();
    return vendors.find((vendor) => vendor.service === selectedService && vendor.areas.toLowerCase().includes(area)) ?? vendors.find((vendor) => vendor.service === selectedService);
  }, [selectedArea, selectedService, vendors]);

  const metrics = [
    ["Leads", leads.length],
    ["Vendors", vendors.length],
    ["Active", leads.filter((lead) => lead.status !== "Cancelled").length],
    ["Completed", leads.filter((lead) => lead.status === "Completed").length],
  ];
  const filteredServices = serviceCards.filter(([name, copy]) => `${name} ${copy}`.toLowerCase().includes(serviceQuery.toLowerCase()));
  const trackedBookings = leads.filter((lead) => trackingPhone && lead.phone.includes(trackingPhone.trim()));
  const vendorProfile = vendors.find((vendor) => vendor.phone.includes(vendorPhone.trim()));
  const vendorJobs = vendorPhone
    ? leads.filter((lead) => {
        if (!vendorProfile) return false;
        return lead.service === vendorProfile.service && (lead.assignedVendor === vendorProfile.businessName || lead.assignedVendor === "Auto match ready");
      })
    : [];

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      service: selectedService,
      packageName: String(form.get("packageName") ?? ""),
      area: selectedArea,
      address: String(form.get("address") ?? ""),
      timeSlot: String(form.get("timeSlot") ?? ""),
      paymentMode: String(form.get("paymentMode") ?? ""),
      problem: String(form.get("problem") ?? ""),
    };
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) return setNotice("Lead save nahi hui. Thodi der baad try karo.");
    const data = await response.json();
    setLeads((current) => [data.lead, ...current.filter((lead) => lead.id < 1000)]);
    setNotice(`Lead saved. Suggested vendor: ${matchedVendor?.businessName ?? "Auto match ready"}.`);
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
    if (!response.ok) return setNotice("Vendor save nahi hua. Thodi der baad try karo.");
    const data = await response.json();
    setVendors((current) => [data.vendor, ...current.filter((vendor) => vendor.id < 200)]);
    setNotice("Vendor pilot network me add ho gaya.");
    event.currentTarget.reset();
  }

  async function updateLead(lead: Lead, status: string, customerRating = 0, vendorName?: string) {
    const assignedVendor = vendorName ?? matchedVendor?.businessName ?? lead.assignedVendor;
    const response = await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status, assignedVendor, customerRating }) });
    if (response.ok) {
      const data = await response.json();
      setLeads((current) => current.map((item) => (item.id === lead.id ? data.lead : item)));
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#161816]">
      <header className="sticky top-0 z-30 border-b border-[#dfe4dc] bg-[#f7f8f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="Delhi Service Network">
            <span className="grid h-10 w-10 place-items-center rounded bg-[#0d4f3c] font-black text-white">DS</span>
            <span><strong className="block text-sm uppercase">Delhi Service Network</strong><span className="block text-xs text-[#637067]">Local service lead platform</span></span>
          </a>
          <nav className="hidden gap-5 text-sm font-bold text-[#4c574e] md:flex"><a href="#services">Services</a><a href="#book">Book</a><a href="#vendors">Vendors</a><a href="#admin">Admin</a></nav>
          <a href="#book" className="rounded bg-[#f29d35] px-4 py-2 text-sm font-black text-[#17120b]">Book Now</a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden border-b border-[#dfe4dc]">
        <img src="/hero-service-network.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f8f5] via-[#f7f8f5]/90 to-[#f7f8f5]/20" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Delhi NCR doorstep services</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Service chahiye? Verified vendor jaldi connect hoga.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4d5a51]">Customer request submit karta hai, system service aur area ke hisaab se vendor suggest karta hai, aur admin dashboard par pura lead status track hota hai.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href="#book" className="rounded bg-[#0d4f3c] px-5 py-3 text-center font-black text-white">Book Service</a><a href="#vendors" className="rounded border border-[#0d4f3c] bg-white/80 px-5 py-3 text-center font-black text-[#0d4f3c]">Join as Vendor</a></div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">{["30 min response", "Verified vendors", "Service warranty"].map((item) => <div className="border-l-4 border-[#f29d35] bg-white/90 p-3" key={item}><p className="text-sm font-black">{item}</p></div>)}</div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfe4dc] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-4 sm:px-6">
          {["Choose package", "Pick slot", "Vendor accepts", "Track & rate"].map((step, index) => <div className="rounded border border-[#dfe4dc] p-4" key={step}><p className="text-sm font-black text-[#f29d35]">Step {index + 1}</p><h3 className="mt-2 font-black">{step}</h3></div>)}
        </div>
      </section>

      <section id="book" className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Customer booking</p><h2 className="mt-2 text-3xl font-black">Lead database me save hoti hai</h2><p className="mt-4 leading-7 text-[#4d5a51]">Customer ko sirf service, area, phone aur problem dena hai. Pilot phase me pricing final vendor call ke baad confirm hogi.</p></div>
        <form onSubmit={submitLead} className="grid gap-4 bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]">
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Service<select className="rounded border border-[#ccd5ce] bg-white p-3" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>{services.map((service) => <option key={service}>{service}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Package<select name="packageName" className="rounded border border-[#ccd5ce] bg-white p-3">{packages.map((item) => <option key={item}>{item}</option>)}</select></label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Area<select className="rounded border border-[#ccd5ce] bg-white p-3" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Time slot<select name="timeSlot" className="rounded border border-[#ccd5ce] bg-white p-3">{slots.map((slot) => <option key={slot}>{slot}</option>)}</select></label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Name<input name="name" className="rounded border border-[#ccd5ce] p-3" required placeholder="Customer name" /></label><label className="grid gap-2 text-sm font-bold">Phone<input name="phone" className="rounded border border-[#ccd5ce] p-3" required placeholder="10 digit mobile" /></label></div>
          <label className="grid gap-2 text-sm font-bold">Full address<input name="address" className="rounded border border-[#ccd5ce] p-3" required placeholder="House no, street, landmark" /></label>
          <label className="grid gap-2 text-sm font-bold">Payment mode<select name="paymentMode" className="rounded border border-[#ccd5ce] bg-white p-3">{payments.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-bold">Problem<textarea name="problem" className="min-h-24 rounded border border-[#ccd5ce] p-3" placeholder="Problem short me likho" /></label>
          <button className="rounded bg-[#0d4f3c] px-5 py-3 font-black text-white">Submit Lead</button>
          <p className="rounded bg-[#eef3ec] p-3 text-sm text-[#4d5a51]">{notice}</p>
        </form>
      </section>

      <section id="services" className="border-y border-[#dfe4dc] bg-[#eef3ec]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Services</p><h2 className="mt-2 text-3xl font-black">High-demand categories for Delhi</h2></div><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} className="rounded border border-[#ccd5ce] bg-white p-3 sm:w-72" placeholder="Search service" /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{filteredServices.map(([name, copy, time]) => <button key={name} onClick={() => setSelectedService(name)} className="min-h-40 rounded border border-[#dfe4dc] bg-white p-4 text-left hover:border-[#0d4f3c]"><p className="text-xs font-black uppercase text-[#f29d35]">{time}</p><h3 className="mt-3 text-xl font-black">{name}</h3><p className="mt-2 text-sm leading-6 text-[#637067]">{copy}</p><p className="mt-4 text-sm font-black text-[#0d4f3c]">View packages</p></button>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded border border-[#dfe4dc] bg-white p-5"><p className="text-sm font-black uppercase text-[#f29d35]">Trust</p><h3 className="mt-2 text-2xl font-black">Verified professional network</h3><p className="mt-3 leading-7 text-[#637067]">KYC, skill check, area mapping, rating aur warning system se vendor quality maintain hoti hai.</p></div>
          <div className="rounded border border-[#dfe4dc] bg-white p-5"><p className="text-sm font-black uppercase text-[#f29d35]">Warranty</p><h3 className="mt-2 text-2xl font-black">7-day service support</h3><p className="mt-3 leading-7 text-[#637067]">Pilot ke liye clear complaint window rakho, taki customer trust build ho aur repeat booking aaye.</p></div>
          <div className="rounded border border-[#dfe4dc] bg-white p-5"><p className="text-sm font-black uppercase text-[#f29d35]">Quotes</p><h3 className="mt-2 text-2xl font-black">Best vendor shortlist</h3><p className="mt-3 leading-7 text-[#637067]">Admin same lead ko 2-3 vendors se compare karke reliable vendor assign kar sakta hai.</p></div>
        </div>
      </section>

      <section className="border-y border-[#dfe4dc] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
          <div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Before technician arrives</p><h2 className="mt-2 text-3xl font-black">Customer ko clear preparation list</h2><p className="mt-4 leading-7 text-[#4d5a51]">Booking ke baad customer ko batao kya ready rakhna hai. Isse cancellations kam aur service speed better hoti hai.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{["Working plug point", "Ladder or stool", "Clear access area", "Issue photo optional"].map((item) => <div key={item} className="rounded border border-[#dfe4dc] bg-[#f7f8f5] p-4 font-black">{item}</div>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div className="rounded border border-[#dfe4dc] bg-white p-5">
          <p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Customer side</p>
          <h2 className="mt-2 text-3xl font-black">Track your booking</h2>
          <p className="mt-3 leading-7 text-[#637067]">Customer apna mobile number dal kar booking ka status, vendor aur slot dekh sakta hai.</p>
          <input value={trackingPhone} onChange={(event) => setTrackingPhone(event.target.value)} className="mt-5 w-full rounded border border-[#ccd5ce] p-3" placeholder="Enter phone number" />
          <div className="mt-4 grid gap-3">
            {(trackedBookings.length ? trackedBookings : seedLeads.slice(0, 1)).map((lead) => <div key={lead.id} className="rounded bg-[#f7f8f5] p-4"><div className="flex items-center justify-between gap-3"><strong>{lead.service}</strong><span className="rounded bg-[#0d4f3c] px-3 py-1 text-xs font-black text-white">{lead.status}</span></div><p className="mt-2 text-sm text-[#637067]">{lead.packageName} - {lead.timeSlot}</p><p className="text-sm text-[#637067]">Vendor: {lead.assignedVendor}</p></div>)}
          </div>
        </div>

        <div className="rounded border border-[#dfe4dc] bg-white p-5">
          <p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Vendor side</p>
          <h2 className="mt-2 text-3xl font-black">Accept and manage leads</h2>
          <p className="mt-3 leading-7 text-[#637067]">Vendor WhatsApp number se apne matching leads dekh sakta hai aur accept/reject kar sakta hai.</p>
          <input value={vendorPhone} onChange={(event) => setVendorPhone(event.target.value)} className="mt-5 w-full rounded border border-[#ccd5ce] p-3" placeholder="Vendor phone, try 9876500000" />
          <div className="mt-4 grid gap-3">
            {(vendorJobs.length ? vendorJobs : seedLeads.slice(0, 1)).map((lead) => <div key={lead.id} className="rounded bg-[#f7f8f5] p-4"><div className="flex items-center justify-between gap-3"><strong>{lead.service}</strong><span className="text-sm font-bold text-[#637067]">{lead.area}</span></div><p className="mt-2 text-sm text-[#637067]">{lead.packageName} - {lead.timeSlot}</p><p className="text-sm text-[#637067]">{lead.problem || "Customer details after accept"}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => updateLead(lead, "Accepted", 0, vendorProfile?.businessName)} className="rounded bg-[#0d4f3c] px-4 py-2 text-sm font-black text-white">Accept</button><button onClick={() => updateLead(lead, "On the way", 0, vendorProfile?.businessName)} className="rounded bg-[#eef3ec] px-4 py-2 text-sm font-black text-[#0d4f3c]">On the way</button><button onClick={() => updateLead(lead, "Cancelled", 0, vendorProfile?.businessName)} className="rounded bg-[#fff4df] px-4 py-2 text-sm font-black text-[#8a4d00]">Reject</button></div></div>)}
          </div>
        </div>
      </section>

      <section id="vendors" className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Vendor pilot</p><h2 className="mt-2 text-3xl font-black">Abhi commission zero, performance tracking on</h2><p className="mt-4 leading-7 text-[#4d5a51]">Vendor ko free leads milengi. Admin response time, completed jobs aur customer satisfaction dekh kar best vendors shortlist karega.</p></div>
        <form onSubmit={submitVendor} className="grid gap-4 bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]">
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Business name<input name="businessName" className="rounded border border-[#ccd5ce] p-3" required placeholder="Vendor/company" /></label><label className="grid gap-2 text-sm font-bold">WhatsApp<input name="vendorPhone" className="rounded border border-[#ccd5ce] p-3" required placeholder="Mobile number" /></label></div>
          <label className="grid gap-2 text-sm font-bold">Service<select name="vendorService" className="rounded border border-[#ccd5ce] bg-white p-3">{services.map((service) => <option key={service}>{service}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-bold">Areas served<input name="areas" className="rounded border border-[#ccd5ce] p-3" required placeholder="Rohini, Pitampura, Dwarka" /></label>
          <button className="rounded bg-[#f29d35] px-5 py-3 font-black text-[#17120b]">Add Vendor</button>
        </form>
      </section>

      <section id="admin" className="border-t border-[#dfe4dc] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Admin operations</p><h2 className="mt-2 text-3xl font-black">Lead tracking dashboard</h2></div><button onClick={() => setAdminOpen((value) => !value)} className="rounded bg-[#161816] px-5 py-3 font-black text-white">{adminOpen ? "Hide Admin" : "Open Admin"}</button></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">{metrics.map(([label, value]) => <div className="rounded border border-[#dfe4dc] p-4" key={label}><p className="text-3xl font-black">{value}</p><p className="text-sm font-bold text-[#637067]">{label}</p></div>)}</div>
          {adminOpen && <div className="mt-5 overflow-hidden rounded border border-[#dfe4dc]">{leads.map((lead) => <div key={lead.id} className="grid gap-3 border-b border-[#edf0eb] p-4 text-sm last:border-0 lg:grid-cols-[1.1fr_1.1fr_0.9fr_1.4fr]"><div><strong>{lead.service}</strong><p className="text-[#637067]">{lead.name} - {lead.phone}</p><p className="text-[#637067]">{lead.packageName}</p></div><div><p className="font-bold">{lead.area}</p><p className="text-[#637067]">{lead.address}</p><p className="text-[#637067]">{lead.timeSlot}</p></div><div><p className="font-bold">{lead.assignedVendor}</p><p className="text-[#637067]">{lead.paymentMode}</p><p className="text-[#637067]">Rating: {lead.customerRating || "Pending"}</p></div><div className="flex flex-wrap gap-2">{statuses.map((status) => <button key={status} onClick={() => updateLead(lead, status)} className={`rounded px-3 py-2 text-xs font-black ${lead.status === status ? "bg-[#0d4f3c] text-white" : "bg-[#eef3ec] text-[#0d4f3c]"}`}>{status}</button>)}{[1, 2, 3, 4, 5].map((rating) => <button key={rating} onClick={() => updateLead(lead, "Completed", rating)} className="rounded bg-[#fff4df] px-3 py-2 text-xs font-black text-[#8a4d00]">{rating} star</button>)}</div></div>)}</div>}
          {adminOpen && <div className="mt-5 grid gap-3 lg:grid-cols-2">{vendors.map((vendor) => <div key={vendor.id} className="rounded border border-[#dfe4dc] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{vendor.businessName}</h3><p className="text-sm text-[#637067]">{vendor.service} - {vendor.areas}</p></div><span className="rounded bg-[#e8f3ee] px-3 py-1 text-xs font-black text-[#0d4f3c]">{vendor.status}</span></div><p className="mt-3 text-sm font-bold">WhatsApp: {vendor.phone}</p></div>)}</div>}
        </div>
      </section>
    </main>
  );
}
