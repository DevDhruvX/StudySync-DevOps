import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import App from './App.tsx'

console.log('🚀 StudySync Frontend Starting...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
