import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  MessageCircle,
  Download,
  Globe,
  Check,
  Clock
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'subject' | 'note';
  onShare: (shareSettings: ShareSettings) => Promise<string | null>;
}

interface ShareSettings {
  allowComments: boolean;
  allowDownload: boolean;
  expiresAt?: string;
}

export const ShareModal = ({ isOpen, onClose, title, type, onShare }: ShareModalProps) => {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    allowComments: false,
    allowDownload: true,
    expiresAt: ''
  });

  const handleShare = async () => {
    setLoading(true);
    try {
      const url = await onShare(shareSettings);
      if (url) {
        setShareUrl(url);
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    onClose();
  };

  const getExpiryOptions = () => {
    const now = new Date();
    return [
      { label: 'Never', value: '' },
      { label: '1 Hour', value: new Date(now.getTime() + 60 * 60 * 1000).toISOString() },
      { label: '1 Day', value: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      { label: '1 Week', value: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      { label: '1 Month', value: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() }
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Share {type === 'subject' ? 'Subject' : 'Note'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-64">
                    {title}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!shareUrl ? (
                <>
                  {/* Share Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Sharing Options
                    </h4>

                    {/* Allow Comments */}
                    <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Allow Comments
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Viewers can leave comments (coming soon)
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={shareSettings.allowComments}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        disabled
                      />
                    </label>

                    {/* Allow Download */}
                    <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Download className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Allow Download
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Viewers can download files and content
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={shareSettings.allowDownload}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </label>

                    {/* Expiration */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Link Expires
                      </label>
                      <select
                        value={shareSettings.expiresAt || ''}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, expiresAt: e.target.value || undefined }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {getExpiryOptions().map(option => (
                          <option key={option.label} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Share Button */}
                  <Button
                    onClick={handleShare}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Creating Share Link...' : 'Create Share Link'}</span>
                  </Button>
                </>
              ) : (
                <>
                  {/* Share URL */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Share Link Created!
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={shareUrl}
                        readOnly
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Anyone with this link can view your {type}. Share it via email, social media, or any messaging platform.
                    </p>
                  </div>

                  {/* Settings Summary */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Sharing Settings
                    </h5>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Comments:</span>
                        <span>{shareSettings.allowComments ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Downloads:</span>
                        <span>{shareSettings.allowDownload ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Expires:</span>
                        <span>
                          {shareSettings.expiresAt 
                            ? new Date(shareSettings.expiresAt).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};