"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Link from "next/link";
import { supabase } from '../lib/supabase';
import { motion } from "framer-motion"; // already imported

const getTrophyIcon = (position: number) => {
  switch (position) {
    case 1:
      return "🏆"; // Gold
    case 2:
      return "🥈"; // Silver
    case 3:
      return "🥉"; // Bronze
    default:
      return "🏆";
  }
};

const SkeletonTopPerformer = () => (
  <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 w-32 bg-gray-800 rounded"></div>
    </div>
    <div className="h-6 w-40 bg-gray-800 rounded mb-4"></div>
    <div className="h-8 w-24 bg-gray-800 rounded mb-2"></div>
    <div className="space-y-2">
      <div className="h-4 w-28 bg-gray-800 rounded"></div>
      <div className="h-4 w-20 bg-gray-800 rounded"></div>
    </div>
  </div>
);

const SkeletonStatCard = () => (
  <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 animate-pulse">
    <div className="h-6 w-48 bg-gray-800 rounded mb-6"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border-b border-gray-800 pb-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-800 rounded"></div>
              <div className="h-4 w-24 bg-gray-800 rounded"></div>
            </div>
            <div className="h-4 w-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TopPerformerCard = ({ name, profit, trades, percentage, position }: {
  name: string;
  profit: string;
  trades: number;
  percentage: string;
  position: number;
}) => {
  const profitColor = parseFloat(profit.replace(/[$,]/g, '')) < 0 ? 'text-red-500' : 'text-green-500';
  const percentageColor = parseFloat(percentage) < 0 ? 'text-red-500' : 'text-green-500';

  return (
    <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="text-cyan-400 text-sm">{getTrophyIcon(position)} TOP PERFORMER</span>
      </div>
      <h3 className="text-xl font-semibold mb-4">{name}</h3>
      <div className={`text-3xl font-bold mb-2 ${percentageColor}`}>{percentage}%</div>
      <div className={`text-gray-400 text-sm`}>
        <div className={`${profitColor}`}>PROFIT: {profit}</div>
        <div>TRADES: {trades}</div>
      </div>
    </div>
  );
};

