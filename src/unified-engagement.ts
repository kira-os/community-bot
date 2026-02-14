import { EngagementTracker } from './engagement';
import { XTracker } from './x-tracker';

interface UnifiedEngagementScore {
  userId: string;
  username: string;
  platforms: {
    twitter?: number;
    telegram?: number;
    discord?: number;
  };
  totalScore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  airdropEligible: number;
  lastActivity: number;
}

export class UnifiedEngagementSystem {
  private engagement: EngagementTracker;
  private xTracker: XTracker;
  private scores: Map<string, UnifiedEngagementScore> = new Map();

  constructor(
    twitterApiKey: string,
    twitterApiSecret: string,
    twitterAccessToken: string,
    twitterAccessSecret: string
  ) {
    this.engagement = new EngagementTracker();
    this.xTracker = new XTracker(
      twitterApiKey,
      twitterApiSecret,
      twitterAccessToken,
      twitterAccessSecret
    );
  }

  // Track X mention
  async trackXMention(tweetId: string, userId: string, username: string, action: string) {
    const weight = this.getXWeight(action);
    this.engagement.trackEvent(userId, 'twitter', action, weight);
    
    this.updateUnifiedScore(userId, username, 'twitter', weight);
  }

  // Track X like
  async trackXLike(userId: string, username: string, tweetId: string) {
    const weight = 5; // Likes worth 5 points
    this.engagement.trackEvent(userId, 'twitter', 'like', weight);
    
    this.updateUnifiedScore(userId, username, 'twitter', weight);
  }

  // Track X reply
  async trackXReply(userId: string, username: string, tweetId: string) {
    const weight = 20; // Replies worth 20 points
    this.engagement.trackEvent(userId, 'twitter', 'reply', weight);
    
    this.updateUnifiedScore(userId, username, 'twitter', weight);
  }

  // Track Telegram engagement
  trackTelegram(userId: string, username: string, action: string) {
    const weight = this.getTelegramWeight(action);
    this.engagement.trackEvent(userId, 'telegram', action, weight);
    
    this.updateUnifiedScore(userId, username, 'telegram', weight);
  }

  // Track Discord engagement
  trackDiscord(userId: string, username: string, action: string) {
    const weight = this.getDiscordWeight(action);
    this.engagement.trackEvent(userId, 'discord', action, weight);
    
    this.updateUnifiedScore(userId, username, 'discord', weight);
  }

  private updateUnifiedScore(
    userId: string, 
    username: string, 
    platform: 'twitter' | 'telegram' | 'discord',
    points: number
  ) {
    const existing = this.scores.get(userId) || {
      userId,
      username,
      platforms: {},
      totalScore: 0,
      tier: 'bronze',
      airdropEligible: 0,
      lastActivity: Date.now(),
    };

    existing.platforms[platform] = (existing.platforms[platform] || 0) + points;
    existing.totalScore += points;
    existing.tier = this.calculateTier(existing.totalScore);
    existing.airdropEligible = this.calculateAirdrop(existing.totalScore);
    existing.lastActivity = Date.now();

    this.scores.set(userId, existing);
  }

  private calculateTier(score: number): UnifiedEngagementScore['tier'] {
    if (score >= 10000) return 'diamond';
    if (score >= 5000) return 'platinum';
    if (score >= 2000) return 'gold';
    if (score >= 500) return 'silver';
    return 'bronze';
  }

  private calculateAirdrop(score: number): number {
    // 0.1 KIRA per point, max 1000 KIRA
    return Math.min(Math.floor(score * 0.1), 1000);
  }

  private getXWeight(action: string): number {
    const weights: Record<string, number> = {
      mention: 10,
      like: 5,
      reply: 20,
      retweet: 15,
      quote: 25,
    };
    return weights[action] || 5;
  }

  private getTelegramWeight(action: string): number {
    const weights: Record<string, number> = {
      message: 1,
      reaction: 2,
      invite: 10,
      command: 3,
    };
    return weights[action] || 1;
  }

  private getDiscordWeight(action: string): number {
    const weights: Record<string, number> = {
      message: 1,
      reaction: 2,
      voice: 5,
      invite: 10,
    };
    return weights[action] || 1;
  }

  getLeaderboard(limit: number = 20): UnifiedEngagementScore[] {
    return Array.from(this.scores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  getUserScore(userId: string): UnifiedEngagementScore | null {
    return this.scores.get(userId) || null;
  }

  getTierStats() {
    const stats = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
    
    for (const score of this.scores.values()) {
      stats[score.tier]++;
    }
    
    return stats;
  }

  // Scan X for mentions of Kira
  async scanXMentions() {
    const events = await this.xTracker.searchMentions('kira OR @kiraos OR $KIRA', 100);
    
    for (const event of events) {
      await this.trackXMention(
        event.tweetId,
        event.userId,
        event.username,
        event.action
      );
    }
    
    return events.length;
  }
}
