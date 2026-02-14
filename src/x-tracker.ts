import { TwitterApi } from 'twitter-api-v2';

interface XEngagementEvent {
  userId: string;
  username: string;
  tweetId: string;
  action: 'mention' | 'like' | 'reply' | 'retweet';
  content?: string;
  weight: number;
  timestamp: number;
}

export class XTracker {
  private client: TwitterApi;
  private lastCheckedMention: string | null = null;
  private processedTweets: Set<string> = new Set();

  constructor(apiKey: string, apiSecret: string, accessToken: string, accessSecret: string) {
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
  }

  async searchMentions(query: string = 'kira OR @kiraos OR $KIRA', maxResults: number = 100) {
    try {
      const tweets = await this.client.v2.search(query, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'author_id', 'public_metrics', 'referenced_tweets'],
        'user.fields': ['username', 'public_metrics'],
        expansions: ['author_id'],
      });

      const events: XEngagementEvent[] = [];

      for await (const tweet of tweets) {
        // Skip already processed
        if (this.processedTweets.has(tweet.id)) continue;
        this.processedTweets.add(tweet.id);

        // Get author info
        const author = tweets.includes?.users?.find(u => u.id === tweet.author_id);
        if (!author) continue;

        // Determine action type
        let action: XEngagementEvent['action'] = 'mention';
        let weight = 10; // Base weight for mention

        if (tweet.referenced_tweets) {
          for (const ref of tweet.referenced_tweets) {
            if (ref.type === 'replied_to') {
              action = 'reply';
              weight = 20; // Replies worth more
            } else if (ref.type === 'retweeted') {
              action = 'retweet';
              weight = 15;
            }
          }
        }

        // Bonus for engagement on the tweet
        const metrics = tweet.public_metrics;
        if (metrics) {
          weight += Math.min(metrics.like_count || 0, 50); // Cap at 50 likes
        }

        events.push({
          userId: tweet.author_id,
          username: author.username,
          tweetId: tweet.id,
          action,
          content: tweet.text?.slice(0, 100),
          weight,
          timestamp: new Date(tweet.created_at || Date.now()).getTime(),
        });
      }

      return events;
    } catch (error) {
      console.error('Error searching mentions:', error);
      return [];
    }
  }

  async getUserEngagement(userId: string, tweetId: string) {
    try {
      // Check if user liked the tweet
      const likers = await this.client.v2.tweetLikedBy(tweetId, { max_results: 100 });
      const hasLiked = likers.data?.some(user => user.id === userId);

      // Check if user retweeted
      const retweeters = await this.client.v2.tweetRetweetedBy(tweetId, { max_results: 100 });
      const hasRetweeted = retweeters.data?.some(user => user.id === userId);

      return {
        liked: hasLiked || false,
        retweeted: hasRetweeted || false,
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return { liked: false, retweeted: false };
    }
  }

  async trackEngagementForTweet(tweetId: string) {
    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'created_at'],
      });

      const metrics = tweet.data.public_metrics;
      
      return {
        likes: metrics?.like_count || 0,
        replies: metrics?.reply_count || 0,
        retweets: metrics?.retweet_count || 0,
        quotes: metrics?.quote_count || 0,
        impressions: metrics?.impression_count || 0,
      };
    } catch (error) {
      console.error('Error tracking engagement:', error);
      return null;
    }
  }

  // Stream mentions in real-time (requires Elevated access)
  async startStream(onEvent: (event: XEngagementEvent) => void) {
    try {
      const stream = await this.client.v2.searchStream({
        'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
      });

      for await (const { data } of stream) {
        if (!data) continue;

        const event: XEngagementEvent = {
          userId: data.author_id,
          username: data.author_id, // Would need to look up username
          tweetId: data.id,
          action: 'mention',
          content: data.text?.slice(0, 100),
          weight: 10,
          timestamp: Date.now(),
        };

        onEvent(event);
      }
    } catch (error) {
      console.error('Stream error:', error);
    }
  }
}
