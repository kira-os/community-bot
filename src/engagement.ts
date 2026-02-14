import { CommunityBot } from './bot';
import { TwitterApi } from 'twitter-api-v2';

interface EngagementEvent {
  userId: string;
  platform: 'twitter' | 'telegram' | 'discord';
  action: string;
  weight: number;
  timestamp: number;
}

export class EngagementTracker {
  private events: EngagementEvent[] = [];
  private scores: Map<string, number> = new Map();

  trackEvent(userId: string, platform: string, action: string, weight: number) {
    const event: EngagementEvent = {
      userId,
      platform: platform as any,
      action,
      weight,
      timestamp: Date.now(),
    };

    this.events.push(event);
    
    // Update user score
    const currentScore = this.scores.get(userId) || 0;
    this.scores.set(userId, currentScore + weight);
  }

  getUserScore(userId: string): number {
    return this.scores.get(userId) || 0;
  }

  getLeaderboard(limit: number = 10) {
    return Array.from(this.scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, score]) => ({ userId, score }));
  }

  calculateAirdropAmount(userId: string): number {
    const score = this.getUserScore(userId);
    // Formula: score * 0.1 KIRA per point
    return Math.floor(score * 0.1);
  }
}
