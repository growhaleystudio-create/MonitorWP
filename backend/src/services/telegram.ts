import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../db';

let botInstance: TelegramBot | null = null;
let lastBotToken = '';

/**
 * Gets or initializes the Telegram Bot instance using settings from the database.
 * If credentials are not set, returns null.
 */
export async function getTelegramBot(): Promise<TelegramBot | null> {
  try {
    const tokenSetting = await prisma.setting.findUnique({
      where: { key: 'telegram_bot_token' },
    });

    const botToken = tokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      botInstance = null;
      return null;
    }

    // If token hasn't changed and instance exists, return it
    if (botInstance && lastBotToken === botToken) {
      return botInstance;
    }

    // Initialize new bot
    lastBotToken = botToken;
    botInstance = new TelegramBot(botToken, { polling: false });
    return botInstance;
  } catch (error) {
    console.error('Error initializing Telegram Bot:', error);
    return null;
  }
}

/**
 * Sends a notification message to the Telegram channel/group configured in settings.
 */
export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    const bot = await getTelegramBot();
    if (!bot) {
      console.warn('Telegram Bot not configured. Message not sent:', message);
      return false;
    }

    const chatIdSetting = await prisma.setting.findUnique({
      where: { key: 'telegram_chat_id' },
    });

    const chatId = chatIdSetting?.value || process.env.TELEGRAM_CHAT_ID;

    if (!chatId) {
      console.warn('Telegram Chat ID not configured. Message not sent:', message);
      return false;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}
