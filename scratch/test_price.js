const { getExchange } = require('./backend/config/exchange');
require('dotenv').config({ path: './backend/.env' });

async function test() {
  try {
    const exchange = getExchange();
    const symbol = 'BSB/USDT';
    console.log(`Fetching ticker for ${symbol}...`);
    const ticker = await exchange.fetchTicker(symbol);
    console.log('Ticker result:', ticker.last);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
