const puppeteer = require('../remotion-studio/node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 1. Generate live valid tokens from backend
const tokensJson = execSync(
  `PYTHONPATH=backend python -c "
from app.security import create_access_token
import json

coach_token = create_access_token('coach-1')
speaker_token = create_access_token('speaker-90d729a7')

print(json.dumps({
  'coach_token': coach_token,
  'coach_user': {
    'id': 'coach-1',
    'email': 'kassimmusa322@gmail.com',
    'full_name': 'Head Coach Qassim',
    'role': 'coach',
    'is_head_coach': True
  },
  'speaker_token': speaker_token,
  'speaker_user': {
    'id': 'speaker-90d729a7',
    'email': 'anyonageoffrey49@gmail.com',
    'full_name': 'Geoffrey Anyona',
    'role': 'speaker'
  }
}))
"`,
  { cwd: path.resolve(__dirname, '..') }
).toString().trim();

const authData = JSON.parse(tokensJson);

async function run() {
  const screenshotsDir = path.resolve(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // ----------------------------------------------------
  // 1. Landing Page
  // ----------------------------------------------------
  console.log('1. Capturing 01_landing_page.png...');
  await page.goto('http://localhost:5174/?portal=landing', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('globalorators_portal', 'landing');
  });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(screenshotsDir, '01_landing_page.png') });
  console.log('Saved 01_landing_page.png');

  // ----------------------------------------------------
  // 2. Coach OS Dashboard
  // ----------------------------------------------------
  console.log('2. Capturing 02_coach_dashboard.png...');
  await page.evaluate((auth) => {
    localStorage.clear();
    localStorage.setItem('globalorators_portal', 'coach_os');
    localStorage.setItem('globalorators_token', auth.coach_token);
    localStorage.setItem('globalorators_user', JSON.stringify(auth.coach_user));
  }, authData);
  await page.goto('http://localhost:5174/?portal=coach_os', { waitUntil: 'domcontentloaded' });
  // Wait for sidebar and wait until the splash screen is fully gone
  await page.waitForSelector('#sidebar-navigation', { visible: true, timeout: 15000 });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(screenshotsDir, '02_coach_dashboard.png') });
  console.log('Saved 02_coach_dashboard.png');

  // ----------------------------------------------------
  // 3. Client Roster (Speakers & Debaters)
  // ----------------------------------------------------
  console.log('3. Capturing 04_client_roster.png...');
  await page.waitForSelector('#nav-link-clients', { visible: true, timeout: 5000 });
  await page.click('#nav-link-clients');
  await page.waitForFunction(
    () => document.body.innerText.includes('Speaker & Debater Roster'),
    { timeout: 8000 }
  );
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, '04_client_roster.png') });
  console.log('Saved 04_client_roster.png');

  // ----------------------------------------------------
  // 4. Speaker Portal (Chamber)
  // ----------------------------------------------------
  console.log('4. Capturing 03_speaker_portal.png...');
  await page.evaluate((auth) => {
    localStorage.clear();
    localStorage.setItem('globalorators_portal', 'speaker_app');
    localStorage.setItem('globalorators_token', auth.speaker_token);
    localStorage.setItem('globalorators_user', JSON.stringify(auth.speaker_user));
    localStorage.setItem('globalorators_speaker_profile', JSON.stringify({
      branch: 'Academy',
      fullName: 'Geoffrey Anyona',
      email: 'anyonageoffrey49@gmail.com',
      institution: 'Strathmore University Debate Society',
      primaryDiscipline: 'British Parliamentary',
      coreFocus: 'Prime Minister Rebuttal & Whip Extension',
      missionFocus: 'Decolonizing Pan-African Curricula',
      speakingGoal: 'Championship Break at PAUDC 2026',
      experienceLevel: 'Varsity',
      vocalBaselinePace: 145,
      emotionalOpennessRating: 9,
      selectedHabits: ['cadence', 'rebuttal', 'framing']
    }));
  }, authData);
  await page.goto('http://localhost:5174/?portal=speaker_app', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(screenshotsDir, '03_speaker_portal.png') });
  console.log('Saved 03_speaker_portal.png');

  await browser.close();
  console.log('All 4 live screens captured successfully with exact selectors!');
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
