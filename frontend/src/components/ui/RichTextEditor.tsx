import { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { motion } from 'framer-motion';
import {
  Image,
  Link,
  Video,
  Code,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Button } from './Button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  readOnly?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your note...",
  height = 400,
  readOnly = false,
  onSave,
  onCancel,
  showActions = true
}) => {
  const [preview, setPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleEditorChange = useCallback((val?: string) => {
    onChange(val || '');
  }, [onChange]);

  const insertMarkdown = (type: string) => {
    const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? -5 : -9;
        break;
      case 'image':
        newText = `![${selectedText || 'alt text'}](image-url)`;
        cursorOffset = selectedText ? -12 : -21;
        break;
      case 'code':
        newText = selectedText.includes('\n') 
          ? `\`\`\`\n${selectedText || 'code'}\n\`\`\``
          : `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? 0 : (selectedText.includes('\n') ? -4 : -1);
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote'}`;
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'list':
        newText = `- ${selectedText || 'list item'}`;
        cursorOffset = selectedText ? 0 : -9;
        break;
      case 'orderedList':
        newText = `1. ${selectedText || 'list item'}`;
        cursorOffset = selectedText ? 0 : -9;
        break;
      case 'youtube': {
        const youtubeId = selectedText.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (youtubeId) {
          newText = `[![YouTube Video](https://img.youtube.com/vi/${youtubeId[1]}/0.jpg)](https://www.youtube.com/watch?v=${youtubeId[1]})`;
        } else {
          newText = `[![YouTube Video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](${selectedText || 'https://www.youtube.com/watch?v=VIDEO_ID'})`;
          cursorOffset = selectedText ? 0 : -54;
        }
        break;
      }
      default:
        return;
    }

    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    const finalText = beforeText + newText + afterText;
    
    onChange(finalText);

    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 10);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : ''}`}>
      {/* Toolbar */}
      {!readOnly && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                onClick={() => insertMarkdown('bold')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('italic')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('code')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Code"
              >
                <Code className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/20"></div>
              <button
                onClick={() => insertMarkdown('link')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Link"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('image')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Image"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('youtube')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="YouTube Video"
              >
                <Video className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-white/20"></div>
              <button
                onClick={() => insertMarkdown('list')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('orderedList')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('quote')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreview(!preview)}
                className={`p-2 rounded-lg transition-colors ${
                  preview 
                    ? 'bg-blue-500 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title={preview ? 'Edit Mode' : 'Preview Mode'}
              >
                {preview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Exit Fullscreen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Editor */}
      <div className="relative">
        <MDEditor
          value={value}
          onChange={handleEditorChange}
          preview={readOnly ? 'preview' : preview ? 'preview' : 'edit'}
          hideToolbar
          height={height}
          data-color-mode="dark"
          visibleDragbar={false}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }
          }}
        />
      </div>

      {/* Action Buttons */}
      {showActions && !readOnly && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between"
        >
          <div className="text-sm text-white/60">
            Supports Markdown, code blocks, links, images, and YouTube videos
          </div>
          
          <div className="flex space-x-3">
            {onCancel && (
              <Button
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white border-0"
              >
                Cancel
              </Button>
            )}
            {onSave && (
              <Button
                onClick={onSave}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm" />
      )}
    </div>
  );
};

export default RichTextEditor;