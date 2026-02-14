const { Telegraf } = require('telegraf');

class CommunityBot {
  constructor(token) {
    this.bot = new Telegraf(token);
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.command('start', (ctx) => {
      ctx.reply('Welcome to KIRA Community Bot! 🎉\nEngage to earn $KIRA rewards.');
    });

    this.bot.command('leaderboard', (ctx) => {
      ctx.reply('Top Community Members:\n1. @user1 - 1000 points\n2. @user2 - 850 points\n3. @user3 - 720 points');
    });
  }

  start() {
    console.log('Community bot starting...');
    this.bot.launch();
  }
}

module.exports = { CommunityBot };