// New FloatingLogo component animating favicon.png
const FloatingLogo = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('logo-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Increased movement multiplier from 25 to 35 for more movement
      const x = ((e.clientX - centerX) / window.innerWidth) * 35;
      const y = ((e.clientY - centerY) / window.innerHeight) * 35;

      // Adjusted limits for wider movement range
      const limitedX = Math.max(-25, Math.min(25, x));
      const limitedY = Math.max(-25, Math.min(25, y));

      setMousePosition({ x: limitedX, y: limitedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div id="logo-container" className="relative w-[300px] h-[300px] mx-auto flex items-center justify-center">
      <motion.div
        initial={{ x: 0, y: 0 }}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y
        }}
        transition={{
          type: "spring",
          stiffness: 70, // Increased stiffness for more responsive movement
          damping: 15, // Reduced damping for more bounce
          mass: 0.3 // Reduced mass for faster movement
        }}
        className="absolute"
      >
        <Image 
          src="/favicon.png" 
          alt="Floating Logo" 
          width={200}
          height={200}
          className="rounded-full shadow-2xl"
        />
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [mostTradedAssets, setMostTradedAssets] = useState<{symbol: string, trades: number}[]>([]);
  const [recentBreaches, setRecentBreaches] = useState<any[]>([]);

  // Utility function to format time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);
  
    if (days > 0) return `${days} Days Ago`;
    if (hours > 0) return `${hours} Hours Ago`;
    if (minutes > 0) return `${minutes} Minutes Ago`;
    return "Just Now";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all traders data
        const { data: traders, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('return', { ascending: false });

        if (error) throw error;

        // Process top performers - filter non-breached accounts and take top 3
        const liveTraders = traders.filter(trader => !trader.breached);
        setTopPerformers(liveTraders.slice(0, 3));

        // Process most traded assets from symbol_trade_counts
        const tradeCounts: { [key: string]: number } = {};
        traders.forEach(trader => {
          if (trader.symbol_trade_counts) {
            Object.entries(trader.symbol_trade_counts).forEach(([symbol, count]) => {
              if (symbol !== '') { // Skip empty symbol
                tradeCounts[symbol] = (tradeCounts[symbol] || 0) + Number(count);
              }
            });
          }
        });

        const sortedAssets = Object.entries(tradeCounts)
          .map(([symbol, trades]) => ({ symbol, trades }))
          .sort((a, b) => b.trades - a.trades);
        setMostTradedAssets(sortedAssets);

        // Process recent breaches
        const allBreaches = traders
          .filter(trader => trader.breaches && trader.breaches.length > 0)
          .flatMap(trader => 
            trader.breaches.map((breach: any) => ({
              ...breach,
              details: {
                ...breach.details,
                contestant_name: trader.contestant_name
              }
            }))
          )
          .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5);

        setRecentBreaches(allBreaches);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('home-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leaderboard' 
        }, 
        () => {
          // Refresh data when changes occur
          fetchData();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <motion.div
      initial={{ filter: "brightness(0%)" }}
      animate={{ filter: "brightness(100%)" }}
      transition={{ duration: 3 }}
      className="min-h-screen bg-[#0A0C10] text-white relative"
    >
      <Navbar />

      {/* Hero Section Overhaul with Responsive Design */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative p-8 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 rounded-xl flex flex-col md:flex-row items-center"
        >
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="w-full md:w-1/3 text-left mb-6 md:mb-0 pr-4"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Master{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                The Markets Together
              </span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
            From aspiring traders to funded professionals your journey starts here. Join a dynamic community where you can learn advanced strategies, compete in real-market challenges, and gain the skills needed to secure funding.
            </p>
          </motion.div>

          {/* Middle: Floating Image */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0"
          >
            <FloatingLogo />
          </motion.div>
          
          {/* Right: Buttons Container */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-full md:w-1/3 flex flex-col justify-center pl-4 gap-4"
          >
            <a 
              href="https://discord.gg/aK4JqTvj5k"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold px-4 py-2 rounded-full transition-all duration-300 shadow-lg text-s w-[200px] text-center mx-auto "
            >
              Join Discord
            </a>
            <Link 
              href="/leaderboard"
              className="bg-white text-black font-semibold px-4 py-2 rounded-full transition-all duration-300 shadow-lg text-center text-s    w-[200px] text-center mx-auto"
            >
              View Rankings
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Top Performers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {isLoading ? (
            <>
              <SkeletonTopPerformer />
              <SkeletonTopPerformer />
              <SkeletonTopPerformer />
            </>
          ) : topPerformers.length > 0 ? (
            topPerformers.map((trader, index) => (
              <TopPerformerCard
                key={trader.account_id}
                name={trader.contestant_name}
                profit={`$${trader.profit_loss.toFixed(2)}`}
                trades={trader.total_trades}
                percentage={trader.return.toFixed(2)}
                position={index + 1}
              />
            ))
          ) : (
            <div className="text-gray-400">No top performers available.</div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {isLoading ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              {/* Recent Eliminations */}
              <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-semibold mb-6">Recent Eliminations</h2>
                <div className="space-y-4">
                  {recentBreaches.map((breach, index) => (
                    <div key={`${breach.details.account_id}-${breach.time}`} 
                         className={`${index !== recentBreaches.length - 1 ? 'border-b border-gray-800' : ''} pb-4`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{breach.details.contestant_name}</h3>
                          <p className="text-sm text-gray-400">
                            {breach.type === 'daily_drawdown' ? 'DAILY DRAWDOWN BREACH' : 
                             breach.type === 'max_drawdown' ? 'MAX DRAWDOWN BREACH' : 
                             breach.type.toUpperCase()}
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatTimeAgo(breach.time)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentBreaches.length === 0 && (
                    <div className="text-gray-400 text-center">No recent eliminations</div>
                  )} 
                </div>
              </div>

              {/* Most Traded Assets */}
              <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-semibold mb-6">Most Traded Assets</h2>
                <div className="space-y-4">
                  {mostTradedAssets.map((asset, index) => (
                    <div key={asset.symbol} className={`${index !== mostTradedAssets.length - 1 ? 'border-b border-gray-800' : ''} pb-4`}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{asset.symbol}</h3>
                        <span className="text-sm text-gray-400">{asset.trades} TRADES</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </motion.div>
  );
}
