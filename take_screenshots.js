const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
      args: ['--allow-file-access-from-files']
  });
  const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
  });
  
  const targetUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  console.log("Navigating to", targetUrl);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  
  if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
  }

  for (let i = 0; i < 8; i++) {
      await page.evaluate((idx) => {
          if (typeof changeState === 'function') {
              window.changeState('GAME_ACTIVE', idx);
              // Force into PLAYING state bypassing CHECK_IN
              if (window.gameStateWrapper) {
                  window.gameStateWrapper.state = 'PLAYING';
                  window.gameStateWrapper.activePlayers = [true, true, true, true];
              }
          } else {
              console.error("changeState not found");
          }
      }, i);
      
      // Give it 1.5 seconds to render some gameplay action
      await page.waitForTimeout(1500);
      
      // If there's an internal update loop, trigger it if not running
      // But gameLoop should be running already!
      const names = ['quick_draw', 'gold_rush', 'lasso_catch', 'bandit_whack', 'dynamite_toss', 'horse_race', 'snake_bite', 'telegraph_decoder'];
      const gameName = names[i];
      
      await page.screenshot({ path: `screenshots/${gameName}.png` });
      console.log(`Saved screenshot for ${gameName}`);
  }

  await browser.close();
})();
