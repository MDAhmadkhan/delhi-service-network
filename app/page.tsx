"use client";

import { useMemo, useState } from "react";

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

const areas = [
  "Rohini",
  "Dwarka",
  "Laxmi Nagar",
  "Karol Bagh",
  "Janakpuri",
  "Pitampura",
  "Saket",
  "Mayur Vihar",
  "Vasant Kunj",
  "Noida/Delhi NCR",
];

const leads = [
  { area: "Rohini", service: "AC Repair", status: "New", vendor: "Auto match ready" },
  { area: "Dwarka", service: "RO Service", status: "Assigned", vendor: "AquaFix Delhi" },
  { area: "Laxmi Nagar", service: "Laptop Repair", status: "Contacted", vendor: "TechPoint Care" },
  { area: "Saket", service: "Electrician", status: "Completed", vendor: "BrightWire Services" },
];

export default function Home() {
  const [selectedService, setSelectedService] = useState("AC Repair");
  const [selectedArea, setSelectedArea] = useState("Rohini");
  const [submitted, setSubmitted] = useState(false);

  const matchText = useMemo(() => {
    return `${selectedService} lead will be routed to active vendors in ${selectedArea}.`;
  }, [selectedArea, selectedService]);

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-[#161816]">
      <header className="sticky top-0 z-20 border-b border-[#dfe4dc] bg-[#f7f8f5]/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a className="flex items-center gap-3" href="#top" aria-label="Delhi Service Network home">
            <span className="grid h-10 w-10 place-items-center rounded bg-[#0d4f3c] font-bold text-white">DS</span>
            <span>
              <span className="block text-sm font-bold uppercase tracking-wide">Delhi Service Network</span>
              <span className="block text-xs text-[#637067]">Free pilot leads for verified vendors</span>
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-medium text-[#4c574e] md:flex">
            <a href="#services">Services</a>
            <a href="#book">Book</a>
            <a href="#vendors">Vendors</a>
            <a href="#dashboard">Dashboard</a>
          </nav>
          <a className="rounded bg-[#f29d35] px-4 py-2 text-sm font-bold text-[#17120b]" href="#book">
            Book Service
          </a>
        </div>
      </header>

      <section id="top" className="border-b border-[#dfe4dc]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Delhi NCR local services</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Customer lead aayegi, system vendor ko smartly assign karega.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4d5a51]">
              AC, RO, repair, cleaning, plumbing, electrician aur CCTV services ke liye ek professional pilot platform.
              Pehle trust aur data build karo, monetization baad me add karo.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a className="rounded bg-[#0d4f3c] px-5 py-3 text-center font-bold text-white" href="#book">
                Create Customer Lead
              </a>
              <a className="rounded border border-[#0d4f3c] px-5 py-3 text-center font-bold text-[#0d4f3c]" href="#vendors">
                Register Vendor
              </a>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
              {["8 services", "10 Delhi areas", "0% commission pilot"].map((item) => (
                <div className="border-l-4 border-[#f29d35] bg-white p-3" key={item}>
                  <p className="text-sm font-bold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="book" className="bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Book a Service</h2>
                <p className="text-sm text-[#637067]">Lead capture form for customers</p>
              </div>
              <span className="rounded bg-[#e8f3ee] px-3 py-1 text-xs font-bold text-[#0d4f3c]">Pilot</span>
            </div>
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <label className="grid gap-2 text-sm font-bold">
                Service
                <select className="rounded border border-[#ccd5ce] bg-white p-3" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                  {services.map((service) => <option key={service.name}>{service.name}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Area
                <select className="rounded border border-[#ccd5ce] bg-white p-3" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                  {areas.map((area) => <option key={area}>{area}</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">Name<input className="rounded border border-[#ccd5ce] p-3" placeholder="Customer name" required /></label>
                <label className="grid gap-2 text-sm font-bold">Phone<input className="rounded border border-[#ccd5ce] p-3" placeholder="10 digit mobile" required /></label>
              </div>
              <label className="grid gap-2 text-sm font-bold">
                Problem
                <textarea className="min-h-24 rounded border border-[#ccd5ce] p-3" placeholder="Problem short me likho" />
              </label>
              <button className="rounded bg-[#0d4f3c] px-5 py-3 font-bold text-white" type="submit">Submit Lead</button>
              <p className="rounded bg-[#f7f8f5] p-3 text-sm text-[#4d5a51]">{submitted ? "Lead captured. Vendor assignment queue me add ho gaya." : matchText}</p>
            </form>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Service catalogue</p>
            <h2 className="text-3xl font-black">Professional services ready for lead routing</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#637067]">Start free pilot with limited categories, then expand after real demand data.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <button className="min-h-40 rounded border border-[#dfe4dc] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#0d4f3c]" key={service.name} onClick={() => setSelectedService(service.name)}>
              <span className="text-xs font-bold uppercase tracking-wide text-[#f29d35]">{service.demand} demand</span>
              <h3 className="mt-3 text-xl font-black">{service.name}</h3>
              <p className="mt-2 text-sm text-[#637067]">{service.time}</p>
              <p className="mt-4 text-sm font-bold text-[#0d4f3c]">{service.price}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="vendors" className="border-y border-[#dfe4dc] bg-[#eef3ec]">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Vendor network</p>
            <h2 className="mt-2 text-3xl font-black">Verified vendors ko free pilot leads</h2>
            <p className="mt-4 text-[#4d5a51] leading-7">
              Pehle 30 days commission nahi. Vendor sirf job status update karega. Tum performance, response time aur customer rating track karoge.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["KYC/proof optional", "Area based matching", "Rating after every job", "Warning and block status"].map((item) => (
                <div className="rounded border border-[#d7dfd8] bg-white p-4 font-bold" key={item}>{item}</div>
              ))}
            </div>
          </div>
          <form className="grid gap-4 bg-white p-5 shadow-sm ring-1 ring-[#dfe4dc]">
            <h3 className="text-2xl font-black">Join as Vendor</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">Business name<input className="rounded border border-[#ccd5ce] p-3" placeholder="Vendor/company" /></label>
              <label className="grid gap-2 text-sm font-bold">Mobile<input className="rounded border border-[#ccd5ce] p-3" placeholder="WhatsApp number" /></label>
            </div>
            <label className="grid gap-2 text-sm font-bold">Service category<select className="rounded border border-[#ccd5ce] bg-white p-3">{services.map((service) => <option key={service.name}>{service.name}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-bold">Areas served<input className="rounded border border-[#ccd5ce] p-3" placeholder="Rohini, Pitampura, Dwarka..." /></label>
            <button className="rounded bg-[#f29d35] px-5 py-3 font-bold text-[#17120b]" type="button">Add Vendor to Pilot</button>
          </form>
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[#0d4f3c]">Admin dashboard preview</p>
          <h2 className="text-3xl font-black">Lead tracking, vendor assignment, performance</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {["42 leads", "18 vendors", "71% contacted", "4.6 avg rating"].map((metric) => (
            <div className="rounded border border-[#dfe4dc] bg-white p-4" key={metric}>
              <p className="text-2xl font-black">{metric.split(" ")[0]}</p>
              <p className="text-sm font-bold text-[#637067]">{metric.substring(metric.indexOf(" ") + 1)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded border border-[#dfe4dc] bg-white">
          {leads.map((lead) => (
            <div className="grid gap-2 border-b border-[#edf0eb] p-4 text-sm last:border-b-0 sm:grid-cols-4" key={`${lead.area}-${lead.service}`}>
              <strong>{lead.service}</strong>
              <span>{lead.area}</span>
              <span>{lead.vendor}</span>
              <span className="font-bold text-[#0d4f3c]">{lead.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
