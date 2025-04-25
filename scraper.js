/**
 * Ostium Analyzer - Web Scraping Tool
 * 
 * This tool provides functionality to scrape trading data from Ostium.
 * It can be run directly in a browser console when on Ostium's website,
 * or used with Node.js and Puppeteer for automated scraping.
 */

// Browser-compatible version (can be run in browser console)
const OstiumScraper = {
  /**
   * Extract visible trades from the current DOM
   * Run this directly in browser console when on Ostium history page
   */
  extractVisibleTrades: function() {
    console.log('🔍 Extracting visible trades from current view...');
    const trades = [];
    
    // Find the table rows - adjust selector based on actual Ostium HTML structure
    const rows = document.querySelectorAll('tr');
    let headerFound = false;
    
    rows.forEach(row => {
      // Look for header to identify the trade table
      if (!headerFound && row.textContent.includes('Market & Side')) {
        headerFound = true;
        console.log('✅ Found trade table header');
        return;
      }
      
      // Skip if not a data row (we want rows after we found the header)
      if (!headerFound || row.children.length < 6) return;
      
      try {
        // Extract data from columns - indexes may need adjustment
        const columns = Array.from(row.querySelectorAll('td'));
        
        // Skip if not enough columns
        if (columns.length < 6) return;
        
        // Extract date/time
        const dateTimeCol = columns[0];
        const dateTimeText = dateTimeCol ? dateTimeCol.textContent.trim() : '';
        const [date, time] = dateTimeText.split(' ');
        
        // Extract market and side
        const marketSideCol = columns[1] || columns[2];
        const marketSideText = marketSideCol ? marketSideCol.textContent.trim() : '';
        const marketMatch = marketSideText.match(/(ETH|SOL|BTC|[A-Z]+)\/USD/i);
        const market = marketMatch ? marketMatch[0] : 'Unknown';
        
        // Try to extract side and leverage
        const sideMatch = marketSideText.match(/(Short|Long)\s+(\d+\.\d+x)/i);
        const side = sideMatch ? sideMatch[1] : 'Unknown';
        const leverage = sideMatch ? sideMatch[2] : '0x';
        
        // Find size column (adjust index as needed)
        const sizeCol = columns.find(col => col.textContent.includes(','));
        const sizeText = sizeCol ? sizeCol.textContent.trim() : '0';
        const size = parseFloat(sizeText.replace(/,/g, '')) || 0;
        
        // Find collateral column
        const collateralCol = columns.find(col => col.textContent.includes('USDC'));
        const collateralText = collateralCol ? 
          collateralCol.textContent.trim().replace('USDC', '') : '0';
        const collateral = parseFloat(collateralText.replace(/,/g, '')) || 0;
        
        // Find operation type
        const operationCol = columns.find(col => 
          ['Open', 'Close', 'Cancelled'].some(op => col.textContent.includes(op))
        );
        const operationText = operationCol ? operationCol.textContent.trim() : '';
        const operationType = operationText.includes('Open') ? 'Open' : 
                             operationText.includes('Close') ? 'Close' : 'Unknown';
        
        // Find price column
        const priceCol = columns.find(col => 
          !isNaN(parseFloat(col.textContent.replace(/,/g, ''))) && 
          !col.textContent.includes('USDC') &&
          !col.textContent.includes('$')
        );
        const priceText = priceCol ? priceCol.textContent.trim() : '0';
        const price = parseFloat(priceText.replace(/,/g, '')) || 0;
        
        // Find PnL column (if available)
        const pnlCol = columns.find(col => 
          col.textContent.includes('+') || col.textContent.includes('-')
        );
        let pnl = null;
        if (pnlCol && operationType === 'Close') {
          const pnlText = pnlCol.textContent.trim();
          pnl = parseFloat(pnlText.replace(/[+$,]/g, '')) || 0;
          // If it's negative, ensure the sign is preserved
          if (pnlText.includes('-')) pnl = -pnl;
        }
        
        // Add to trades array if we have the minimum required data
        if (date && market && operationType) {
          trades.push({
            date,
            time: time || '',
            market,
            side,
            leverage,
            size,
            collateral,
            operationType,
            price,
            pnl
          });
        }
      } catch (error) {
        console.error('Error processing row:', error);
      }
    });
    
    console.log(`✅ Extracted ${trades.length} trades`);
    
    // Save to JSON in browser
    if (trades.length > 0) {
      const jsonString = JSON.stringify(trades, null, 2);
      
      // Create download link
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "ostium_trades.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      console.log('💾 Trades saved to ostium_trades.json');
    }
    
    return trades;
  },
  
  /**
   * Auto-scrolling function to load more trades
   * Run this in browser console when on Ostium history page
   */
  autoScroll: async function(scrollDelay = 1000, maxScrolls = 20) {
    console.log('🔄 Starting auto-scroll to load more trades...');
    
    // Find the scrollable container
    const scrollableContainer = document.querySelector('.trade-history-table')?.parentElement || 
                               document.querySelector('table')?.parentElement;
    
    if (!scrollableContainer) {
      console.error('❌ Could not find scrollable container');
      return false;
    }
    
    let lastHeight = scrollableContainer.scrollHeight;
    let scrollCount = 0;
    let reachedEnd = false;
    
    while (!reachedEnd && scrollCount < maxScrolls) {
      // Scroll to bottom
      scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
      scrollCount++;
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, scrollDelay));
      
      // Check if we've reached the end (no new content loaded)
      if (lastHeight === scrollableContainer.scrollHeight) {
        console.log('✅ Reached end of content');
        reachedEnd = true;
      } else {
        lastHeight = scrollableContainer.scrollHeight;
        console.log(`📜 Scroll ${scrollCount}: loaded more content`);
      }
    }
    
    if (scrollCount >= maxScrolls) {
      console.log(`⚠️ Reached maximum scroll limit (${maxScrolls})`);
    }
    
    console.log('🏁 Auto-scroll complete. Extracting trades...');
    return this.extractVisibleTrades();
  }
};

// Script for running in browser
function runOstiumScraper() {
  console.log('🚀 Ostium Analyzer Scraper');
  console.log('Make sure you are on the Ostium trading history page');
  console.log('Starting auto-scroll to load all trades...');
  
  OstiumScraper.autoScroll()
    .then(trades => {
      console.log(`Extracted ${trades.length} trades in total`);
    })
    .catch(error => {
      console.error('Error running scraper:', error);
    });
}

// For Node.js with Puppeteer (server-side)
// Uncomment this section when running in Node.js
/*
const puppeteer = require('puppeteer');

async function scrapeOstiumWithPuppeteer(accountAddress) {
  console.log(`Starting Puppeteer scraper for account: ${accountAddress}`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to Ostium account page
    await page.goto(`https://ostium.app/portfolio/preview?address=${accountAddress}&restricted=true`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('Loaded Ostium page, waiting for content...');
    
    // Wait for trade history to load
    await page.waitForSelector('table', { timeout: 30000 });
    
    // Click on History tab if needed
    const historyTabSelector = 'button:has-text("History")';
    const historyTab = await page.$(historyTabSelector);
    if (historyTab) {
      console.log('Clicking History tab...');
      await historyTab.click();
      await page.waitForTimeout(2000);
    }
    
    // Inject scraper into page
    const trades = await page.evaluate(() => {
      // Define the scraper in page context
      const scraper = {
        extractVisibleTrades: function() {
          const trades = [];
          const rows = document.querySelectorAll('tr');
          let headerFound = false;
          
          rows.forEach(row => {
            if (!headerFound && row.textContent.includes('Market & Side')) {
              headerFound = true;
              return;
            }
            
            if (!headerFound || row.children.length < 6) return;
            
            try {
              // Extract data (similar to browser version)
              const columns = Array.from(row.querySelectorAll('td'));
              if (columns.length < 6) return;
              
              // (Same extraction logic as the browser version)
              // ...
              
              // Simplified version for this example:
              const dateTimeText = columns[0].textContent.trim();
              const [date, time] = dateTimeText.split(' ');
              
              const marketSideText = columns[1].textContent.trim();
              const marketMatch = marketSideText.match(/(ETH|SOL|BTC|[A-Z]+)\/USD/i);
              const market = marketMatch ? marketMatch[0] : 'Unknown';
              
              const sideMatch = marketSideText.match(/(Short|Long)\s+(\d+\.\d+x)/i);
              const side = sideMatch ? sideMatch[1] : 'Unknown';
              const leverage = sideMatch ? sideMatch[2] : '0x';
              
              const size = parseFloat(columns[2].textContent.replace(/,/g, '')) || 0;
              const collateral = parseFloat(columns[3].textContent.replace(/,/g, '')) || 0;
              const operationType = columns[4].textContent.includes('Open') ? 'Open' : 'Close';
              const price = parseFloat(columns[5].textContent.replace(/,/g, '')) || 0;
              
              let pnl = null;
              if (operationType === 'Close' && columns[6]) {
                const pnlText = columns[6].textContent.trim();
                pnl = parseFloat(pnlText.replace(/[+$,]/g, '')) || 0;
                if (pnlText.includes('-')) pnl = -pnl;
              }
              
              trades.push({
                date, time, market, side, leverage,
                size, collateral, operationType, price, pnl
              });
            } catch (error) {
              console.error('Error processing row:', error);
            }
          });
          
          return trades;
        }
      };
      
      return scraper.extractVisibleTrades();
    });
    
    console.log(`Initial extraction: ${trades.length} trades`);
    
    // Auto-scroll to load more content
    let lastTradeCount = trades.length;
    let triesWithNoNewTrades = 0;
    const allTrades = [...trades];
    
    while (triesWithNoNewTrades < 3) {
      // Scroll down
      await page.evaluate(() => {
        const container = document.querySelector('table').parentElement;
        container.scrollTop = container.scrollHeight;
      });
      
      // Wait for potential new content
      await page.waitForTimeout(2000);
      
      // Extract trades again
      const newTrades = await page.evaluate(() => {
        // Simplified extraction for this example
        const trades = [];
        const rows = document.querySelectorAll('tr');
        // (Same extraction logic)
        // ...
        return trades;
      });
      
      console.log(`Extracted ${newTrades.length} trades after scrolling`);
      
      // Check if we have new trades
      if (newTrades.length > lastTradeCount) {
        // Add only new trades
        allTrades.push(...newTrades.slice(lastTradeCount));
        lastTradeCount = newTrades.length;
        triesWithNoNewTrades = 0;
      } else {
        triesWithNoNewTrades++;
        console.log(`No new trades found (attempt ${triesWithNoNewTrades}/3)`);
      }
    }
    
    console.log(`Total trades extracted: ${allTrades.length}`);
    
    // Save to file (in Node.js)
    const fs = require('fs');
    fs.writeFileSync('ostium_trades.json', JSON.stringify(allTrades, null, 2));
    console.log('Saved trades to ostium_trades.json');
    
    return allTrades;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Export for Node.js
module.exports = {
  scrapeOstiumWithPuppeteer
};

// Example usage:
// const scraper = require('./scraper');
// scraper.scrapeOstiumWithPuppeteer('0x2e93f627bf36480b3ab1065dcbee95350bc7c99c')
//   .then(trades => console.log(`Scraped ${trades.length} trades`))
//   .catch(console.error);
*/

// If running directly in browser, uncomment this line:
// runOstiumScraper(); 