import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search as SearchIcon,
  BookOpen,
  FileText,
  Youtube,
  Link2,
  Clock,
  Tag,
  Pin
} from 'lucide-react';
import { subjectApi, notesApi, type Subject, type Note } from '../services/api';
import { SmartSearch } from '../components/ui';
import { toast } from 'react-hot-toast';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'subject' | 'note';
  noteType?: string;
  tags: string[];
  subjectName?: string;
  createdAt: string;
  updatedAt: string;
  link?: string;
  isPinned?: boolean;
}

interface SearchFilters {
  type: 'all' | 'subjects' | 'notes';
  noteType: 'all' | 'note' | 'video' | 'link' | 'other';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'date' | 'title' | 'updated';
  sortOrder: 'asc' | 'desc';
  tags: string[];
  pinnedOnly: boolean;
}

const GlobalSearchPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all subjects
      const subjectsResponse = await subjectApi.getAll();
      if (subjectsResponse.success && subjectsResponse.data) {
        setSubjects(subjectsResponse.data);
        
        // Load notes for all subjects
        const notesPromises = subjectsResponse.data.map(async (subject) => {
          try {
            const notesResponse = await notesApi.getBySubject(subject._id);
            if (notesResponse.success && notesResponse.data) {
              return notesResponse.data.map(note => ({
                ...note,
                subjectName: subject.name
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error loading notes for subject ${subject._id}:`, error);
            return [];
          }
        });
        
        const allNotesArrays = await Promise.all(notesPromises);
        const flatNotes = allNotesArrays.flat();
        setAllNotes(flatNotes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setLoading(true);
    
    try {
      let searchResults: SearchResult[] = [];
      
      // Combine subjects and notes for searching
      const allItems: SearchResult[] = [
        ...subjects.map(subject => ({
          id: subject._id,
          title: subject.name,
          content: subject.description || '',
          type: 'subject' as const,
          tags: [],
          createdAt: subject.createdAt,
          updatedAt: subject.updatedAt,
          isPinned: false
        })),
        ...allNotes.map(note => ({
          id: note._id,
          title: note.title,
          content: note.content || '',
          type: 'note' as const,
          noteType: note.type,
          tags: note.tags || [],
          subjectName: (note as Note & { subjectName?: string }).subjectName,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          link: note.link,
          isPinned: note.isPinned
        }))
      ];

      // Apply filters
      searchResults = allItems.filter(item => {
        // Type filter
        if (filters.type !== 'all' && item.type !== filters.type.slice(0, -1)) {
          return false;
        }
        
        // Note type filter
        if (filters.noteType !== 'all' && item.type === 'note' && item.noteType !== filters.noteType) {
          return false;
        }
        
        // Pinned filter
        if (filters.pinnedOnly && !item.isPinned) {
          return false;
        }
        
        // Date range filter
        if (filters.dateRange !== 'all') {
          const itemDate = new Date(item.updatedAt);
          const now = new Date();
          const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
          
          switch (filters.dateRange) {
            case 'today':
              if (daysDiff > 1) return false;
              break;
            case 'week':
              if (daysDiff > 7) return false;
              break;
            case 'month':
              if (daysDiff > 30) return false;
              break;
            case 'year':
              if (daysDiff > 365) return false;
              break;
          }
        }
        
        // Tags filter
        if (filters.tags.length > 0) {
          const hasMatchingTags = filters.tags.some(tag => 
            item.tags.some(itemTag => 
              itemTag.toLowerCase().includes(tag.toLowerCase())
            )
          );
          if (!hasMatchingTags) return false;
        }
        
        // Text search
        if (query.trim()) {
          const searchQuery = query.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(searchQuery);
          const matchesContent = item.content.toLowerCase().includes(searchQuery);
          const matchesSubject = item.subjectName?.toLowerCase().includes(searchQuery);
          const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchQuery));
          
          if (!matchesTitle && !matchesContent && !matchesSubject && !matchesTags) {
            return false;
          }
        }
        
        return true;
      });

      // Sort results
      searchResults.sort((a, b) => {
        let compareValue = 0;
        
        switch (filters.sortBy) {
          case 'title':
            compareValue = a.title.localeCompare(b.title);
            break;
          case 'date':
            compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'updated':
            compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case 'relevance':
          default: {
            // Simple relevance scoring based on title match
            const aScore = query ? (a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1) : 1;
            const bScore = query ? (b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1) : 1;
            compareValue = bScore - aScore;
            break;
          }
        }
        
        return filters.sortOrder === 'desc' ? -compareValue : compareValue;
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'subject') {
      navigate(`/notes/${result.id}`);
    } else {
      // Navigate to the subject page and highlight the note
      const note = allNotes.find(n => n._id === result.id);
      if (note) {
        navigate(`/notes/${note.subjectId}?highlight=${result.id}`);
      }
    }
  };

  const getTypeIcon = (result: SearchResult) => {
    if (result.type === 'subject') return <BookOpen className="w-5 h-5 text-blue-400" />;
    
    switch (result.noteType) {
      case 'video': return <Youtube className="w-5 h-5 text-red-400" />;
      case 'link': return <Link2 className="w-5 h-5 text-green-400" />;
      default: return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <SearchIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Global Search</h1>
                <p className="text-white/60 text-sm">Search across all your subjects and notes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Component */}
        <div className="mb-8">
          <SmartSearch
            onSearch={handleSearch}
            results={results}
            loading={loading}
            placeholder="Search across all subjects and notes..."
          />
        </div>

        {/* Results Display */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Search Results ({results.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleResultClick(result)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      {getTypeIcon(result)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                          {result.title}
                        </h3>
                        {result.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                      </div>
                      
                      {result.content && (
                        <p className="text-white/70 text-sm mb-3 line-clamp-2">
                          {result.content}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-xs text-white/50">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {formatDate(result.updatedAt)}</span>
                        </span>
                        
                        {result.subjectName && (
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{result.subjectName}</span>
                          </span>
                        )}
                        
                        {result.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{result.tags.slice(0, 3).join(', ')}</span>
                            {result.tags.length > 3 && <span>+{result.tags.length - 3}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-16 max-w-md mx-auto">
              <SearchIcon className="w-24 h-24 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Start Searching
              </h3>
              <p className="text-purple-200 text-lg">
                Use the search bar above to find subjects and notes across your entire StudySync library
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearchPage;