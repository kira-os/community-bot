'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  tier: string;
  interactions: number;
}

export default function CommunityDashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLeaderboard([
        { rank: 1, username: 'early_supporter', score: 2840, tier: 'Diamond', interactions: 142 },
        { rank: 2, username: 'solana_maxi', score: 2150, tier: 'Platinum', interactions: 108 },
        { rank: 3, username: 'kira_fan', score: 1890, tier: 'Gold', interactions: 95 },
        { rank: 4, username: 'defi_builder', score: 1520, tier: 'Gold', interactions: 76 },
        { rank: 5, username: 'ai_enthusiast', score: 1240, tier: 'Silver', interactions: 62 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Diamond: 'text-purple-400 bg-purple-400/10',
      Platinum: 'text-cyan-400 bg-cyan-400/10',
      Gold: 'text-yellow-400 bg-yellow-400/10',
      Silver: 'text-slate-400 bg-slate-400/10',
      Bronze: 'text-orange-400 bg-orange-400/10',
    };
    return colors[tier] || colors.Bronze;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Bot</h1>
          <p className="text-slate-400">Engagement tracking, rewards, and community stats</p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Bot Active
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Members" value="1,247" change="+23 today" color="blue" />
          <StatCard title="Active Today" value="89" change="+12" color="green" />
          <StatCard title="Messages" value="3.2K" change="+456" color="purple" />
          <StatCard title="Rewards Given" value="284" change="+18" color="orange" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🏆 Leaderboard</h2>
            {loading ? (
              <p className="text-slate-400">Loading leaderboard...</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono w-6">#{entry.rank}</span>
                      <span className="font-medium">@{entry.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(entry.tier)}`}>
                        {entry.tier}
                      </span>
                      <span className="text-slate-400 text-sm">{entry.score.toLocaleString()} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Engagement Tiers</h2>
            <div className="space-y-4">
              <TierRow name="Diamond" min="2000" color="text-purple-400" />
              <TierRow name="Platinum" min="1500" color="text-cyan-400" />
              <TierRow name="Gold" min="1000" color="text-yellow-400" />
              <TierRow name="Silver" min="500" color="text-slate-400" />
              <TierRow name="Bronze" min="0" color="text-orange-400" />
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>Built by Kira • Updated Feb 14, 2026 • Lunar New Year Launch in 3 days</p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, color }: { title: string; value: string; change: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
  };

  return (
    <div className={`p-6 rounded-lg border ${colors[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-green-400 text-sm mt-2">{change}</div>
    </div>
  );
}

function TierRow({ name, min, color }: { name: string; min: string; color: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
      <span className={`font-medium ${color}`}>{name}</span>
      <span className="text-slate-400 text-sm">{min}+ points</span>
    </div>
  );
}
