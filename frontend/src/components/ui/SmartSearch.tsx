import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Tag,
  FileText,
  BookOpen,
  Youtube,
  Link2,
  X,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from './Button';

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

interface SmartSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  results: SearchResult[];
  loading: boolean;
  placeholder?: string;
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

const SmartSearch: React.FC<SmartSearchProps> = ({
  onSearch,
  results,
  loading,
  placeholder = "Search across all subjects and notes..."
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    noteType: 'all',
    dateRange: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
    tags: [],
    pinnedOnly: false
  });

  const [availableTags] = useState([
    'important', 'urgent', 'review', 'concept', 'example', 
    'practice', 'theory', 'homework', 'exam', 'project'
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim() || Object.values(filters).some(f => 
        Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== 'relevance' && f !== 'desc' && f !== false
      )) {
        onSearch(query, filters);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filters, onSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      noteType: 'all',
      dateRange: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
      tags: [],
      pinnedOnly: false
    });
  };

  const hasActiveFilters = Object.values(filters).some(f => 
    Array.isArray(f) ? f.length > 0 : f !== 'all' && f !== 'relevance' && f !== 'desc' && f !== false
  );

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400 text-black px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getTypeIcon = (result: SearchResult) => {
    if (result.type === 'subject') return <BookOpen className="w-4 h-4" />;
    
    switch (result.noteType) {
      case 'video': return <Youtube className="w-4 h-4" />;
      case 'link': return <Link2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 z-10">
          <Search className="w-5 h-5" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
        />
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              hasActiveFilters || showFilters
                ? 'bg-purple-500 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Content Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Content</option>
                  <option value="subjects">Subjects Only</option>
                  <option value="notes">Notes Only</option>
                </select>
              </div>

              {/* Note Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Note Type</label>
                <select
                  value={filters.noteType}
                  onChange={(e) => handleFilterChange('noteType', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={filters.type === 'subjects'}
                >
                  <option value="all">All Types</option>
                  <option value="note">📝 Notes</option>
                  <option value="video">🎥 Videos</option>
                  <option value="link">🔗 Links</option>
                  <option value="other">📎 Other</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Created</option>
                    <option value="updated">Updated</option>
                    <option value="title">Title</option>
                  </select>
                  <button
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                    title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-white/70">
                <input
                  type="checkbox"
                  checked={filters.pinnedOnly}
                  onChange={(e) => handleFilterChange('pinnedOnly', e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                />
                <span>Pinned items only</span>
              </label>
              
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  className="bg-gray-600 hover:bg-gray-700 text-white border-0 text-sm px-4 py-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-white/60 mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center">
                <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60">No results found</p>
                <p className="text-white/40 text-sm mt-1">
                  Try adjusting your search query or filters
                </p>
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-white/10 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white/10 rounded-lg text-white/70 group-hover:text-white transition-colors">
                        {getTypeIcon(result)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-white truncate">
                            {highlightText(result.title, query)}
                          </h4>
                          {result.isPinned && (
                            <div className="text-yellow-400">📌</div>
                          )}
                        </div>
                        
                        {result.content && (
                          <p className="text-white/60 text-sm line-clamp-2 mb-2">
                            {highlightText(result.content, query)}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-white/40">
                          {result.subjectName && (
                            <span className="flex items-center space-x-1">
                              <BookOpen className="w-3 h-3" />
                              <span>{result.subjectName}</span>
                            </span>
                          )}
                          
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(result.updatedAt)}</span>
                          </span>
                          
                          {result.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{result.tags.slice(0, 2).join(', ')}</span>
                              {result.tags.length > 2 && <span>+{result.tags.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearch;