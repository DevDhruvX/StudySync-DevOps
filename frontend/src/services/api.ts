// services/api.ts - API Service for StudySync Backend

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://studysync-backend-gmhn.onrender.com/api', // Backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for our data
export interface Subject {
  _id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isActive: boolean;
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  stats: {
    totalSubjects: number;
    totalNotes: number;
    totalSharedItems: number;
    loginStreak: number;
    lastLoginDate: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      browser: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      allowDataSharing: boolean;
    };
  };
  createdAt: string;
  lastLogin: string;
}

export interface Note {
  _id: string;
  subjectId: string;
  title: string;
  content?: string;
  link?: string; // kept for backwards compatibility
  links?: Array<{
    url: string;
    title?: string;
    description?: string;
    category?: 'youtube' | 'github' | 'stackoverflow' | 'article' | 'documentation' | 'google-docs' | 'notion' | 'website' | 'other';
    preview?: {
      title?: string;
      description?: string;
      image?: string;
      siteName?: string;
    };
  }>;
  type: 'note' | 'youtube' | 'article' | 'document' | 'link' | 'file' | 'other';
  linkType: 'youtube' | 'article' | 'document' | 'other';
  tags: string[];
  files: {
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }[];
  color?: string;
  isPublic: boolean;
  isPinned: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareSettings {
  allowComments: boolean;
  allowDownload: boolean;
  expiresAt?: string;
}

export interface SharedContent {
  content: Subject | Note;
  contentType: 'subject' | 'note';
  shareSettings: ShareSettings;
  sharedAt: string;
  owner: {
    _id: string;
    name: string;
    avatar: string;
  };
  notesCount?: number;
  sampleNotes?: Pick<Note, '_id' | 'title' | 'content' | 'type' | 'createdAt'>[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

// Subject API calls
export const subjectApi = {
  // Get all subjects
  getAll: async (): Promise<ApiResponse<Subject[]>> => {
    const response = await api.get('/subjects');
    return response.data;
  },

  // Get single subject
  getById: async (id: string): Promise<ApiResponse<Subject>> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  // Create new subject
  create: async (subject: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    const response = await api.post('/subjects', subject);
    return response.data;
  },

  // Update subject
  update: async (id: string, subject: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    const response = await api.put(`/subjects/${id}`, subject);
    return response.data;
  },

  // Delete subject
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};

// Notes API calls
export const notesApi = {
  // Get notes for a subject
  getBySubject: async (subjectId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Note[]>> => {
    const response = await api.get(`/notes/${subjectId}`, { params });
    return response.data;
  },

  // Get single note
  getById: async (id: string): Promise<ApiResponse<Note>> => {
    const response = await api.get(`/notes/note/${id}`);
    return response.data;
  },

  // Create new note
  create: async (note: Partial<Note>): Promise<ApiResponse<Note>> => {
    const response = await api.post('/notes', note);
    return response.data;
  },

  // Create new note with files
  createWithFiles: async (note: Partial<Note>, files: File[]): Promise<ApiResponse<Note>> => {
    const formData = new FormData();
    
    // Add note data
    Object.entries(note).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // For arrays, send as a single JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add files
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await api.post('/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update note
  update: async (id: string, note: Partial<Note>): Promise<ApiResponse<Note>> => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },

  // Update note with files
  updateWithFiles: async (id: string, note: Partial<Note>, files: File[]): Promise<ApiResponse<Note>> => {
    const formData = new FormData();
    
    // Add note data
    Object.entries(note).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // For arrays, send as a single JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add files
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    const response = await api.put(`/notes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete note
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  // Toggle pin status
  togglePin: async (id: string): Promise<ApiResponse<{ isPinned: boolean }>> => {
    const response = await api.patch(`/notes/${id}/pin`);
    return response.data;
  },

  // Get file URL for viewing/downloading
  getFileUrl: (filename: string): string => {
    return `${api.defaults.baseURL}/notes/files/${filename}`;
  },

  // Get download URL for files
  getDownloadUrl: (filename: string): string => {
    return `${api.defaults.baseURL}/notes/files/${filename}/download`;
  },

  // View file with authentication
  viewFile: async (filename: string): Promise<void> => {
    try {
      const response = await api.get(`/notes/files/${filename}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and open in new tab
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error viewing file:', error);
      throw error;
    }
  },

  // Download file with authentication
  downloadFile: async (filename: string, originalName: string): Promise<void> => {
    try {
      const response = await api.get(`/notes/files/${filename}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Delete file from note
  deleteFile: async (noteId: string, filename: string): Promise<ApiResponse<Note>> => {
    const response = await api.delete(`/notes/${noteId}/files/${filename}`);
    return response.data;
  },
};

// Authentication API calls
export const authApi = {
  // Register new user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Change password
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  }
};

// Auth token management
export const authToken = {
  set: (token: string) => {
    localStorage.setItem('studysync_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  get: () => {
    return localStorage.getItem('studysync_token');
  },
  
  remove: () => {
    localStorage.removeItem('studysync_token');
    delete api.defaults.headers.common['Authorization'];
  },
  
  init: () => {
    const token = authToken.get();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// Initialize auth token on import
authToken.init();

// Health check
export const healthCheck = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.get('/health');
  return response.data;
};

// Sharing API
export const sharingApi = {
  // Share a subject
  shareSubject: async (subjectId: string, shareSettings?: Partial<ShareSettings>): Promise<ApiResponse<{
    shareToken: string;
    shareUrl: string;
    shareSettings: ShareSettings;
  }>> => {
    const response = await api.post(`/sharing/subjects/${subjectId}/share`, { shareSettings });
    return response.data;
  },

  // Share a note
  shareNote: async (noteId: string, shareSettings?: Partial<ShareSettings>): Promise<ApiResponse<{
    shareToken: string;
    shareUrl: string;
    shareSettings: ShareSettings;
  }>> => {
    const response = await api.post(`/sharing/notes/${noteId}/share`, { shareSettings });
    return response.data;
  },

  // Unshare a subject
  unshareSubject: async (subjectId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/sharing/subjects/${subjectId}/unshare`);
    return response.data;
  },

  // Unshare a note
  unshareNote: async (noteId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/sharing/notes/${noteId}/unshare`);
    return response.data;
  },

  // Get public shared content
  getPublicContent: async (token: string): Promise<ApiResponse<SharedContent>> => {
    const response = await api.get(`/sharing/public/${token}`);
    return response.data;
  },

  // Get notes for shared subject
  getSharedSubjectNotes: async (token: string, page = 1, limit = 10): Promise<ApiResponse<{
    notes: Note[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    subject: {
      name: string;
      description: string;
      color: string;
    };
  }>> => {
    const response = await api.get(`/sharing/public/${token}/notes?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Import shared content to user's account
  importSharedContent: async (token: string): Promise<ApiResponse<{
    subject?: Subject;
    note?: Note;
    notesCount?: number;
  }>> => {
    const response = await api.post(`/sharing/import/${token}`);
    return response.data;
  }
};

export default api;