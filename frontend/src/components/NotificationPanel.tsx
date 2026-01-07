import { formatDistanceToNow } from 'date-fns';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useNotificationStore } from '../stores';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

  return (
    <div className="absolute right-0 top-12 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Notifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={clsx(
                'p-4 border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer transition-colors',
                !notification.read && 'bg-gray-700/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  notification.type === 'error' && 'bg-red-500',
                  notification.type === 'warning' && 'bg-yellow-500',
                  notification.type === 'success' && 'bg-green-500',
                  notification.type === 'info' && 'bg-blue-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                  {notification.anomalyId && (
                    <Link
                      to={`/anomalies/${notification.anomalyId}`}
                      className="text-xs text-primary-400 hover:text-primary-300 mt-1 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View anomaly →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={clearNotifications}
            className="w-full text-sm text-gray-400 hover:text-white py-2"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
}
