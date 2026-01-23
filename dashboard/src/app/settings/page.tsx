'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
  User,
  Mail,
  Key,
  Bell,
  CreditCard,
  Shield,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Slack icon component
const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.528 2.528 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z" />
  </svg>
);

// Discord icon component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
  </svg>
);

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used_at: string | null;
}

interface WebhookConfig {
  type: 'slack' | 'discord';
  url: string;
  enabled: boolean;
  events: string[];
}

// Demo data
const demoApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production CLI',
    key: 'acf_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    created_at: '2025-01-15T10:00:00Z',
    last_used_at: '2025-01-22T08:30:00Z',
  },
  {
    id: 'key-2',
    name: 'Development',
    key: 'acf_test_sk_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    created_at: '2025-01-10T14:00:00Z',
    last_used_at: '2025-01-21T16:45:00Z',
  },
];

const notificationEvents = [
  { id: 'session_complete', label: 'Session completed', description: 'When a coding session ends' },
  { id: 'drs_below_threshold', label: 'DRS below 70', description: 'When DRS drops below warning threshold' },
  { id: 'contract_violation', label: 'Contract violation', description: 'When a contract change is detected' },
  { id: 'weekly_summary', label: 'Weekly summary', description: 'Weekly team performance digest' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'api-keys' | 'notifications' | 'subscription'>('profile');
  const [name, setName] = useState('Sarah Chen');
  const [email, setEmail] = useState('sarah@example.com');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(demoApiKeys);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [discordEnabled, setDiscordEnabled] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['session_complete', 'drs_below_threshold']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateKey = () => {
    if (!newKeyName) return;
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `acf_live_sk_${Math.random().toString(36).substring(2, 34)}`,
      created_at: new Date().toISOString(),
      last_used_at: null,
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNewKeyModal(false);
  };

  const handleDeleteKey = (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    setApiKeys(apiKeys.filter((k) => k.id !== keyId));
  };

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  return (
    <DashboardLayout userPlan="pro" userName="Sarah Chen" userEmail="sarah@example.com">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-500'
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Section */}
            {activeSection === 'api-keys' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Manage API keys for CLI and integrations
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNewKeyModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Key
                    </button>
                  </div>

                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{key.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <code className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-mono text-gray-600 overflow-hidden">
                                {showKeyId === key.id
                                  ? key.key
                                  : key.key.substring(0, 20) + '...' + key.key.substring(key.key.length - 4)}
                              </code>
                              <button
                                onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                {showKeyId === key.id ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(key.key, key.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                {copiedKeyId === key.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                              {key.last_used_at && (
                                <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Keep your API keys secure</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Never share your API keys or commit them to version control. Use environment variables instead.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                {/* Slack Integration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#4A154B] rounded-lg flex items-center justify-center">
                      <SlackIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Slack Integration</h3>
                      <p className="text-sm text-gray-500">Receive DRS alerts in Slack</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slackEnabled}
                        onChange={(e) => setSlackEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                  </div>

                  {slackEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={slackWebhook}
                          onChange={(e) => setSlackWebhook(e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <a
                        href="https://api.slack.com/messaging/webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                      >
                        Learn how to create a Slack webhook
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Discord Integration */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#5865F2] rounded-lg flex items-center justify-center">
                      <DiscordIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Discord Integration</h3>
                      <p className="text-sm text-gray-500">Receive DRS alerts in Discord</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discordEnabled}
                        onChange={(e) => setDiscordEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                  </div>

                  {discordEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={discordWebhook}
                          onChange={(e) => setDiscordWebhook(e.target.value)}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <a
                        href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                      >
                        Learn how to create a Discord webhook
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Notification Events */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Events</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose which events trigger notifications
                  </p>
                  <div className="space-y-3">
                    {notificationEvents.map((event) => (
                      <label
                        key={event.id}
                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => toggleEvent(event.id)}
                          className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{event.label}</p>
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Section */}
            {activeSection === 'subscription' && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Plan</h2>
                  <div className="flex items-center justify-between p-4 bg-brand-50 rounded-lg border border-brand-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">Pro Plan</p>
                        <p className="text-sm text-gray-500">$29/user/month</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-brand-700 bg-brand-100 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Team Seats</p>
                      <p className="text-2xl font-bold text-gray-900">5/10</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Sessions/Month</p>
                      <p className="text-2xl font-bold text-gray-900">Unlimited</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Next Billing</p>
                      <p className="text-2xl font-bold text-gray-900">Feb 15</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">$145</p>
                    </div>
                  </div>
                </div>

                {/* Billing Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing</h3>
                  <div className="space-y-3">
                    <a
                      href="/api/billing/portal"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Update payment method</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                    <a
                      href="/api/billing/invoices"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">View billing history</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                    <a
                      href="/pricing"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">Change plan</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>

                {/* License Key */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">License Key</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Use this key to activate AI Control Framework CLI
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
                      ACF-PRO-XXXX-XXXX-XXXX-XXXX
                    </code>
                    <button
                      onClick={() => copyToClipboard('ACF-PRO-XXXX-XXXX-XXXX-XXXX', 'license')}
                      className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {copiedKeyId === 'license' ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Run <code className="px-1.5 py-0.5 bg-gray-100 rounded">acf license activate YOUR-KEY</code> in your terminal
                  </p>
                </div>

                {/* Cancel Subscription */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You will lose access to Pro features at the end of your billing period.
                  </p>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Cancel my subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create API Key</h3>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production CLI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Give this key a descriptive name to help you identify it later.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={!newKeyName}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
