"use client"

import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="hidden lg:block bg-graphite text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CleanGod Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/cleangod-logo.png" alt="CleanGod" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-emerald-600 text-[#2DCE89]">CleanGod</span>
            </div>
            <p className="text-base text-gray-800 mb-4">
              Premium home services and cleaning products. Magical Wow Clean experience at your fingertips.
            </p>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="text-lg font-extrabold mb-4 text-[#1B1F22]">Services</h3>
            <ul className="space-y-2 text-base text-gray-800">
              <li>
                <Link href="/services" className="hover:text-[#2DCE89] transition-colors">
                  Home Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#2DCE89] transition-colors">
                  Deep Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#2DCE89] transition-colors">
                  Kitchen Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#2DCE89] transition-colors">
                  Bathroom Cleaning
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div className="col-span-1">
            <h3 className="text-lg font-extrabold mb-4 text-[#1B1F22]">Products</h3>
            <ul className="space-y-2 text-base text-gray-800">
              <li>
                <Link href="/products" className="hover:text-[#2DCE89] transition-colors">
                  Cleaning Supplies
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#2DCE89] transition-colors">
                  Premium Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#2DCE89] transition-colors">
                  Eco-Friendly
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#2DCE89] transition-colors">
                  Professional Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-lg font-extrabold mb-4 text-[#1B1F22]">Company</h3>
            <ul className="space-y-2 text-base text-gray-800">
              <li>
                <Link href="/about" className="hover:text-[#2DCE89] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#2DCE89] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#2DCE89] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#2DCE89] transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Vinroot Branding */}
        <div className="border-t border-gray-300 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-700 mb-4 md:mb-0">
            © 2024 CleanGod. All rights reserved.
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-base text-gray-700">Powered by</span>
            <Image
              src="/vinroot-logo.png"
              alt="Vinroot - Business Blooms Everywhere"
              width={120}
              height={40}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
