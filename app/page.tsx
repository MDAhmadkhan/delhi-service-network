"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lead = { id: number; name: string; phone: string; service: string; packageName: string; area: string; address: string; timeSlot: string; paymentMode: string; problem: string; status: string; assignedVendor: string; customerRating: number };
type Vendor = { id: number; businessName: string; phone: string; service: string; areas: string; status: string; rating: number };

const services = [
  "AC Repair",
  "RO Service",
  "Laptop Repair",
  "Mobile Repair",
  "Electrician",
  "Plumber",
  "Home Cleaning",
  "CCTV Install",
  "Washing Machine Repair",
  "Refrigerator Repair",
  "Microwave Repair",
  "Geyser Repair",
  "Chimney Repair",
  "Inverter Battery",
  "Fan Cooler Repair",
  "TV Repair",
  "Carpenter",
  "Painter",
  "Mason Tiles Repair",
  "False Ceiling",
  "Door Lock Repair",
  "Furniture Assembly",
  "Waterproofing",
  "Sofa Bed Repair",
  "Bathroom Cleaning",
  "Kitchen Cleaning",
  "Sofa Cleaning",
  "Carpet Cleaning",
  "Water Tank Cleaning",
  "Car Cleaning",
  "Move In Out Cleaning",
  "Salon At Home",
  "Haircut At Home",
  "Makeup Artist",
  "Massage At Home",
  "Mehendi Artist",
  "Fitness Trainer",
  "Yoga Trainer",
  "Office Cleaning",
  "Laptop Desktop AMC",
  "Printer Repair",
  "Networking WiFi Setup",
  "Biometric Attendance",
  "Website Digital Marketing",
  "Photographer",
  "Videographer",
  "DJ Service",
  "Decoration",
  "Catering",
  "Birthday Planner",
  "Wedding Makeup",
  "Tent Lighting",
  "Packers Movers",
  "Tempo Mini Truck",
  "Driver On Demand",
  "Furniture Rental",
  "Appliance Rental",
  "Property Rental Leads",
  "Home Tutor",
  "Computer Classes",
  "Spoken English",
  "Tuition Coaching Inquiry",
  "Music Dance Teacher",
  "Career Counseling",
];
const areas = ["Rohini", "Dwarka", "Laxmi Nagar", "Karol Bagh", "Janakpuri", "Pitampura", "Saket", "Mayur Vihar", "Vasant Kunj", "Noida/Delhi NCR"];
const statuses = ["New", "Assigned", "Accepted", "On the way", "Completed", "Cancelled"];
const packages = ["Basic Visit - Rs 199", "Standard Service - Rs 499", "Deep Service - Rs 899", "Inspection first"];
const slots = ["Anytime today", "Today 10 AM - 1 PM", "Today 2 PM - 5 PM", "Tomorrow 10 AM - 1 PM", "Tomorrow 2 PM - 5 PM"];
const payments = ["Cash after service", "UPI after service", "Online payment later"];
const launchRules = [
  ["Pilot model", "Abhi vendor se commission zero rahega. Pehle service quality, response time aur repeat demand validate hogi."],
  ["Customer promise", "Final price vendor call par confirm hoga. Visit charge, parts aur extra work customer approval ke baad hi hoga."],
  ["Vendor rule", "Lead accept karne ke baad customer ko jaldi call karna hoga. Fake update, overcharge ya no-show vendor ko pause karega."],
  ["Admin control", "Har lead ka status, assigned vendor, completion aur rating admin panel me track hoga."],
];
const faqs = [
  ["Service ka final price kaise confirm hoga?", "Customer request ke baad vendor phone par issue samjhega. Parts ya extra work ho to pehle quote confirm hoga."],
  ["Abhi payment kaise hoga?", "Pilot phase me customer vendor ko service ke baad cash/UPI de sakta hai. Platform commission baad me enable hoga."],
  ["Vendor kaise verify hoga?", "Admin phone, service category, service area, previous work aur first few customer ratings check karega."],
  ["Complaint ya repeat issue ka kya process hai?", "Customer same phone number se booking track karega aur admin lead status/rating ke through follow-up karega."],
];
const adminChecklist = ["New lead ko 10 min ke andar call", "Best matching vendor assign", "Customer ko price/slot confirm", "Completion ke baad rating update", "Bad vendor ko pause"];
const serviceCards = [
  ["AC Repair", "Cooling, gas refill, service", "30-60 min"],
  ["RO Service", "Filter, leakage, installation", "45-90 min"],
  ["Laptop Repair", "Diagnosis and doorstep pickup", "Same day"],
  ["Mobile Repair", "Screen, battery, software", "Same day"],
  ["Electrician", "Switches, wiring, MCB", "30-90 min"],
  ["Plumber", "Leakage, tap, bathroom repair", "30-90 min"],
  ["Home Cleaning", "Deep cleaning and move-in", "Scheduled"],
  ["CCTV Install", "Camera setup and visit", "Site visit"],
  ["Washing Machine Repair", "Noise, drainage, motor, installation", "Same day"],
  ["Refrigerator Repair", "Cooling, compressor, gas, service", "Same day"],
  ["Microwave Repair", "Heating, plate, fuse, door issue", "Same day"],
  ["Geyser Repair", "Heating, wiring, leakage, installation", "Same day"],
  ["Chimney Repair", "Cleaning, motor, suction, installation", "Scheduled"],
  ["Inverter Battery", "Battery check, wiring, backup issue", "Same day"],
  ["Fan Cooler Repair", "Motor, pump, wiring, service", "Same day"],
  ["TV Repair", "Display, sound, power, wall mount", "Same day"],
  ["Carpenter", "Door, furniture, shelves, fitting", "Scheduled"],
  ["Painter", "Room painting, touch-up, texture", "Site visit"],
  ["Mason Tiles Repair", "Tiles, seepage, wall repair", "Site visit"],
  ["False Ceiling", "Design, repair, lighting fit", "Site visit"],
  ["Door Lock Repair", "Lock change, smart lock, keys", "Same day"],
  ["Furniture Assembly", "Bed, table, wardrobe assembly", "Scheduled"],
  ["Waterproofing", "Bathroom, roof, wall seepage", "Site visit"],
  ["Sofa Bed Repair", "Frame, polish, cushion, fitting", "Scheduled"],
  ["Bathroom Cleaning", "Hard stains and deep cleaning", "Scheduled"],
  ["Kitchen Cleaning", "Grease, chimney area, cabinets", "Scheduled"],
  ["Sofa Cleaning", "Fabric, stains, shampoo service", "Scheduled"],
  ["Carpet Cleaning", "Dust, stains, deep shampoo", "Scheduled"],
  ["Water Tank Cleaning", "Tank wash and disinfection", "Scheduled"],
  ["Car Cleaning", "Interior, exterior, doorstep wash", "Scheduled"],
  ["Move In Out Cleaning", "Full home deep cleaning", "Scheduled"],
  ["Salon At Home", "Facial, waxing, grooming", "Scheduled"],
  ["Haircut At Home", "Men, women, kids haircut", "Scheduled"],
  ["Makeup Artist", "Party, bridal, event makeup", "Booking"],
  ["Massage At Home", "Relaxation and wellness", "Scheduled"],
  ["Mehendi Artist", "Festival and wedding mehendi", "Booking"],
  ["Fitness Trainer", "Personal training at home", "Subscription"],
  ["Yoga Trainer", "Home yoga sessions", "Subscription"],
  ["Office Cleaning", "Daily and deep cleaning", "Scheduled"],
  ["Laptop Desktop AMC", "Office systems support", "AMC"],
  ["Printer Repair", "Inkjet, laser, office printer", "Same day"],
  ["Networking WiFi Setup", "Router, LAN, office WiFi", "Same day"],
  ["Biometric Attendance", "Device install and setup", "Site visit"],
  ["Website Digital Marketing", "Business website and leads", "Consultation"],
  ["Photographer", "Event, product, family shoot", "Booking"],
  ["Videographer", "Event video and reels", "Booking"],
  ["DJ Service", "Party and wedding DJ", "Booking"],
  ["Decoration", "Birthday, party, wedding decor", "Booking"],
  ["Catering", "Small party and event food", "Quote"],
  ["Birthday Planner", "Theme, decor, games, cake", "Booking"],
  ["Wedding Makeup", "Bridal and family makeup", "Booking"],
  ["Tent Lighting", "Event tent, light, sound", "Quote"],
  ["Packers Movers", "Home shifting and office move", "Quote"],
  ["Tempo Mini Truck", "Local goods transport", "Same day"],
  ["Driver On Demand", "Hourly and daily driver", "Same day"],
  ["Furniture Rental", "Short and long-term rentals", "Quote"],
  ["Appliance Rental", "AC, fridge, washing machine", "Quote"],
  ["Property Rental Leads", "Tenant and property leads", "Lead"],
  ["Home Tutor", "School subject tutors", "Trial"],
  ["Computer Classes", "Basic computer and coding", "Trial"],
  ["Spoken English", "English practice and coaching", "Trial"],
  ["Tuition Coaching Inquiry", "Coaching and batch leads", "Lead"],
  ["Music Dance Teacher", "Home and online classes", "Trial"],
  ["Career Counseling", "Study, job, career guidance", "Consultation"],
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
  const [notice, setNotice] = useState("System ready. Query save hogi aur srijanartrugs90@gmail.com par mail forward hoga.");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [adminLeadQuery, setAdminLeadQuery] = useState("");
  const [adminServiceFilter, setAdminServiceFilter] = useState("All");
  const [adminMessage, setAdminMessage] = useState("PIN dal kar admin tools unlock karo.");
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
  const visibleLeads = leads.filter((lead) => {
    const query = adminLeadQuery.trim().toLowerCase();
    const queryMatch = !query || `${lead.name} ${lead.phone} ${lead.service} ${lead.area} ${lead.assignedVendor} ${lead.problem}`.toLowerCase().includes(query);
    const statusMatch = statusFilter === "All" || lead.status === statusFilter;
    const serviceMatch = adminServiceFilter === "All" || lead.service === adminServiceFilter;
    return queryMatch && statusMatch && serviceMatch;
  });
  const unassignedLeads = leads.filter((lead) => lead.assignedVendor === "Auto match ready" || lead.status === "New").length;
  const todayFollowUps = leads.filter((lead) => !["Completed", "Cancelled"].includes(lead.status)).length;

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
    const emailText = data.email?.sent ? "Mail sent to srijanartrugs90@gmail.com." : "Query saved; email service setup pending.";
    setNotice(`${emailText} Suggested vendor: ${matchedVendor?.businessName ?? "Auto match ready"}.`);
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
    const emailText = data.email?.sent ? "Mail sent to srijanartrugs90@gmail.com." : "Vendor saved; email service setup pending.";
    setNotice(emailText);
    event.currentTarget.reset();
  }

  async function updateLead(lead: Lead, status: string, customerRating = 0, vendorName?: string) {
    const assignedVendor = vendorName ?? lead.assignedVendor;
    const response = await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: lead.id, status, assignedVendor, customerRating }) });
    if (response.ok) {
      const data = await response.json();
      setLeads((current) => current.map((item) => (item.id === lead.id ? data.lead : item)));
      setAdminMessage(`Lead #${lead.id} updated: ${status}${assignedVendor ? ` / ${assignedVendor}` : ""}`);
    } else {
      setAdminMessage("Lead update nahi hua. Refresh karke dobara try karo.");
    }
  }

  function openAdmin() {
    const allowed = adminPin === "7860";
    setAdminOpen(allowed);
    setAdminMessage(allowed ? "Admin unlocked. Ab leads manage kar sakte ho." : "Wrong PIN. Admin locked hai.");
  }

  function exportLeads() {
    const headers = ["id", "name", "phone", "service", "area", "status", "assignedVendor", "timeSlot", "paymentMode", "rating"];
    const rows = visibleLeads.map((lead) => [lead.id, lead.name, lead.phone, lead.service, lead.area, lead.status, lead.assignedVendor, lead.timeSlot, lead.paymentMode, lead.customerRating || "Pending"]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "delhi-service-network-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
    setAdminMessage(`${visibleLeads.length} leads CSV export ho gayi.`);
  }

  async function copyLeadSummary(lead: Lead) {
    const summary = `Lead #${lead.id}\nName: ${lead.name}\nPhone: ${lead.phone}\nService: ${lead.service}\nArea: ${lead.area}\nSlot: ${lead.timeSlot}\nAddress: ${lead.address}\nProblem: ${lead.problem || "Not provided"}\nVendor: ${lead.assignedVendor}\nStatus: ${lead.status}`;
    await navigator.clipboard?.writeText(summary);
    setAdminMessage(`Lead #${lead.id} summary copied.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#161816]">
      <header className="sticky top-0 z-30 border-b border-[#dfe4dc] bg-[#f7f8f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="Delhi Service Network">
            <img src="/logo-dsn.svg" alt="" className="h-11 w-11 rounded" />
            <span><strong className="block text-sm uppercase">Delhi Service Network</strong><span className="block text-xs text-[#637067]">Local service lead platform</span></span>
          </a>
          <nav className="hidden gap-5 text-sm font-bold text-[#4c574e] md:flex"><a href="#services">Services</a><a href="#book">Book</a><a href="#vendors">Vendors</a><a href="#support">Support</a></nav>
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
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">{["60+ services", "Verified vendors", "Email alerts"].map((item) => <div className="border-l-4 border-[#f29d35] bg-white/90 p-3" key={item}><p className="text-sm font-black">{item}</p></div>)}</div>
            <p className="mt-4 text-sm font-bold text-[#4d5a51]">Queries inbox: srijanartrugs90@gmail.com</p>
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
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Name<input name="name" className="rounded border border-[#ccd5ce] p-3" required placeholder="Customer name" /></label><label className="grid gap-2 text-sm font-bold">Phone<input name="phone" inputMode="numeric" pattern="[0-9]{10}" className="rounded border border-[#ccd5ce] p-3" required placeholder="10 digit mobile" /></label></div>
          <label className="grid gap-2 text-sm font-bold">Full address<input name="address" className="rounded border border-[#ccd5ce] p-3" required placeholder="House no, street, landmark" /></label>
          <label className="grid gap-2 text-sm font-bold">Payment mode<select name="paymentMode" className="rounded border border-[#ccd5ce] bg-white p-3">{payments.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-bold">Problem<textarea name="problem" className="min-h-24 rounded border border-[#ccd5ce] p-3" placeholder="Problem short me likho" /></label>
          <label className="flex items-start gap-3 rounded bg-[#f7f8f5] p-3 text-sm font-bold text-[#4d5a51]"><input type="checkbox" required className="mt-1" /> I agree ki Delhi Service Network meri request ko suitable vendor ke saath share kar sakta hai.</label>
          <button className="rounded bg-[#0d4f3c] px-5 py-3 font-black text-white">Submit Lead</button>
          <p className="rounded bg-[#eef3ec] p-3 text-sm text-[#4d5a51]">{notice}</p>
        </form>
      </section>

      <section className="border-y border-[#dfe4dc] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Launch rules</p><h2 className="mt-2 text-3xl font-black">Pilot ko clean aur professional rakhne ke rules</h2><p className="mt-4 leading-7 text-[#637067]">Ye model lead generation se start hoga, phir data milne ke baad commission, vendor plans aur premium listing add kar sakte ho.</p></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">{launchRules.map(([title, copy]) => <div key={title} className="rounded border border-[#dfe4dc] bg-[#f7f8f5] p-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-[#637067]">{copy}</p></div>)}</div>
        </div>
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
            {!trackingPhone && <p className="rounded bg-[#f7f8f5] p-4 text-sm font-bold text-[#637067]">Booking status dekhne ke liye phone number enter karo.</p>}
            {trackingPhone && trackedBookings.length === 0 && <p className="rounded bg-[#fff4df] p-4 text-sm font-bold text-[#8a4d00]">Is number par abhi booking nahi mili.</p>}
            {trackedBookings.map((lead) => <div key={lead.id} className="rounded bg-[#f7f8f5] p-4"><div className="flex items-center justify-between gap-3"><strong>{lead.service}</strong><span className="rounded bg-[#0d4f3c] px-3 py-1 text-xs font-black text-white">{lead.status}</span></div><p className="mt-2 text-sm text-[#637067]">{lead.packageName} - {lead.timeSlot}</p><p className="text-sm text-[#637067]">Vendor: {lead.assignedVendor}</p></div>)}
          </div>
        </div>

        <div className="rounded border border-[#dfe4dc] bg-white p-5">
          <p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Vendor side</p>
          <h2 className="mt-2 text-3xl font-black">Accept and manage leads</h2>
          <p className="mt-3 leading-7 text-[#637067]">Vendor WhatsApp number se apne matching leads dekh sakta hai aur accept/reject kar sakta hai.</p>
          <input value={vendorPhone} onChange={(event) => setVendorPhone(event.target.value)} className="mt-5 w-full rounded border border-[#ccd5ce] p-3" placeholder="Vendor phone, try 9876500000" />
          <div className="mt-4 grid gap-3">
            {!vendorPhone && <p className="rounded bg-[#f7f8f5] p-4 text-sm font-bold text-[#637067]">Vendor leads dekhne ke liye registered WhatsApp number enter karo.</p>}
            {vendorPhone && !vendorProfile && <p className="rounded bg-[#fff4df] p-4 text-sm font-bold text-[#8a4d00]">Vendor profile nahi mili. Pehle vendor form submit karo.</p>}
            {vendorPhone && vendorProfile && vendorJobs.length === 0 && <p className="rounded bg-[#f7f8f5] p-4 text-sm font-bold text-[#637067]">Abhi matching lead available nahi hai.</p>}
            {vendorJobs.map((lead) => <div key={lead.id} className="rounded bg-[#f7f8f5] p-4"><div className="flex items-center justify-between gap-3"><strong>{lead.service}</strong><span className="text-sm font-bold text-[#637067]">{lead.area}</span></div><p className="mt-2 text-sm text-[#637067]">{lead.packageName} - {lead.timeSlot}</p><p className="text-sm text-[#637067]">{lead.problem || "Customer details after accept"}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => updateLead(lead, "Accepted", 0, vendorProfile?.businessName)} className="rounded bg-[#0d4f3c] px-4 py-2 text-sm font-black text-white">Accept</button><button onClick={() => updateLead(lead, "On the way", 0, vendorProfile?.businessName)} className="rounded bg-[#eef3ec] px-4 py-2 text-sm font-black text-[#0d4f3c]">On the way</button><button onClick={() => updateLead(lead, "Cancelled", 0, vendorProfile?.businessName)} className="rounded bg-[#fff4df] px-4 py-2 text-sm font-black text-[#8a4d00]">Reject</button></div></div>)}
          </div>
        </div>
      </section>

      <section id="vendors" className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Vendor pilot</p><h2 className="mt-2 text-3xl font-black">Abhi commission zero, performance tracking on</h2><p className="mt-4 leading-7 text-[#4d5a51]">Vendor ko free leads milengi. Admin response time, completed jobs aur customer satisfaction dekh kar best vendors shortlist karega.</p></div>
        <form onSubmit={submitVendor} className="grid gap-4 bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]">
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Business name<input name="businessName" className="rounded border border-[#ccd5ce] p-3" required placeholder="Vendor/company" /></label><label className="grid gap-2 text-sm font-bold">WhatsApp<input name="vendorPhone" inputMode="numeric" pattern="[0-9]{10}" className="rounded border border-[#ccd5ce] p-3" required placeholder="Mobile number" /></label></div>
          <label className="grid gap-2 text-sm font-bold">Service<select name="vendorService" className="rounded border border-[#ccd5ce] bg-white p-3">{services.map((service) => <option key={service}>{service}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-bold">Areas served<input name="areas" className="rounded border border-[#ccd5ce] p-3" required placeholder="Rohini, Pitampura, Dwarka" /></label>
          <label className="flex items-start gap-3 rounded bg-[#f7f8f5] p-3 text-sm font-bold text-[#4d5a51]"><input type="checkbox" required className="mt-1" /> I agree ki pilot phase me fast response, fair pricing aur genuine status update maintain karunga.</label>
          <button className="rounded bg-[#f29d35] px-5 py-3 font-black text-[#17120b]">Add Vendor</button>
        </form>
      </section>

      <section id="support" className="border-y border-[#dfe4dc] bg-[#eef3ec]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div><p className="text-sm font-black uppercase tracking-wide text-[#0d4f3c]">Support desk</p><h2 className="mt-2 text-3xl font-black">Customer aur vendor dono ke liye clear help</h2><p className="mt-4 leading-7 text-[#4d5a51]">Launch ke time confusion kam rakhna sabse important hai. Booking, pricing, complaint aur vendor rules yahin visible rahenge.</p><div className="mt-6 grid gap-3"><a href="mailto:srijanartrugs90@gmail.com" className="rounded bg-[#0d4f3c] px-5 py-3 text-center font-black text-white">Email Support</a><a href="#book" className="rounded border border-[#0d4f3c] bg-white px-5 py-3 text-center font-black text-[#0d4f3c]">Create New Query</a></div></div>
          <div className="grid gap-3">{faqs.map(([question, answer]) => <details key={question} className="rounded border border-[#dfe4dc] bg-white p-4"><summary className="cursor-pointer font-black">{question}</summary><p className="mt-3 leading-7 text-[#637067]">{answer}</p></details>)}</div>
        </div>
      </section>

      <footer className="bg-[#161816] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <div><h2 className="text-xl font-black">Delhi Service Network</h2><p className="mt-2 text-sm leading-6 text-white/70">Delhi NCR local services, lead routing, vendor pilot and admin tracking platform.</p></div>
          <div><p className="text-sm font-black uppercase text-[#f29d35]">Launch inbox</p><a className="mt-2 block font-bold" href="mailto:srijanartrugs90@gmail.com">srijanartrugs90@gmail.com</a></div>
          <div><p className="text-sm font-black uppercase text-[#f29d35]">Pilot status</p><p className="mt-2 text-sm text-white/70">Customer bookings, vendor onboarding, tracking, and support are ready for Delhi NCR pilot launch.</p></div>
        </div>
      </footer>
    </main>
  );
}
