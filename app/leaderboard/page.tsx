'use client'

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TraderDetailsDialog from "../components/TraderDetailsDialog";
import { supabase } from '../../lib/supabase';

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

interface Breach {
  time: string;
  type: string;
  details: {
    account_id: string;
    contestant_name: string;
    equity: number;
    max_drawdown_limit: number;
  };
}


const SkeletonRow = () => (
  <tr className="border-b border-gray-800">
    <td className="p-4">
      <div className="h-6 w-6 bg-gray-800 rounded animate-pulse"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-16 bg-gray-800 rounded animate-pulse"></div>
    </td>
    <td className="p-4">
      <div className="h-8 w-20 bg-gray-800 rounded animate-pulse"></div>
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="p-4 space-y-3 bg-[#0D1117] border border-gray-800 animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="h-6 w-6 bg-gray-800 rounded"></div>
      <div className="h-6 w-32 bg-gray-800 rounded"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-20 bg-gray-800 rounded"></div>
          <div className="h-4 w-24 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
    <div className="h-8 w-full bg-gray-800 rounded mt-4"></div>
  </div>
);

const SkeletonStat = () => (
  <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 animate-pulse">
    <div className="h-8 w-24 bg-gray-800 rounded mb-2"></div>
    <div className="h-4 w-20 bg-gray-800 rounded"></div>
  </div>
);

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [traders, setTraders] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    const fetchTradersData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch traders data
        const { data: tradersData, error: tradersError } = await supabase
          .from('leaderboard')
          .select('*')
          .order('return', { ascending: false });

        if (tradersError) throw tradersError;

        // Fetch metadata
        const { data: metadataData, error: metadataError } = await supabase
          .from('metadata')
          .select('*')
          .single();

        if (metadataError) throw metadataError;

        setTraders(tradersData || []);
        setMetadata(metadataData || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradersData();
  }, []);

  const handleOpenDetails = (trader: any) => {
    setSelectedTrader({
      name: trader.contestant_name,
      balance: trader.balance,
      equity: trader.equity,
      profit: trader.profit_loss,
      return: trader.return,
      bestDay: "$5,347.8",
      bestDayPercentage: "59.5% of Total Profit",
      todaysTrading: {
        volume: "$1.2M",
        trades: trader.total_trades,
        winRate: `${trader.win_rate}%`,
        avgWin: "$892.45",
        avgLoss: "-$421.32",
        largestTrade: "$2,341.67",
        profitFactor: "2.12"
      },
      statistics: {
        totalTrades: trader.total_trades || 0,
        winRate: `${trader.win_rate || 0}%`,
        winningTrades: trader.winning_trades || 0,
        losingTrades: trader.losing_trades || 0,
        lotsTraded: trader.lots_traded || 0,  // Change this line
        mostTradedSymbol: trader.most_traded_symbol || "",
        breached: trader.breached || false,
        consistencyScore: trader.consistency_score || 0
      },
      startingDayBalance: trader.starting_day_balance || 0,
      dailyDdLimit: trader.daily_dd_limit || 95000,
      openPositions: trader.open_positions || 0  // Add this line
    });
  };

  // Separate live and breached accounts
  const liveAccounts = traders.filter((trader: { breached: any; }) => !trader.breached);
  const breachedAccounts = traders.filter((trader: { breached: any; }) => trader.breached);

  // Sort live accounts by highest return (safe copy with null checks)
  const sortedLiveAccounts = [...liveAccounts].sort((a, b) => {
    const aReturn = a.return || 0;
    const bReturn = b.return || 0;
    return bReturn - aReturn;
  });

  // Combine sorted live accounts with breached accounts
  const sortedTraders = [...sortedLiveAccounts, ...breachedAccounts];

  // Calculate highest return and active competitors (safe for empty arrays)
  const highestReturn = liveAccounts.length > 0 
    ? Math.max(...liveAccounts.map((trader: { return: any; }) => trader.return || 0)).toFixed(2)
    : '0.00';
  const activeCompetitors = liveAccounts.length;
  const totalCompetitors = traders.length;

  const profitColor = (profit: number) => (profit < 0 ? 'text-red-500' : 'text-green-500');
  const returnColor = (returnValue: number) => (returnValue < 0 ? 'text-red-500' : 'text-green-500');
  
  // Helper to determine breach info with fallback to manual_breach_reason
  const getBreachInfo = (trader: any): { text: string; class: string; aria: string } | null => {
    if (!trader?.breached) return null;
    const breachesArr = Array.isArray(trader?.breaches) ? trader.breaches : [];
    if (breachesArr.length > 0) {
      const isDaily = breachesArr.some((breach: Breach) => breach.type === 'daily_drawdown');
      return {
        text: isDaily ? 'Daily Drawdown Breach' : 'Max Drawdown Breach',
        class: isDaily ? 'text-red-500' : 'text-yellow-500',
        aria: isDaily ? 'Daily drawdown breach' : 'Max drawdown breach',
      };
    }
    const reason: string | undefined = trader?.manual_breach_reason;
    if (reason && reason.trim().length > 0) {
      return { text: reason, class: 'text-gray-400', aria: 'Manual breach reason' };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white">
      <Navbar />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with gradient background */}
          <div className="relative py-12 mb-12">
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              Live Competition Rankings
            </h1>
          </div>

          {/* Stats Grid with dynamic values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {isLoading ? (
              <>
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
                <SkeletonStat />
              </>
            ) : (
              <>
                <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-3xl font-bold text-cyan-400">$100,000</div>
                  <div className="text-gray-400 text-sm mt-1">Initial Capital</div>
                </div>
                
                <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-3xl font-bold text-cyan-400">{highestReturn}%</div>
                  <div className="text-gray-400 text-sm mt-1">Highest Return</div>
                </div>
                
                <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-3xl font-bold text-cyan-400">{activeCompetitors}/{totalCompetitors}</div>
                  <div className="text-gray-400 text-sm mt-1">Active Competitors</div>
                </div>
                
                <div className="bg-[#0D1117] p-6 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-xl font0-bold text-cyan-400" aria-label="Last updated time">{formatTimeAgo(metadata?.last_updated_time)}</div>
                  <div className="text-gray-400 text-sm mt-2">Last Updated</div>
                </div>
              </>
            )}
          </div>

          {/* Leaderboard Table/Cards */}
          <div className="bg-[#0D1117] rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="text-left p-4 text-gray-400 font-medium">RANK</th>
                    <th className="text-left p-4 text-gray-400 font-medium">TRADER</th>
                    <th className="text-left p-4 text-gray-400 font-medium">BALANCE</th>
                    <th className="text-left p-4 text-gray-400 font-medium">EQUITY</th>
                    <th className="text-left p-4 text-gray-400 font-medium">PROFIT/LOSS</th>
                    <th className="text-left p-4 text-gray-400 font-medium">RETURN</th>
                    <th className="text-left p-4 text-gray-400 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Show 5 skeleton rows while loading
                    Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  ) : (
                    sortedTraders.map((trader, index) => (
                      <tr 
                        key={trader.account_id || index} 
                        className={`border-b border-gray-800 hover:bg-cyan-500/5 transition-colors ${trader.breached ? 'hover:bg-red-600/10 bg-red-600/20' : ''}`}
                      >
                        <td className="p-4 flex items-center">
                          <span className="text-yellow-500 text-lg">
                            {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                          </span>
                        </td>
                        <td className="p-4 font-medium">
                          {trader.contestant_name}
                          {(() => {
                            const info = getBreachInfo(trader);
                            return info ? (
                              <div className={`text-sm mt-1 ${info.class}`} aria-label={info.aria}>
                                {info.text}
                              </div>
                            ) : null;
                          })()}
                        </td>
                        <td className="p-4 font-medium">${(trader.balance || 0).toFixed(2)}</td>
                         <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${(trader.equity || 0).toFixed(2)}</span>
                            {trader.open_positions > 0 && (
                              <span className="px-1.5 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 font-medium">
                                {trader.open_positions}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`p-4 ${profitColor(trader.profit_loss)}`}>${(trader.profit_loss || 0).toFixed(2)}</td>
                        <td className={`p-4 ${returnColor(trader.return)}`}>{(trader.return || 0).toFixed(2)}%</td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleOpenDetails(trader)}
                            className="px-4 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden divide-y divide-gray-800">
              {isLoading ? (
                // Show 5 skeleton cards while loading
                Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                sortedTraders.map((trader, index) => (
                  <div key={index} className={`p-4 space-y-3 ${trader.breached ? 'bg-red-600/20' : 'bg-[#0D11117] border border-gray-800 hover:border-cyan-500/50 transition-all'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-yellow-500 text-xl">{index + 1}.</span>
                      <span className="font-medium">{trader.contestant_name}</span>
                    
                    </div>
                    <div className="space-y-2">

                      <div className="flex justify-between">
                        <span className="text-gray-400">Balance</span>
                        <span className="font-medium">${(trader.balance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Equity</span>
                          {trader.open_positions > 0 && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 font-medium">
                              {trader.open_positions}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">${(trader.equity || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit/Loss</span>
                        <span className={`font-medium ${profitColor(trader.profit_loss)}`}>${(trader.profit_loss || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Return</span>
                        <span className={`font-medium ${returnColor(trader.return)}`}>{(trader.return || 0).toFixed(2)}%</span>
                      </div>
                      {trader.breached && (() => {
                        const info = getBreachInfo(trader);
                        return info ? (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Breach</span>
                            <span className={`font-medium ${info.class}`}>{info.text}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <button 
                      onClick={() => handleOpenDetails(trader)}
                      className="w-full mt-4 px-4 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add the dialog */}
      <TraderDetailsDialog
        isOpen={!!selectedTrader}
        onClose={() => setSelectedTrader(null)}
        trader={selectedTrader || {
          name: "",
          balance: "",
          equity: "",
          profit: "",
          return: "",
          bestDay: "",
          bestDayPercentage: "",
          todaysTrading: {
            volume: "",
            trades: 0,
            winRate: "",
            avgWin: "",
            avgLoss: "",
            largestTrade: "",
            profitFactor: ""
          },
          statistics: {
            totalTrades: 0,
            winRate: "",
            winningTrades: 0,
            losingTrades: 0,
            averageLotSize: 0,
            mostTradedSymbol: "",
            breached: false
          }
        }}
      />
    </div>
  );
}