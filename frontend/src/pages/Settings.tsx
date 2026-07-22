import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PetLoader from '../components/PetLoader';
import {
  Send,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Bell,
  Clock,
  Mail,
  HelpCircle
} from 'lucide-react';

interface SettingsData {
  telegram_bot_token: string;
  telegram_chat_id: string;
  uptime_interval: string;
  telegram_notifications_enabled: string;
  email_notifications_enabled: string;
  email_recipient: string;
}

function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    telegram_bot_token: '',
    telegram_chat_id: '',
    uptime_interval: '5',
    telegram_notifications_enabled: 'true',
    email_notifications_enabled: 'false',
    email_recipient: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/dashboard/settings');
        setSettings({
          telegram_bot_token: response.data.telegram_bot_token || '',
          telegram_chat_id: response.data.telegram_chat_id || '',
          uptime_interval: response.data.uptime_interval || '5',
          telegram_notifications_enabled: response.data.telegram_notifications_enabled ?? 'true',
          email_notifications_enabled: response.data.email_notifications_enabled ?? 'false',
          email_recipient: response.data.email_recipient || '',
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
        setStatusMsg({ type: 'error', text: 'Failed to load system settings.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      await axios.post('/api/dashboard/settings', settings);
      setStatusMsg({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      console.error('Failed to save settings:', err);
      setStatusMsg({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestLoading(true);
    setStatusMsg(null);

    try {
      const res = await axios.post('/api/dashboard/settings/test-telegram', {
        botToken: settings.telegram_bot_token,
        chatId: settings.telegram_chat_id,
      });

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'Telegram test message delivered successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: `Telegram test failed: ${res.data.error || 'Unknown error'}` });
      }
    } catch (err: any) {
      console.error('Test Telegram failed:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to send Telegram test notification.',
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full items-center justify-center">
        <PetLoader size={64} state="running" text="Loading system preferences..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">System Settings</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard Settings</h2>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-start gap-2.5 shadow-xs ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-600 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (Inputs) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Telegram Credentials Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs p-6 flex flex-col gap-5 border-l-4 border-l-primary-teal">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Send className="h-4.5 w-4.5 text-primary-teal" />
              Telegram Bot Credentials
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Telegram Bot Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={settings.telegram_bot_token}
                  onChange={(e) => handleInputChange('telegram_bot_token', e.target.value)}
                  className="clean-input w-full pr-12 font-mono"
                  placeholder="Paste bot token from @BotFather"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showToken ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Telegram Chat ID / Group ID
              </label>
              <input
                type="text"
                value={settings.telegram_chat_id}
                onChange={(e) => handleInputChange('telegram_chat_id', e.target.value)}
                className="clean-input w-full font-mono"
                placeholder="Paste chat ID or group ID"
              />
            </div>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testLoading || !settings.telegram_bot_token || !settings.telegram_chat_id}
              className="btn-outline text-xs self-start disabled:opacity-50"
            >
              {testLoading ? 'Sending Test...' : 'Send Test Notification'}
            </button>
          </div>

          {/* Core Intervals Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs p-6 flex flex-col gap-5 border-l-4 border-l-primary-teal">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="h-4.5 w-4.5 text-primary-teal" />
              Monitoring Intervals & Schedules
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Uptime Check Frequency (Minutes)
              </label>
              <select
                value={settings.uptime_interval}
                onChange={(e) => handleInputChange('uptime_interval', e.target.value)}
                className="clean-input w-full md:w-64"
              >
                <option value="1">Every 1 Minute (High Precision)</option>
                <option value="5">Every 5 Minutes (Standard)</option>
                <option value="10">Every 10 Minutes</option>
                <option value="15">Every 15 Minutes</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Sets how frequently the central server pings registered websites for availability and SSL expiry.
              </p>
            </div>
          </div>

          {/* Notification Channels Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs p-6 flex flex-col gap-5 border-l-4 border-l-primary-teal">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bell className="h-4.5 w-4.5 text-primary-teal" />
              Alert Dispatching Channels
            </h3>

            {/* Telegram Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Telegram Alerts</span>
                <span className="text-[11px] text-slate-400">Receive instant push notifications for site down & security alerts</span>
              </div>
              <input
                type="checkbox"
                checked={settings.telegram_notifications_enabled === 'true'}
                onChange={(e) =>
                  handleInputChange('telegram_notifications_enabled', e.target.checked ? 'true' : 'false')
                }
                className="h-4 w-4 text-primary-teal accent-primary-teal rounded"
              />
            </div>

            {/* Email Toggle */}
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary-teal" />
                    Email Digest Alerts
                  </span>
                  <span className="text-[11px] text-slate-400">Send email notifications for critical incidents</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications_enabled === 'true'}
                  onChange={(e) =>
                    handleInputChange('email_notifications_enabled', e.target.checked ? 'true' : 'false')
                  }
                  className="h-4 w-4 text-primary-teal accent-primary-teal rounded"
                />
              </div>

              {settings.email_notifications_enabled === 'true' && (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email_recipient}
                    onChange={(e) => handleInputChange('email_recipient', e.target.value)}
                    className="clean-input"
                    placeholder="admin@yourdomain.com"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-teal py-2.5 px-6 text-xs font-semibold self-start flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Preferences...' : 'Save All Settings'}
          </button>
        </div>

        {/* Right Info Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs p-5 flex flex-col gap-4">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-primary-teal" />
              Telegram Setup Guide
            </h4>
            <ol className="text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-2.5 list-decimal pl-4 leading-relaxed">
              <li>
                Buka Telegram dan cari <b>@BotFather</b>.
              </li>
              <li>
                Ketik <code>/newbot</code> dan ikuti petunjuk untuk membuat bot baru.
              </li>
              <li>
                Salin <b>HTTP API Token</b> yang diberikan dan tempel di kolom Bot Token.
              </li>
              <li>
                Buat grup baru atau kirim pesan ke bot Anda, lalu dapatkan <b>Chat ID</b> (bisa menggunakan bot <code>@userinfobot</code> atau <code>@GetMyChatID_Bot</code>).
              </li>
              <li>
                Klik <b>Send Test Notification</b> untuk memverifikasi koneksi.
              </li>
            </ol>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;
