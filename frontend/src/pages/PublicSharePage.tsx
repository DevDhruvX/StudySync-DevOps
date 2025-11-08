import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  FileText,
  Link as LinkIcon,
  Copy,
  Check,
  Import,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { sharingApi, type SharedContent, type Note, type Subject } from '../services/api';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui';

const PublicSharePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<SharedContent | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Type guards - improved to handle unknown types safely
  const isSubject = (item: unknown): item is Subject => {
    return typeof item === 'object' && item !== null && 'name' in item && 'description' in item;
  };

  const isNote = (item: unknown): item is Note => {
    return typeof item === 'object' && item !== null && 'title' in item && 'content' in item;
  };

  const fetchSubjectNotes = useCallback(async (page = 1) => {
    try {
      const response = await sharingApi.getSharedSubjectNotes(token!, page, 10);
      
      if (response.success && response.data) {
        setNotes(response.data.notes);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching subject notes:', err);
    }
  }, [token]);

  const fetchSharedContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sharingApi.getPublicContent(token!);
      
      if (response.success && response.data) {
        setContent(response.data);
        
        // If it's a subject, fetch its notes
        if (response.data.contentType === 'subject') {
          const notesResponse = await sharingApi.getSharedSubjectNotes(token!, 1, 10);
          if (notesResponse.success && notesResponse.data) {
            setNotes(notesResponse.data.notes);
            setCurrentPage(notesResponse.data.pagination.page);
            setTotalPages(notesResponse.data.pagination.pages);
          }
        }
      } else {
        setError('Shared content not found');
      }
    } catch (err: unknown) {
      console.error('Error fetching shared content:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 410) {
          setError('This shared content has expired');
        } else if (axiosError.response?.status === 404) {
          setError('Shared content not found');
        } else {
          setError('Failed to load shared content');
        }
      } else {
        setError('Failed to load shared content');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSharedContent();
    }
  }, [token, fetchSharedContent]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleImport = async () => {
    if (!content || !token) return;
    
    setImporting(true);
    try {
      const response = await sharingApi.importSharedContent(token);
      
      if (response.success) {
        if (response.data?.subject) {
          toast.success(`Successfully imported "${response.data.subject.name}" with ${response.data.notesCount || 0} notes!`);
        } else if (response.data?.note) {
          toast.success(`Successfully imported note "${response.data.note.title}"!`);
        } else {
          toast.success('Content imported successfully!');
        }
      } else {
        toast.error(response.message || 'Failed to import content');
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 401) {
        toast.error('Please log in to import content');
        // Optionally redirect to login
        navigate('/auth');
      } else {
        toast.error(error.response?.data?.message || 'Failed to import content');
      }
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return '🎥';
      case 'article':
        return '📄';
      case 'document':
        return '📋';
      case 'file':
        return '📎';
      default:
        return '📝';
    }
  };

  const getContentTitle = (item: Subject | Note, contentType: string) => {
    if (contentType === 'subject' && isSubject(item)) {
      return item.name;
    } else if (contentType === 'note' && isNote(item)) {
      return item.title;
    }
    return 'Untitled';
  };

  const getContentDescription = (item: Subject | Note, contentType: string) => {
    if (contentType === 'subject' && isSubject(item)) {
      return item.description;
    } else if (contentType === 'note' && isNote(item)) {
      return item.content;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Content Not Available</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to StudySync
          </Button>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const { content: sharedItem, contentType, shareSettings, sharedAt, owner } = content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                StudySync
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  {contentType === 'subject' ? (
                    <BookOpen className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {getContentTitle(sharedItem, contentType)}
                  </h1>
                  <p className="text-sm text-gray-300">
                    Shared {contentType} by {owner.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              
              <Button
                onClick={handleImport}
                disabled={importing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {importing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Import className="w-4 h-4 mr-2" />
                )}
                Import to My Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Description */}
            {getContentDescription(sharedItem, contentType) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">
                  {getContentDescription(sharedItem, contentType)}
                </p>
              </motion.div>
            )}

            {/* Notes (for subjects) */}
            {contentType === 'subject' && notes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-6">
                  Notes ({content.notesCount || notes.length})
                </h2>
                
                <div className="space-y-4">
                  {notes.map((note, index) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getFileIcon(note.type)}</span>
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-2">{note.title}</h3>
                          {note.content && (
                            <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                              {note.content}
                            </p>
                          )}
                          {note.link && (
                            <a
                              href={note.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Open Link
                            </a>
                          )}
                          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                            <span>Added {formatDate(note.createdAt)}</span>
                            {note.tags?.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {note.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-white/10 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchSubjectNotes(page)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Single Note Content */}
            {contentType === 'note' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{isNote(sharedItem) ? getFileIcon(sharedItem.type || 'note') : '📝'}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{getContentTitle(sharedItem, contentType)}</h2>
                    <p className="text-sm text-gray-400">Note</p>
                  </div>
                </div>
                
                {isNote(sharedItem) && sharedItem.content && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300">{sharedItem.content}</p>
                  </div>
                )}
                
                {isNote(sharedItem) && sharedItem.link && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">External Link:</p>
                    <a
                      href={sharedItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 break-all"
                    >
                      {sharedItem.link}
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-white mb-4">Share Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400">Shared by</p>
                    <p className="text-white font-medium">{owner.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-400">Shared on</p>
                    <p className="text-white">{formatDate(sharedAt)}</p>
                  </div>
                </div>
                
                {shareSettings.expiresAt && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Expires on</p>
                      <p className="text-white">{formatDate(shareSettings.expiresAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Share Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
            >
              <h3 className="font-semibold text-white mb-4">Permissions</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Downloads</span>
                  <span className={shareSettings.allowDownload ? 'text-green-400' : 'text-red-400'}>
                    {shareSettings.allowDownload ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Comments</span>
                  <span className={shareSettings.allowComments ? 'text-green-400' : 'text-red-400'}>
                    {shareSettings.allowComments ? 'Allowed' : 'Not allowed'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 text-center"
            >
              <h3 className="font-semibold text-white mb-2">Like this content?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Create your own study materials with StudySync
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started Free
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSharePage;