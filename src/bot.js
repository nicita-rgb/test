const https = require('https');
const { google } = require('googleapis');

// Bot configuration
const BOT_TOKEN = '8838074382:AAGs_NVH-pKLm6JjrSseosaCyr1u8dVBTjY';
const SPREADSHEET_ID = '1X51o9DtQRcf7mKZz9f9QjUChlmFRS_nCUdo3GjWfhMM';

// Telegram Bot API endpoint
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Google Sheets configuration - using public published format
const SHEETS = {
  'жидкости': { label: 'Жидкости', range: 'A:B' },
  'железо': { label: 'Расходники (Железо)', range: 'A:B' },
  'устройства': { label: 'Устройства', range: 'A:C' }
};

// HTTP request helper for Telegram API
function telegramApi(method, data) {
  const url = `${TELEGRAM_API_URL}/${method}`;
  const postData = JSON.stringify(data);
  
  return new Promise((resolve, reject) => {
    const request = https.request(url, (response) => {
      let body = '';
      
      response.on('data', (chunk) => {
        body += chunk;
      });
      
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.write(postData);
    request.end();
  });
}

// Send message to Telegram
async function sendMessage(chatId, text, parseMode = 'Markdown') {
  try {
    await telegramApi('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Send document with keyboard
async function sendMenu(chatId) {
  const text = '🧪 *Каталог товаров*\n\nВыберите категорию:';
  
  // Using InlineKeyboard for buttons
  const inlineKeyboard = {
    inline_keyboard: [
      [{text: '🧪 Жидкости', callback_data: 'liquids'}],
      [{text: '🔧 Расходники (Железо)', callback_data: 'consumables'}],
      [{text: '⚡ Устройства', callback_data: 'devices'}]
    ]
  };
  
  try {
    await telegramApi('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify(inlineKeyboard)
    });
  } catch (error) {
    console.error('Error sending menu:', error);
  }
}

// Fetch data from Google Sheets (using published CSV format)
async function fetchSheetData(sheetName) {
  try {
    // Use the public published CSV format
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/pub?gid=0&single=true&output=csv&sheet=${sheetName}`;
    
    return new Promise((resolve, reject) => {
      const request = https.get(csvUrl, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          // Parse CSV
          const rows = parseCSV(body);
          resolve(rows);
        });
      });
      
      request.on('error', (error) => {
        console.error('Error fetching sheet:', error);
        resolve([]);
      });
    });
  } catch (error) {
    console.error('Error in fetchSheetData:', error);
    return [];
  }
}

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const rows = [];
  
  for (const line of lines) {
    // Handle quoted fields and commas within quotes
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else if (char === '"' && inQuotes && i + 1 < line.length && line[i + 1] === ',') {
        current += char;
        i++; // Skip closing quote
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  
  return rows;
}

// Format items from sheet data
function formatItems(data, category) {
  if (!data || data.length < 2) {
    return `📂 *${category}*\n\nВ этой категории пока нет товаров.`;
  }
  
  let message = `📂 *${category}*\n\n`;
  
  // First row is header
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const name = row[0] || '';
    const price = row[1] ? String(row[1]) : '';
    const status = row[2] ? String(row[2]) : '';
    
    // Skip empty rows
    if (!name && !price) continue;
    
    message += `🔹 *${name}*\n`;
    
    if (price) {
      message += `   💰 Цена: \`${price}\`\n`;
    }
    
    if (status) {
      const statusText = status.toLowerCase();
      if (statusText.includes('в наличии') || statusText === 'yes' || statusText === 'true') {
        message += `   ✅ *В наличии*\n`;
      } else if (statusText.includes('нет') || statusText === 'no' || statusText === 'false') {
        message += `   ❌ *Нет в наличии*\n`;
      }
    }
    
    message += `\n`;
  }
  
  return message;
}

// Handle incoming messages
async function handleUpdate(update) {
  const { message } = update;
  if (!message) return;
  
  const chatId = message.chat.id;
  const text = message.text || '';
  const replyMarkup = message.reply_markup;
  
  // Handle /start command
  if (text === '/start') {
    await sendMenu(chatId);
    return;
  }
  
  // Handle /help command
  if (text === '/help') {
    await sendMessage(chatId, 
      '🤖 *Справка*\n\n' +
      '/start - Показать меню категорий\n' +
      '/help - Показать справку\n\n' +
      'Выберите категорию из списка ниже!');
    return;
  }
  
  // Handle inline button clicks
  if (replyMarkup && replyMarkup.inline_keyboard) {
    const buttons = replyMarkup.inline_keyboard.flat();
    for (const btn of buttons) {
      if (btn.callback_data === 'liquids') {
        const data = await fetchSheetData('жидкости');
        const formatted = formatItems(data, 'Жидкости');
        await sendMessage(chatId, formatted);
        return;
      } else if (btn.callback_data === 'consumables') {
        const data = await fetchSheetData('железо');
        const formatted = formatItems(data, 'Расходники');
        await sendMessage(chatId, formatted);
        return;
      } else if (btn.callback_data === 'devices') {
        const data = await fetchSheetData('устройства');
        const formatted = formatItems(data, 'Устройства');
        await sendMessage(chatId, formatted);
        return;
      }
    }
  }
}

// Long polling to get updates from Telegram
async function longPolling() {
  try {
    const offsetUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=0&limit=5`;
    
    return new Promise((resolve, reject) => {
      const request = https.get(offsetUrl, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error in polling:', error);
    return [];
  }
}

// Start the bot
async function startBot() {
  console.log('🤖 Telegram Shop Bot starting...');
  console.log(`📋 Spreadsheet ID: ${SPREADSHEET_ID}`);
  
  let offset = -1;
  
  while (true) {
    try {
      const updates = await longPolling();
      
      for (const update of updates) {
        if (update.offset > offset) {
          offset = update.offset;
        }
        
        await handleUpdate(update);
      }
    } catch (error) {
      console.error('Error in polling loop:', error);
    }
    
    // Wait 1 second between polls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Start the bot
startBot().catch(error => {
  console.error('Failed to start bot:', error);
});

console.log('✅ Bot is running! Send /start in Telegram.');