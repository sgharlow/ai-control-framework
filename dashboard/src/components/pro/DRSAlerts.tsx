'use client';

import { AlertTriangle, TrendingDown, Clock, XCircle, Bell, BellOff } from 'lucide-react';

interface Alert {
  id: string;
  type: 'low_score' | 'declining_trend' | 'inactive' | 'failed_deploy';
  severity: 'warning' | 'critical';
  message: string;
  details: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface DRSAlertsProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export function DRSAlerts({ alerts, onAcknowledge, onDismiss }: DRSAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_score':
        return <AlertTriangle className="w-5 h-5" />;
      case 'declining_trend':
        return <TrendingDown className="w-5 h-5" />;
      case 'inactive':
        return <Clock className="w-5 h-5" />;
      case 'failed_deploy':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: string, acknowledged: boolean) => {
    if (acknowledged) {
      return 'bg-gray-50 border-gray-200';
    }
    return severity === 'critical'
      ? 'bg-red-50 border-red-200'
      : 'bg-yellow-50 border-yellow-200';
  };

  const getIconColor = (severity: string, acknowledged: boolean) => {
    if (acknowledged) return 'text-gray-400';
    return severity === 'critical' ? 'text-red-500' : 'text-yellow-500';
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-lg">
              <Bell className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">DRS Alerts</h3>
              <p className="text-sm text-gray-500">
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-100 rounded-full">
            PRO
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activeAlerts.length === 0 && acknowledgedAlerts.length === 0 && (
          <div className="px-6 py-12 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No alerts</p>
            <p className="text-sm text-gray-400 mt-1">Your team is performing well</p>
          </div>
        )}

        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`px-6 py-4 border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500'
            } ${getSeverityStyles(alert.severity, alert.acknowledged)}`}
          >
            <div className="flex items-start gap-4">
              <div className={getIconColor(alert.severity, alert.acknowledged)}>
                {getAlertIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.details}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatTimestamp(alert.timestamp)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}

        {acknowledgedAlerts.length > 0 && (
          <div className="px-6 py-3 bg-gray-50">
            <p className="text-sm text-gray-500">
              {acknowledgedAlerts.length} acknowledged alert
              {acknowledgedAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Demo data for preview
export const demoAlerts: Alert[] = [
  {
    id: '1',
    type: 'low_score',
    severity: 'critical',
    message: 'DRS below threshold',
    details: "Alex Thompson's DRS dropped to 72, below the team minimum of 75.",
    timestamp: new Date(Date.now() - 30 * 60000),
    acknowledged: false,
  },
  {
    id: '2',
    type: 'declining_trend',
    severity: 'warning',
    message: 'Declining trend detected',
    details: "David Kim's DRS has declined 8% over the past week.",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    acknowledged: false,
  },
  {
    id: '3',
    type: 'inactive',
    severity: 'warning',
    message: 'Low activity',
    details: 'Alex Thompson has only 4 sessions this week (team avg: 9).',
    timestamp: new Date(Date.now() - 24 * 60 * 60000),
    acknowledged: true,
  },
];
