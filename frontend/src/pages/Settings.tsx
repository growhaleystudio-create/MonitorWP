import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PetLoader from '../components/PetLoader';
import {
  Send,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({
    telegram_bot_token: '',
    telegram_chat_id: '',
    uptime_interval_minutes: '5',
    alert_on_site_down: 'true',
    alert_on_plugin_expired: 'true',
    alert_on_plugin_update: 'true',
    alert_on_error_spike_threshold: '10',
    alert_on_injection: 'true',
    alert_on_login_failed: 'true',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/dashboard/settings');
        setSettings((prev) => ({
          ...prev,
          ...response.data,
        }));
        setStatusMsg(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setStatusMsg({ type: 'error', text: 'Failed to load configurations.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const response = await axios.post('/api/dashboard/settings', settings);
      setStatusMsg({ type: 'success', text: response.data.message || 'Settings saved successfully!' });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Failed to save configurations.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestLoading(true);
    setStatusMsg(null);

    try {
      const response = await axios.post('/api/dashboard/settings/test-telegram');
      setStatusMsg({ type: 'success', text: response.data.message || 'Test Telegram message sent successfully!' });
    } catch (err: any) {
      console.error('Error testing Telegram:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to send test notification. Check credentials.',
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <PetLoader size={64} state="running" text="Loading settings configuration..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-primary-dark font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="page-subtitle">System Settings</span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Settings</h2>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-md border-2 text-xs font-bold flex items-start gap-2.5 ${
          statusMsg.type === 'success'
            ? 'bg-success/10 border-success text-success'
            : 'bg-coral/10 border-coral text-coral-dark'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form (Inputs) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Telegram Credentials Card */}
          <div className="bg-white border-2 border-primary-teal/15 rounded shadow-card p-6 flex flex-col gap-5 border-l-[6px] border-l-primary-teal">
            <h3 className="font-extrabold text-primary-dark text-base flex items-center gap-2 border-b border-primary-teal/15 pb-3">
              <Send className="h-4.5 w-4.5 text-primary-teal" />
              Telegram Bot Credentials
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                Telegram Bot Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={settings.telegram_bot_token}
                  onChange={(e) => handleInputChange('telegram_bot_token', e.target.value)}
                  className="w-full pr-12 cream-input font-mono"
                  placeholder="Paste bot token from @BotFather"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-primary-dark"
                >
                  {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                Telegram Chat ID / Group ID
              </label>
              <input
                type="text"
                value={settings.telegram_chat_id}
                onChange={(e) => handleInputChange('telegram_chat_id', e.target.value)}
                className="w-full cream-input font-mono"
                placeholder="Paste chat ID or group ID"
              />
            </div>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testLoading || !settings.telegram_bot_token || !settings.telegram_chat_id}
              className="py-2.5 px-5 rounded-full bg-primary-bg hover:bg-primary-teal hover:text-white border-2 border-primary-dark text-primary-dark font-extrabold text-xs tracking-wider uppercase transition shadow-sm active:scale-95 flex items-center justify-center gap-1.5 self-start disabled:opacity-50"
            >
              {testLoading ? 'Sending Test...' : 'Send Test Notification'}
            </button>
          </div>

          {/* Core Intervals Card */}
          <div className="bg-white border-2 border-primary-teal/15 rounded shadow-card p-6 flex flex-col gap-5 border-l-[6px] border-l-primary-teal">
            <h3 className="font-extrabold text-primary-dark text-base flex items-center gap-2 border-b border-primary-teal/15 pb-3">
              <Clock className="h-4.5 w-4.5 text-primary-teal" />
              Interval Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                  Uptime Check Interval (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.uptime_interval_minutes}
                  onChange={(e) => handleInputChange('uptime_interval_minutes', e.target.value)}
                  className="w-full cream-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-primary-dark uppercase tracking-wider pl-1">
                  Error Spike Threshold (Errors/Hour)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.alert_on_error_spike_threshold}
                  onChange={(e) => handleInputChange('alert_on_error_spike_threshold', e.target.value)}
                  className="w-full cream-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Form (Toggles) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border-2 border-primary-teal/15 rounded shadow-card p-6 flex flex-col gap-5 border-l-[6px] border-l-accent-gold">
            <h3 className="font-extrabold text-primary-dark text-base border-b border-primary-teal/15 pb-3">
              Notification Rules
            </h3>

            <div className="flex flex-col gap-4 text-xs font-bold mt-1">
              {/* Site Down Toggle */}
              <label className="flex items-center justify-between cursor-pointer group py-1.5 border-b border-dashed border-primary-teal/10 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-primary-dark group-hover:text-primary-teal transition">Site Down</span>
                  <span className="text-[10px] text-slate-400 font-medium">Alert immediately if website is unreachable.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alert_on_site_down === 'true'}
                  onChange={(e) => handleInputChange('alert_on_site_down', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 accent-primary-teal rounded cursor-pointer"
                />
              </label>

              {/* Plugin Expired Toggle */}
              <label className="flex items-center justify-between cursor-pointer group py-1.5 border-b border-dashed border-primary-teal/10 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-primary-dark group-hover:text-primary-teal transition">Plugin Expiry</span>
                  <span className="text-[10px] text-slate-400 font-medium">Alert on plugin license warnings.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alert_on_plugin_expired === 'true'}
                  onChange={(e) => handleInputChange('alert_on_plugin_expired', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 accent-primary-teal rounded cursor-pointer"
                />
              </label>

              {/* Plugin Update Toggle */}
              <label className="flex items-center justify-between cursor-pointer group py-1.5 border-b border-dashed border-primary-teal/10 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-primary-dark group-hover:text-primary-teal transition">Plugin Updates</span>
                  <span className="text-[10px] text-slate-400 font-medium">Alert if new plugin updates are found.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alert_on_plugin_update === 'true'}
                  onChange={(e) => handleInputChange('alert_on_plugin_update', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 accent-primary-teal rounded cursor-pointer"
                />
              </label>

              {/* Injection Detected Toggle */}
              <label className="flex items-center justify-between cursor-pointer group py-1.5 border-b border-dashed border-primary-teal/10 pb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-primary-dark group-hover:text-primary-teal transition">Injections</span>
                  <span className="text-[10px] text-slate-400 font-medium">Critical alerts for detected attacks.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alert_on_injection === 'true'}
                  onChange={(e) => handleInputChange('alert_on_injection', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 accent-primary-teal rounded cursor-pointer"
                />
              </label>

              {/* Brute Force Login Toggle */}
              <label className="flex items-center justify-between cursor-pointer group py-1.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-extrabold text-primary-dark group-hover:text-primary-teal transition">Login Fail Spike</span>
                  <span className="text-[10px] text-slate-400 font-medium">Alert if &gt;5 login failures in 15 mins.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alert_on_login_failed === 'true'}
                  onChange={(e) => handleInputChange('alert_on_login_failed', e.target.checked ? 'true' : 'false')}
                  className="h-5 w-5 accent-primary-teal rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-gold w-full mt-3 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-dark border-t-transparent"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
