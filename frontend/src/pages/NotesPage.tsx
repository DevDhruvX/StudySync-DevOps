import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Youtube,
  FileText,
  Link2,
  ExternalLink,
  Pin,
  Edit3,
  Trash2,
  BookOpen,
  Clock,
  Tag,
  Paperclip,
  Download,
  X,
  Share2
} from 'lucide-react';
import { notesApi, subjectApi, sharingApi, type Note, type Subject } from '../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { Button, Input, Modal, RichTextEditor, ShareModal } from '../components/ui';

const NotesPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightNoteId = searchParams.get('highlight');
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '', // kept for backwards compatibility
    links: [{ url: '', title: '', description: '', category: 'website' as const }] as Array<{ 
      url: string; 
      title: string; 
      description: string; 
      category: 'youtube' | 'github' | 'stackoverflow' | 'article' | 'documentation' | 'google-docs' | 'notion' | 'website' | 'other';
    }>,
    type: 'note' as Note['type'],
    tags: [] as string[],
    isPinned: false,
    color: '#6366F1'
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Sharing state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);

  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  // Color options for notes
  const noteColors = [
    '#6366F1', '#EC4899', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16',
    '#F97316', '#3B82F6', '#8B5A2B', '#14B8A6'
  ];

  // Load subject and notes
  useEffect(() => {
    const loadData = async () => {
      if (!subjectId) return;
      
      try {
        setLoading(true);
        
        // Load subject details
        const subjectResponse = await subjectApi.getById(subjectId);
        if (subjectResponse.success && subjectResponse.data) {
          setSubject(subjectResponse.data);
        }
        
        // Load notes for this subject
        const notesResponse = await notesApi.getBySubject(subjectId, {
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (notesResponse.success && notesResponse.data) {
          setNotes(notesResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  const loadSubjectAndNotes = async () => {
    if (!subjectId) return;
    
    try {
      setLoading(true);
      
      // Load subject details
      const subjectResponse = await subjectApi.getById(subjectId);
      if (subjectResponse.success && subjectResponse.data) {
        setSubject(subjectResponse.data);
      }
      
      // Load notes for this subject
      const notesResponse = await notesApi.getBySubject(subjectId, {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (notesResponse.success && notesResponse.data) {
        setNotes(notesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) {
      console.log('Form already submitting, ignoring...');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Current state when submitting:');
    console.log('- isEditMode:', isEditMode);
    console.log('- editingNote:', editingNote);
    console.log('- editingNote._id:', editingNote?._id);
    console.log('- selectedFiles:', selectedFiles.length);
    console.log('- formData.title:', formData.title);
    console.log('- formData.links:', formData.links);
    console.log('- validLinks count:', formData.links.filter(link => link.url.trim() !== '').length);
    console.log('==============================');

    try {
      setSubmitting(true);
      // Filter out empty links
      const validLinks = formData.links.filter(link => link.url.trim() !== '');
      
      const noteData = {
        ...formData,
        subjectId: subjectId!,
        title: formData.title.trim(),
        content: formData.content.trim() || undefined,
        link: formData.link.trim() || undefined, // backwards compatibility
        links: validLinks.length > 0 ? validLinks : undefined,
        color: formData.color,
      };

      console.log('Debug mode check:', { 
        isEditMode, 
        editingNote: !!editingNote, 
        editingNoteId: editingNote?._id,
        selectedFilesCount: selectedFiles.length,
        formTitle: formData.title 
      });

      let response;
      
      // Force create mode if we don't have a valid editing note ID
      const hasValidEditingNote = editingNote && editingNote._id && editingNote._id.trim() !== '';
      const shouldCreate = !hasValidEditingNote;
      
      console.log('=== DETAILED DECISION LOGIC ===');
      console.log('editingNote exists:', !!editingNote);
      console.log('editingNote._id exists:', !!(editingNote?._id));
      console.log('editingNote._id value:', editingNote?._id);
      console.log('editingNote._id.trim() !== "":', editingNote?._id ? editingNote._id.trim() !== '' : false);
      console.log('hasValidEditingNote:', hasValidEditingNote);
      console.log('isEditMode:', isEditMode);
      console.log('shouldCreate:', shouldCreate);
      console.log('Final condition (!shouldCreate && isEditMode && hasValidEditingNote):', !shouldCreate && isEditMode && hasValidEditingNote);
      console.log('===============================');
      
      console.log('Decision logic:', {
        hasValidEditingNote,
        shouldCreate,
        editingNoteId: editingNote?._id,
        isEditMode
      });
      
      if (!shouldCreate && isEditMode && hasValidEditingNote) {
        // Edit mode - update existing note
        console.log('EDIT MODE: Updating existing note with ID:', editingNote._id);
        if (selectedFiles.length > 0) {
          console.log('Edit mode with files - calling updateWithFiles');
          response = await notesApi.updateWithFiles(editingNote._id, noteData, selectedFiles);
        } else {
          console.log('Edit mode without files - calling update');
          response = await notesApi.update(editingNote._id, noteData);
        }
        toast.success('Note updated successfully!');
      } else {
        // Create new note mode (forced if no valid editing note)
        console.log('CREATE MODE: Creating new note (forced because no valid editing note)');
        if (selectedFiles.length > 0) {
          console.log('Creating note with files - calling createWithFiles');
          response = await notesApi.createWithFiles(noteData, selectedFiles);
        } else {
          console.log('Creating note without files - calling create');
          response = await notesApi.create(noteData);
        }
        toast.success('Note created successfully!');
      }

      if (response.success) {
        console.log('Note creation response:', response);
        console.log('Created note data:', response.data);
        if (response.data && response.data.files) {
          console.log('Files in created note:', response.data.files);
        }
        await loadSubjectAndNotes();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || '',
      link: note.link || '',
      links: note.links && note.links.length > 0 
        ? note.links.map(link => ({
            url: link.url,
            title: link.title || '',
            description: link.description || '',
            category: link.category || 'website' as const
          }))
        : [{ url: '', title: '', description: '', category: 'website' as const }],
      type: note.type,
      tags: note.tags,
      isPinned: note.isPinned,
      color: note.color || '#6366F1'
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await notesApi.delete(noteId);
      if (response.success) {
        toast.success('Note deleted successfully!');
        await loadSubjectAndNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      const response = await notesApi.togglePin(noteId);
      if (response.success) {
        toast.success('Note pin status updated!');
        await loadSubjectAndNotes();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update note');
    }
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingNote(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingNote(null);
    setSelectedFiles([]);
    setSubmitting(false); // Reset submitting state
    setFormData({
      title: '',
      content: '',
      link: '',
      links: [{ url: '', title: '', description: '', category: 'website' as const }],
      type: 'note',
      tags: [],
      isPinned: false,
      color: '#6366F1'
    });
    
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Sharing handlers
  const handleShareNote = (note: Note) => {
    setSharingNote(note);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSharingNote(null);
  };

  const handleShare = async (shareSettings: { allowComments: boolean; allowDownload: boolean; expiresAt?: string }) => {
    if (!sharingNote) return null;
    
    try {
      const response = await sharingApi.shareNote(sharingNote._id, shareSettings);
      
      if (response.success && response.data) {
        toast.success('Note shared successfully!');
        
        // Optionally refresh the notes to show updated sharing status
        if (subjectId) {
          loadNotes();
        }
        
        return response.data.shareUrl;
      } else {
        toast.error(response.message || 'Failed to share note');
        return null;
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      toast.error('Failed to share note');
      return null;
    }
  };

  // Link management functions
  const currentLinks = formData.links;
  const addNewLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { url: '', title: '', description: '', category: 'website' as const }]
    });
  };

  const removeLink = (index: number) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      links: newLinks.length > 0 ? newLinks : [{ url: '', title: '', description: '', category: 'website' as const }]
    });
  };

  const updateLink = (index: number, field: 'url' | 'title' | 'description' | 'category', value: string) => {
    const newLinks = [...formData.links];
    
    if (field === 'url' && value) {
      // Auto-detect category when URL is updated
      const detectedCategory = getLinkType(value) as typeof newLinks[0]['category'];
      newLinks[index] = { 
        ...newLinks[index], 
        [field]: value,
        category: detectedCategory
      };
    } else {
      newLinks[index] = { ...newLinks[index], [field]: value };
    }
    
    setFormData({ ...formData, links: newLinks });
  };

  // Link validation functions
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /^https?:\/\/.+/.test(url);
    } catch {
      return false;
    }
  };

  const getLinkType = (url: string): 'youtube' | 'github' | 'stackoverflow' | 'article' | 'documentation' | 'google-docs' | 'notion' | 'website' | 'other' => {
    const domain = url.toLowerCase();
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
    if (domain.includes('github.com')) return 'github';
    if (domain.includes('stackoverflow.com')) return 'stackoverflow';
    if (domain.includes('medium.com') || domain.includes('dev.to')) return 'article';
    if (domain.includes('docs.google.com')) return 'google-docs';
    if (domain.includes('notion.so')) return 'notion';
    return 'website';
  };

  const getLinkIcon = (url: string) => {
    const type = getLinkType(url);
    switch (type) {
      case 'youtube': return '🎥';
      case 'github': return '⚡';
      case 'stackoverflow': return '🔧';
      case 'article': return '📄';
      case 'google-docs': return '📝';
      case 'notion': return '📋';
      default: return '🔗';
    }
  };

  const getFileIcon = (filename: string, mimeType?: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.startsWith('video/')) return '🎥';
    if (mimeType?.startsWith('audio/')) return '🎵';
    
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📋';
      case 'txt': return '📃';
      case 'zip':
      case 'rar':
      case '7z': return '🗜️';
      case 'js':
      case 'ts':
      case 'html':
      case 'css': return '💻';
      default: return '📎';
    }
  };

  // Bulk link import function
  const handleBulkImport = () => {
    const urls = bulkImportText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && validateUrl(line));

    if (urls.length === 0) {
      toast.error('No valid URLs found');
      return;
    }

    const newLinks = urls.map(url => ({
      url,
      title: '',
      description: '',
      category: getLinkType(url)
    }));

    setFormData({
      ...formData,
      links: [...formData.links.filter(link => link.url), ...newLinks]
    });

    setBulkImportText('');
    setShowBulkImport(false);
    toast.success(`Imported ${urls.length} links`);
  };

  const loadNotes = async () => {
    if (!subjectId) return;
    try {
      const notesResponse = await notesApi.getBySubject(subjectId, {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (notesResponse.success && notesResponse.data) {
        setNotes(notesResponse.data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const getTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'article':
      case 'link':
        return <Link2 className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'file':
        return <Paperclip className="w-4 h-4 text-orange-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-purple-500" />;
    }
  };

  const getTypeColor = (type: Note['type'], customColor?: string) => {
    if (customColor) {
      return `border-[${customColor}]/30`;
    }
    
    switch (type) {
      case 'youtube':
        return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'article':
      case 'link':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'document':
        return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'file':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
      default:
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || note.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Sort pinned notes first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: subject?.color || '#6366F1' }}
                >
                  {subject?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{subject?.name}</h1>
                  <p className="text-white/70">{notes.length} notes</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => {
                // Reset edit mode when adding new note
                setIsEditMode(false);
                setEditingNote(null);
                setSelectedFiles([]);
                setFormData({
                  title: '',
                  content: '',
                  link: '',
                  links: [{ url: '', title: '', description: '', category: 'website' as const }],
                  type: 'note',
                  tags: [],
                  isPinned: false,
                  color: '#6366F1'
                });
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/70" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="youtube">YouTube</option>
              <option value="article">Articles</option>
              <option value="document">Documents</option>
              <option value="file">File Uploads</option>
              <option value="link">Links</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {sortedNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No notes yet</h3>
            <p className="text-white/50 mb-6">
              {searchQuery || filterType !== 'all' 
                ? 'No notes match your search criteria'
                : 'Start by creating your first note or resource'
              }
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button
                onClick={() => {
                  // Reset edit mode when adding new note
                  console.log('Create First Note clicked - resetting to create mode');
                  setIsEditMode(false);
                  setEditingNote(null);
                  setSelectedFiles([]);
                  setFormData({
                    title: '',
                    content: '',
                    link: '',
                    links: [{ url: '', title: '', description: '', category: 'website' as const }],
                    type: 'note',
                    tags: [],
                    isPinned: false,
                    color: '#6366F1'
                  });
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Note
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sortedNotes.map((note, index) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border backdrop-blur-md group cursor-pointer transition-all duration-300 hover:scale-105 ${
                    highlightNoteId === note._id ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''
                  } ${note.color ? '' : `bg-gradient-to-br ${getTypeColor(note.type)}`}`}
                  style={note.color ? {
                    background: `linear-gradient(135deg, ${note.color}15, ${note.color}25)`,
                    borderColor: `${note.color}50`
                  } : {}}
                  onClick={() => handleViewNote(note)}
                >
                  {/* Pin indicator */}
                  {note.isPinned && (
                    <Pin className="absolute top-4 right-4 w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  
                  {/* Note type icon */}
                  <div className="flex items-center space-x-2 mb-3">
                    {getTypeIcon(note.type)}
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                      {note.type}
                    </span>
                  </div>
                  
                  {/* Note title */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {note.title}
                  </h3>
                  
                  {/* Note content */}
                  {note.content && (
                    <div className="text-white/70 text-sm mb-3 max-h-24 overflow-hidden">
                      <p className="line-clamp-3 whitespace-pre-wrap">
                        {note.content.replace(/[#*`_~[\]]/g, '').substring(0, 150)}
                        {note.content.length > 150 ? '...' : ''}
                      </p>
                    </div>
                  )}
                  
                  {/* Links */}
                  {note.link && (
                    <a
                      href={note.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm mb-3 group/link"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">
                        {note.type === 'youtube' ? 'Watch Video' : 'Open Link'}
                      </span>
                    </a>
                  )}
                  
                  {/* Multiple Links with Categories */}
                  {note.links && note.links.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {note.links.slice(0, 3).map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-xs group/link w-full p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title={link.description || link.url}
                        >
                          <span className="text-sm">{getLinkIcon(link.url)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate font-medium">
                                {link.title || link.url.replace(/^https?:\/\//, '').split('/')[0]}
                              </span>
                            </div>
                            {link.description && (
                              <div className="text-xs text-white/60 truncate">
                                {link.description}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-white/40 capitalize">
                            {link.category?.replace('-', ' ')}
                          </span>
                        </a>
                      ))}
                      {note.links.length > 3 && (
                        <div className="text-xs text-white/60 px-2">
                          +{note.links.length - 3} more links
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* File Attachments */}
                  {note.files && note.files.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {note.files.slice(0, 2).map((file, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(notesApi.getFileUrl(file.fileName), '_blank');
                            }}
                            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white/80 hover:bg-white/20 transition-colors hover:scale-105"
                            title={`Open ${file.originalName}`}
                          >
                            <Paperclip className="w-3 h-3 text-orange-400" />
                            <span className="truncate max-w-24 font-medium">{file.originalName}</span>
                          </button>
                        ))}
                        {note.files.length > 2 && (
                          <div className="inline-flex items-center px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60">
                            +{note.files.length - 2} more files
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/10 text-white/80"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-white/60">+{note.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewNote(note);
                      }}
                      className="p-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-0 rounded-lg transition-colors"
                      title="View Note Details"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    {note.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(note.link, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 rounded-lg transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareNote(note);
                      }}
                      className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 rounded-lg transition-colors"
                      title="Share Note"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note._id);
                      }}
                      className={`p-2 ${note.isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white'} hover:bg-white/20 border-0 rounded-lg transition-colors`}
                      title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(note);
                      }}
                      className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0 rounded-lg transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note._id);
                      }}
                      className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0 rounded-lg transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          {/* Clear Mode Indicator */}
          <div className={`flex items-center justify-between mb-6 p-3 rounded-lg border ${
            isEditMode 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isEditMode ? '✏️ Edit Note' : '➕ Add New Note'}
              </h3>
              <p className="text-sm text-white/60 mt-1">
                {isEditMode 
                  ? `Editing "${editingNote?.title}" - changes will update the existing note`
                  : 'Creating a brand new note'
                }
              </p>
            </div>
            {isEditMode && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(
                    '⚠️ Are you sure?\n\n' +
                    'This will create a SEPARATE NEW NOTE instead of updating the current one.\n\n' +
                    'Click OK to create new note, or Cancel to continue editing.'
                  )) {
                    console.log('FORCE RESET CLICKED');
                    setIsEditMode(false);
                    setEditingNote(null);
                    toast.success('Switched to create new note mode');
                  }
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg font-medium transition-colors"
                title="Create a separate new note instead of editing this one"
              >
                🔄 Create New Instead
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Note Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter note title..."
                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Note['type'] })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                style={{ colorScheme: 'dark' }}
              >
                <option value="note" className="bg-slate-800 text-white">📝 Note</option>
                <option value="youtube" className="bg-slate-800 text-white">🎥 YouTube Video</option>
                <option value="article" className="bg-slate-800 text-white">📰 Article</option>
                <option value="document" className="bg-slate-800 text-white">📄 Document</option>
                <option value="file" className="bg-slate-800 text-white">📎 File Upload</option>
                <option value="link" className="bg-slate-800 text-white">🔗 Link</option>
                <option value="other" className="bg-slate-800 text-white">� Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Content
              </label>
              {/* Temporary fallback - we'll improve this */}
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter note content using Markdown..."
                rows={8}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
              />
              <p className="text-xs text-white/50 mt-1">
                💡 Supports Markdown: **bold**, *italic*, `code`, [links](url), ## headings
              </p>
            </div>
            
            {/* Backwards Compatibility - Single Link Field */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Primary Link (Legacy - Optional)
              </label>
              <Input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-500"
              />
            </div>

            {/* Enhanced Multiple Links Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white/70">
                  Multiple Links ({currentLinks.length})
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkImport(true)}
                    className="px-3 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg text-xs border border-purple-500/30 transition-colors"
                  >
                    Bulk Import
                  </button>
                  <button
                    type="button"
                    onClick={addNewLink}
                    className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg text-xs border border-green-500/30 transition-colors"
                  >
                    Add Link
                  </button>
                </div>
              </div>

              {/* Link List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {currentLinks.map((link, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">URL *</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg text-sm text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                          />
                          <span className="px-2 py-2 bg-white/5 border border-l-0 border-white/20 rounded-r-lg text-xs flex items-center">
                            {validateUrl(link.url) ? '✅' : '❌'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Category</label>
                        <select
                          value={link.category || 'website'}
                          onChange={(e) => updateLink(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="youtube">📺 YouTube</option>
                          <option value="github">🐙 GitHub</option>
                          <option value="stackoverflow">📚 StackOverflow</option>
                          <option value="article">📰 Article</option>
                          <option value="documentation">📖 Documentation</option>
                          <option value="google-docs">📄 Google Docs</option>
                          <option value="notion">📝 Notion</option>
                          <option value="website">🌐 Website</option>
                          <option value="other">🔗 Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Title</label>
                        <input
                          type="text"
                          value={link.title || ''}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                          placeholder="Link title"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="w-full px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm border border-red-500/30 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs text-white/60 mb-1">Description</label>
                      <input
                        type="text"
                        value={link.description || ''}
                        onChange={(e) => updateLink(index, 'description', e.target.value)}
                        placeholder="Link description"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
                
                {currentLinks.length === 0 && (
                  <div className="text-center py-6 text-white/50">
                    <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No links added yet</p>
                    <p className="text-xs">Click "Add Link" or "Bulk Import" to get started</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Note Color Selection */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Note Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {noteColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg shadow-lg transition-all duration-200 ${
                      formData.color === color 
                        ? 'ring-2 ring-white/50 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color} color`}
                  >
                    {formData.color === color && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* File Upload Section - Available in All Modes */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                📎 File Attachments (Multiple files supported)
              </label>
              <div className="relative">
                {/* Original drag-and-drop area */}
                <div 
                  className="w-full p-6 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-purple-500', 'bg-purple-500/10');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-purple-500', 'bg-purple-500/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-purple-500', 'bg-purple-500/10');
                    const files = Array.from(e.dataTransfer.files);
                    setSelectedFiles(files);
                    if (files.length > 0) {
                      setFormData({ ...formData, type: 'file' });
                    }
                  }}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📁</div>
                    <div className="text-white/70 mb-1">
                      Drag & drop files here or click to browse
                    </div>
                    <div className="text-xs text-white/50 mb-2">
                      Hold Ctrl/Cmd and click multiple files to select them
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="text-sm text-green-400 mt-2">
                        ✅ {selectedFiles.length} file(s) selected
                      </div>
                    )}
                  </div>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    if (newFiles.length > 0) {
                      // Check if we should append or replace files
                      // If there are already selected files, give user choice
                      if (selectedFiles.length > 0 && newFiles.length === 1) {
                        // Single file selected when files already exist - append it
                        const updatedFiles = [...selectedFiles, ...newFiles];
                        setSelectedFiles(updatedFiles);
                      } else {
                        // Multiple files selected or no existing files - replace
                        setSelectedFiles(newFiles);
                      }
                      setFormData({ ...formData, type: 'file' });
                    }
                    // Reset input to allow selecting the same file again
                    e.target.value = '';
                  }}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar,.mp4,.mp3,.xlsx,.pptx"
                />
                <div className="mt-2 text-xs text-white/50">
                  Supported: PDF, DOC, images, videos, audio, archives (max 10MB each)
                </div>
              </div>
              
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/70">Selected files ({selectedFiles.length}):</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      + Add more files
                    </button>
                  </div>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getFileIcon(file.name, file.type)}</span>
                        <div>
                          <div className="text-sm text-white font-medium">{file.name}</div>
                          <div className="text-xs text-white/50">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== index);
                          setSelectedFiles(newFiles);
                          if (newFiles.length === 0 && formData.type === 'file') {
                            setFormData({ ...formData, type: 'note' });
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Show existing files in edit mode */}
            {isEditMode && editingNote?.files && editingNote.files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Existing File Attachments ({editingNote.files.length})
                </label>
                <div className="space-y-2">
                  {editingNote.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getFileIcon(file.originalName, file.mimeType)}</span>
                        <div>
                          <div className="text-sm text-white font-medium">
                            {file.originalName}
                          </div>
                          <div className="text-xs text-white/50">
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.mimeType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await notesApi.viewFile(file.fileName);
                            } catch (error) {
                              console.error('View file error:', error);
                              toast.error('Failed to view file');
                            }
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors"
                          title="View File"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await notesApi.downloadFile(file.fileName, file.originalName);
                            } catch (error) {
                              console.error('Download file error:', error);
                              toast.error('Failed to download file');
                            }
                          }}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-colors"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPinned" className="text-sm text-white/70">
                  Pin this note
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className={`flex-1 ${
                  isEditMode 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                } text-white border-0 disabled:opacity-50`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isEditMode ? (
                      <>
                        <span className="mr-2">✏️</span>
                        Update "{editingNote?.title}"
                      </>
                    ) : (
                      <>
                        <span className="mr-2">➕</span>
                        Create New Note
                      </>
                    )}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Note Modal */}
      <Modal isOpen={isViewModalOpen} onClose={handleCloseViewModal}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            {viewingNote?.title}
          </h3>
          
          <div className="space-y-4">
            {/* Note type and date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {viewingNote && getTypeIcon(viewingNote.type)}
                <span className="text-sm font-medium text-white/70 uppercase tracking-wide">
                  {viewingNote?.type}
                </span>
              </div>
              <span className="text-sm text-white/50">
                {viewingNote && new Date(viewingNote.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Note content */}
            {viewingNote?.content && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <RichTextEditor
                  value={viewingNote.content}
                  onChange={() => {}}
                  readOnly={true}
                  height={300}
                  showActions={false}
                />
              </div>
            )}

            {/* All Links Section - Combines Legacy and New Links */}
            {(viewingNote?.link || (viewingNote?.links && viewingNote.links.length > 0)) && (() => {
              return (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Links ({(viewingNote?.link ? 1 : 0) + (viewingNote?.links?.length || 0)})
                </label>
                <div className="space-y-3">
                  {/* Legacy single link */}
                  {viewingNote?.link && (
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLinkIcon(viewingNote.link)}</span>
                        <span className="text-xs text-white/60 capitalize px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full">
                          Primary
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={viewingNote.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm group break-all"
                        >
                          <span className="group-hover:underline">{viewingNote.link}</span>
                          <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Multiple links */}
                  {viewingNote?.links && viewingNote.links.map((link, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLinkIcon(link.url)}</span>
                        <span className="text-xs text-white/60 capitalize px-2 py-1 bg-white/10 rounded-full">
                          {link.category?.replace('-', ' ') || 'website'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {link.title && (
                          <div className="text-sm font-medium text-white/90 mb-1">
                            {link.title}
                          </div>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm group break-all"
                        >
                          <span className="group-hover:underline">{link.url}</span>
                          <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                        {link.description && (
                          <div className="text-xs text-white/60 mt-1">
                            {link.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {/* File Attachments - Always show section for debugging */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <label className="block text-sm font-medium text-white/70 mb-3">
                File Attachments ({viewingNote?.files?.length || 0})
              </label>
              {viewingNote?.files && viewingNote.files.length > 0 ? (
                <div className="space-y-2">
                  {viewingNote.files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getFileIcon(file.originalName, file.mimeType)}</span>
                        <div>
                          <div className="text-sm text-white font-medium">
                            {file.originalName}
                          </div>
                          <div className="text-xs text-white/50">
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.mimeType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              await notesApi.viewFile(file.fileName);
                            } catch (error) {
                              console.error('View file error:', error);
                              toast.error('Failed to view file');
                            }
                          }}
                          className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors"
                          title="View File"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await notesApi.downloadFile(file.fileName, file.originalName);
                            } catch (error) {
                              console.error('Download file error:', error);
                              toast.error('Failed to download file');
                            }
                          }}
                          className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-colors"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/50">
                  No files attached to this note
                </div>
              )}
            </div>

            {/* Tags */}
            {viewingNote?.tags && viewingNote.tags.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {viewingNote.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleCloseViewModal}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleCloseViewModal();
                  if (viewingNote) {
                    handleEdit(viewingNote);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
              >
                Edit Note
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        onShare={handleShare}
        title={sharingNote?.title || 'Note'}
        type="note"
      />

      {/* Bulk Import Modal */}
      <Modal isOpen={showBulkImport} onClose={() => setShowBulkImport(false)}>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Bulk Import Links
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Paste URLs (one per line)
              </label>
              <textarea
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder="https://example.com&#10;https://youtube.com/watch?v=...&#10;https://github.com/user/repo&#10;https://stackoverflow.com/questions/..."
                rows={8}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-500 focus:outline-none resize-none text-sm"
              />
              <p className="text-xs text-white/50 mt-1">
                💡 Each URL will be automatically categorized and validated
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleBulkImport();
                  setShowBulkImport(false);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                Import Links
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotesPage;