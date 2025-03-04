"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface TodaysTrading {
  volume: string;
  trades: number;
  winRate: string;
  avgWin: string;
  avgLoss: string;
  largestTrade: string;
  profitFactor: string;
}

interface TraderStats {
  totalTrades: number;
  winRate: string;
  winningTrades: number;
  losingTrades: number;
  averageLotSize: number;
  mostTradedSymbol: string;
}

interface TraderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  trader: {
    name: string;
    balance: string;
    equity: string;
    profit: string;
    return: string;
    bestDay: string;
    bestDayPercentage: string;
    todaysTrading: TodaysTrading;
    statistics: TraderStats;
    startingDayBalance: number;
    dailyDdLimit: number;
    openPositions: number;
  };
}

export default function TraderDetailsDialog({ isOpen, onClose, trader }: TraderDetailsProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/20 p-4 sm:p-5 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <div className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors">
                BALANCE
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                ${trader.balance}
              </div>
            </motion.div>
            <div className="bg-black/20 p-4 sm:p-5 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-colors group">
              <div className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors">EQUITY</div>
              <div className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">${trader.equity}</div>
            </div>
            <div className="bg-black/20 p-4 sm:p-5 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-colors group">
              <div className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors">PROFIT/LOSS</div>
              <div className={`text-xl sm:text-2xl font-bold ${parseFloat(trader.profit) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                ${trader.profit}
              </div>
            </div>
            <div className="bg-black/20 p-4 sm:p-5 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-colors group">
              <div className="text-gray-400 text-sm mb-2 group-hover:text-gray-300 transition-colors">RETURN</div>
              <div className={`text-xl sm:text-2xl font-bold ${parseFloat(trader.return) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {trader.return}%
              </div>
            </div>
          </div>
        );

      case "Today's Trading":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">DAY STARTING BALANCE</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">${trader.startingDayBalance}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">CURRENT BALANCE</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">${trader.balance}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">DAILY LOSS LIMIT</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">${trader.dailyDdLimit}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">ACCOUNT LOSS LIMIT</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">$95,000</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group w-full">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">RESET TIME</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors" aria-label="Reset Time" tabIndex={0}>
                3:30 AM IST
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">OPEN POSITIONS</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {trader.openPositions || 0}
              </div>
            </div>
          </div>
        );

      case "Statistics":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">TOTAL TRADES</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{trader.statistics.totalTrades}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">WIN RATE</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{trader.statistics.winRate}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">WINNING TRADES</div>
              <div className="text-lg sm:text-xl font-bold text-green-500 group-hover:text-green-500 transition-colors">{trader.statistics.winningTrades}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">LOSING TRADES</div>
              <div className="text-lg sm:text-xl font-bold text-red-500 group-hover:text-red-500 transition-colors">{trader.statistics.losingTrades}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">AVG LOT SIZE</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{trader.statistics.averageLotSize}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">MOST TRADED SYMBOL</div>
              <div className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{trader.statistics.mostTradedSymbol || "N/A"}</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] touch-none"
      onClick={onClose}
    >
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-[#0D1117] to-[#1A1F2B] rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-800/50 relative overflow-hidden"
        >
          {/* Decorative gradient blur */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -inset-[500px] opacity-30">
              <div className="absolute inset-0 bg-gradient-conic from-cyan-500/40 via-transparent to-transparent blur-3xl" />
            </div>
          </div>

          {/* Header */}
          <div className="relative flex justify-between items-center p-3 sm:p-6 min-h-[72px] sm:min-h-[88px] border-b border-gray-800/50">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 flex items-center gap-2">
                {trader.name}
                {/* <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                  Rank #1
                </span> */}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Trading Performance Overview</p>
            </div>
            <button 
              onClick={onClose}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 border border-gray-700 hover:border-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="relative flex px-2 sm:px-6 border-b border-gray-800/50 min-h-[40px] sm:min-h-[48px] bg-gray-900/20 overflow-x-auto">
            {["Overview", "Today's Trading", "Statistics"].map((tab) => (
              <button
                key={tab}
                className={`px-2.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${
                  activeTab === tab
                    ? "text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 h-[350px] sm:h-[400px] overflow-hidden relative">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <div className="pr-2">
                {renderContent()}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && modalContent}
    </AnimatePresence>,
    document.body
  );
}