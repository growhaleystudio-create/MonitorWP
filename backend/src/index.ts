import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { validateAgentKey, validateDashboardSession, JWT_SECRET } from './middleware/auth';
import { handleAgentPush } from './controllers/agentController';
import {
  getOverview,
  listSites,
  getSiteDetail,
  createSite,
  updateSite,
  deleteSite,
  listPlugins,
  listLogs,
  getSettings,
  saveSettings,
  testTelegram,
} from './controllers/dashboardController';
import { startUptimeScheduler, runUptimeCycleImmediateAwaited } from './services/uptime';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Database Seeding ---
async function seedDefaultSettings() {
  const defaultSettings = [
    { key: 'uptime_interval_minutes', value: '5' },
    { key: 'alert_on_site_down', value: 'true' },
    { key: 'alert_on_plugin_expired', value: 'true' },
    { key: 'alert_on_plugin_update', value: 'true' },
    { key: 'alert_on_error_spike_threshold', value: '10' },
    { key: 'alert_on_injection', value: 'true' },
    { key: 'alert_on_login_failed', value: 'true' },
  ];

  try {
    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {}, // don't overwrite if it already exists
        create: setting,
      });
    }
    console.log('Default settings seeded successfully.');
  } catch (error) {
    console.error('Error seeding default settings:', error);
  }
}

// --- Auth Routes ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin';

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, username });
  }

  res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/auth/me', validateDashboardSession, (req, res) => {
  res.json({ username: req.adminUser.username });
});

// --- WordPress Agent Route ---
app.post('/api/agent/push', validateAgentKey, handleAgentPush);

import { checkSystemUpdate } from './services/updateChecker';

// --- System Info Route ---
app.get('/api/system/version', async (req, res) => {
  try {
    const versionInfo = await checkSystemUpdate();
    res.json(versionInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Dashboard API Routes (Protected) ---
app.get('/api/dashboard/overview', validateDashboardSession, getOverview);
app.get('/api/dashboard/sites', validateDashboardSession, listSites);
app.get('/api/dashboard/sites/:id', validateDashboardSession, getSiteDetail);
app.post('/api/dashboard/sites', validateDashboardSession, createSite);
app.put('/api/dashboard/sites/:id', validateDashboardSession, updateSite);
app.delete('/api/dashboard/sites/:id', validateDashboardSession, deleteSite);

app.get('/api/dashboard/plugins', validateDashboardSession, listPlugins);
app.get('/api/dashboard/logs', validateDashboardSession, listLogs);

app.get('/api/dashboard/settings', validateDashboardSession, getSettings);
app.post('/api/dashboard/settings', validateDashboardSession, saveSettings);
app.post('/api/dashboard/settings/test-telegram', validateDashboardSession, testTelegram);

// --- Cron Route for Serverless (Vercel) ---
app.get('/api/cron/check-uptime', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await runUptimeCycleImmediateAwaited();
    res.json({ success: true, message: 'Uptime checks completed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Serve Frontend Static Files (Production) ---
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Fallback to index.html for React SPA Router (Production)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// --- Start Server ---
async function startServer() {
  await seedDefaultSettings();
  
  if (process.env.VERCEL) {
    console.log('Running in Vercel Serverless environment.');
    return;
  }

  // Start background uptime checking scheduler (standard server only)
  startUptimeScheduler();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
  });
} else {
  // Run seeding on serverless start
  seedDefaultSettings().catch((error) => {
    console.error('Failed to seed default settings on Vercel:', error);
  });
}

export default app;
