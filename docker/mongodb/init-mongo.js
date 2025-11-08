// MongoDB initialization script for StudySync
// This script runs when the container starts for the first time

// Switch to the studysync database
db = db.getSiblingDB('studysync');

// Create application user with read/write permissions
db.createUser({
  user: 'studysync_user',
  pwd: 'studysync_password_123',
  roles: [
    {
      role: 'readWrite',
      db: 'studysync'
    }
  ]
});

// Create collections with initial indexes for better performance
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.createCollection('subjects');
db.subjects.createIndex({ "userId": 1 });
db.subjects.createIndex({ "name": 1, "userId": 1 });
db.subjects.createIndex({ "createdAt": 1 });

db.createCollection('notes');
db.notes.createIndex({ "userId": 1 });
db.notes.createIndex({ "subjectId": 1 });
db.notes.createIndex({ "title": "text", "content": "text" }); // Text search
db.notes.createIndex({ "createdAt": 1 });
db.notes.createIndex({ "isPinned": 1 });
db.notes.createIndex({ "isPublic": 1 });

// Insert initial admin user (optional)
db.users.insertOne({
  name: "Admin User",
  email: "admin@studysync.com",
  password: "$2b$10$hash_generated_password", // This should be properly hashed
  role: "admin",
  isVerified: true,
  avatar: "",
  bio: "System Administrator",
  stats: {
    totalSubjects: 0,
    totalNotes: 0,
    totalSharedItems: 0,
    loginStreak: 0,
    lastLoginDate: new Date()
  },
  preferences: {
    theme: "dark",
    notifications: {
      email: true,
      browser: true
    },
    privacy: {
      profileVisibility: "private",
      allowDataSharing: false
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print("StudySync database initialized successfully!");
print("Created user: studysync_user");
print("Created collections: users, subjects, notes");
print("Created indexes for better performance");