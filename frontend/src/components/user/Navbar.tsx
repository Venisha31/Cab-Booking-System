import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50">
      <div className="text-xl font-bold text-yellow-500">🚖 RideNexa</div>
      <ul className="hidden md:flex gap-6 text-gray-800 font-medium">
        <li>Home</li>
        <li>About Us</li>
        <li>Services</li>
        <li>Contact</li>
      </ul>
      <div className="flex gap-3">
        <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">Book Now</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
