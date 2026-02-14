import { CommunityBot } from './bot';
import { EngagementTracker } from './engagement';
import { AirdropDistributor } from './airdrop';

export function setupCommands(
  bot: CommunityBot,
  engagement: EngagementTracker,
  airdrop: AirdropDistributor
) {
  // Start command
  bot.bot.command('start', (ctx) => {
    ctx.reply(
      '🎉 Welcome to KIRA Community Bot!\n\n' +
      'Engage with the community to earn $KIRA rewards.\n\n' +
      'Commands:\n' +
      '/leaderboard - Top community members\n' +
      '/score - Check your engagement score\n' +
      '/airdrop - Claim your $KIRA airdrop\n' +
      '/help - Show all commands'
    );
  });

  // Help command
  bot.bot.command('help', (ctx) => {
    ctx.reply(
      '🤖 KIRA Community Bot Commands:\n\n' +
      '/start - Get started\n' +
      '/leaderboard - Top 10 members\n' +
      '/score - Your engagement score\n' +
      '/airdrop - Claim rewards\n' +
      '/stats - Global stats\n' +
      '/help - Show this message'
    );
  });

  // Leaderboard command
  bot.bot.command('leaderboard', (ctx) => {
    const leaders = engagement.getLeaderboard(10);
    
    if (leaders.length === 0) {
      ctx.reply('No engagement data yet. Start engaging to earn points!');
      return;
    }

    let message = '🏆 Top Community Members:\n\n';
    leaders.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '•';
      message += `${medal} ${index + 1}. User ${user.userId.slice(0, 8)}... - ${user.score} points\n`;
    });

    ctx.reply(message);
  });

  // Score command
  bot.bot.command('score', (ctx) => {
    const userId = ctx.from?.id.toString() || '';
    const score = engagement.getUserScore(userId);
    const airdropAmount = engagement.calculateAirdropAmount(userId);

    ctx.reply(
      `📊 Your Stats:\n\n` +
      `Engagement Score: ${score} points\n` +
      `Airdrop Eligible: ${airdropAmount} $KIRA\n\n` +
      `Keep engaging to earn more rewards!`
    );
  });

  // Airdrop command
  bot.bot.command('airdrop', async (ctx) => {
    const userId = ctx.from?.id.toString() || '';
    const amount = engagement.calculateAirdropAmount(userId);

    if (amount === 0) {
      ctx.reply('❌ You need at least 10 engagement points to claim an airdrop. Keep engaging!');
      return;
    }

    // Request wallet address
    ctx.reply(
      `🎉 You have ${amount} $KIRA available!\n\n` +
      `Reply with your Solana wallet address to receive the airdrop.`
    );
  });

  // Stats command
  bot.bot.command('stats', (ctx) => {
    const leaders = engagement.getLeaderboard(100);
    const totalUsers = leaders.length;
    const totalPoints = leaders.reduce((sum, u) => sum + u.score, 0);

    ctx.reply(
      `📈 Global Stats:\n\n` +
      `Total Users: ${totalUsers}\n` +
      `Total Engagement: ${totalPoints} points\n` +
      `Average Score: ${totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0} points\n\n` +
      `Join the community and start earning!`
    );
  });
}
