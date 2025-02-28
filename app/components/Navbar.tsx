"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/50 bg-[#0A0C10]/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/favicon.png"
              alt="Logo"
              className="w-8 h-8 rounded-sm"
            />
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              The Trading Zone
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <a
              href="https://discord.gg/aK4JqTvj5k"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-colors"
            >
              Join Discord
            </a>
          </div>

          {/* Mobile Burger Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-800">
            <Link 
              href="/"
              className="block px-4 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/leaderboard"
              className="block px-4 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <a
              href="https://discord.gg/aK4JqTvj5k"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Join Discord
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}