import React from "react";
import { useRouter } from "next/router";

const MEN_SALON_PACKAGES = [
  {
    name: "Grooming essentials",
    rating: 4.88,
    reviews: 892000,
    price: 557,
    originalPrice: 657,
    duration: "1 hr 5 mins",
    features: [
      { label: "Haircut", desc: "Haircut for men" },
      { label: "Shave/beard grooming", desc: "Beard trimming & styling" },
      { label: "Massage", desc: "Head massage (10 mins)" },
    ],
  },
  {
    name: "Haircut & color",
    rating: 4.88,
    reviews: 536000,
    price: 508,
    originalPrice: 558,
    duration: "60 mins",
    features: [
      { label: "Haircut & color", desc: "Haircut for men" },
      { label: "Hair color (Garnier)", desc: "Brown black (shade 3)" },
    ],
  },
];

const UC_PROMISE = [
  "Verified Professionals",
  "Hassle Free Booking",
  "Transparent Pricing",
];

function CashbackOffer() {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3 mb-6 border border-green-200">
      <div className="bg-green-100 rounded-full p-2">
        <span className="text-green-600 text-lg font-bold">%</span>
      </div>
      <div>
        <div className="font-semibold text-green-800">Amazon cashback upto ₹50</div>
        <div className="text-xs text-gray-500">Via Amazon Pay balance</div>
        <a href="#" className="text-xs text-blue-600 underline">View More Offers</a>
      </div>
    </div>
  );
}

function UCPromise() {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <div className="font-bold text-lg mb-2">UC Promise</div>
      <ul className="text-sm text-gray-700 list-disc pl-5">
        {UC_PROMISE.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: typeof MEN_SALON_PACKAGES[0] }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-green-700 font-bold text-xs">PACKAGE</span>
        <button className="bg-purple-100 text-purple-700 px-4 py-1 rounded font-semibold text-sm">Add</button>
      </div>
      <div className="font-bold text-lg mb-1">{pkg.name}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-purple-700 text-xs font-bold">★ {pkg.rating} ({(pkg.reviews/1000).toFixed(0)}K reviews)</span>
        <span className="text-gray-400 text-xs">• {pkg.duration}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-lg">₹{pkg.price}</span>
        <span className="line-through text-gray-400 text-sm">₹{pkg.originalPrice}</span>
      </div>
      <ul className="text-sm text-gray-700 mb-2">
        {pkg.features.map((f) => (
          <li key={f.label}>
            <span className="font-bold">{f.label}:</span> {f.desc}
          </li>
        ))}
      </ul>
      <button className="border rounded px-3 py-1 text-sm font-semibold hover:bg-gray-100">Edit your package</button>
    </div>
  );
}

export default function ServiceDetailPage({ params }: { params: { service: string } }) {
  const service = decodeURIComponent(params.service || "");
  if (service.toLowerCase().includes("men")) {
    return (
      <div className="flex flex-col md:flex-row gap-8 p-8 min-h-screen bg-[#f7f7f9]">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Packages</h1>
          {MEN_SALON_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.name} pkg={pkg} />
          ))}
        </div>
        <div className="w-full md:w-80">
          <div className="mb-6">
            <img src="/services/men's salon.png" alt="Men's Salon" className="rounded-xl w-full mb-4" />
            <div className="text-center font-bold text-lg mb-2">No items in your cart</div>
            <div className="text-center text-gray-400 text-sm mb-4">Your cart is empty</div>
          </div>
          <CashbackOffer />
          <UCPromise />
        </div>
      </div>
    );
  }
  // Placeholder for other services
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f7f9]">
      <h1 className="text-3xl font-bold mb-6">{service}</h1>
      <div className="text-gray-500">Service details coming soon!</div>
    </div>
  );
}
