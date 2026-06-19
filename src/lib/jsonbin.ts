import { Question } from '../types';

export interface UserProfile {
  username: string;
  passwordHash: string;
}

export interface CustomQuiz {
  id: string;
  title: string;
  creator: string;
  isPublic: boolean;
  questions: Question[];
}

export interface DatabaseState {
  users: UserProfile[];
  quizzes: CustomQuiz[];
}

const LOCAL_STORAGE_KEY = 'catalyst_full_database_v1';

// Initial dummy database if nothing exists
const initialDatabase: DatabaseState = {
  users: [],
  quizzes: []
};

// Access Vite env vars
const API_KEY = (import.meta as any).env?.VITE_JSONBIN_API_KEY || "";
const BIN_ID = (import.meta as any).env?.VITE_JSONBIN_BIN_ID || "";

// Simple reactive subscriber system to notify the UI when the database updates
type DatabaseListener = (db: DatabaseState) => void;
const listeners = new Set<DatabaseListener>();

export function subscribeToDatabase(listener: DatabaseListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let cachedDb: DatabaseState = { ...initialDatabase };
let isLoaded = false;
let isSaving = false;

// Trigger notifications
function notifyListeners() {
  for (const listener of listeners) {
    listener({ ...cachedDb });
  }
}

// SHA-256 hashing helper natively in browser using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fetch database from JSONBin or LocalStorage
export async function loadDatabase(): Promise<DatabaseState> {
  if (isLoaded) return cachedDb;

  if (API_KEY && BIN_ID) {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': API_KEY,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // JSONBin wraps current values under "record"
        if (data.record && (Array.isArray(data.record.users) || Array.isArray(data.record.quizzes))) {
          cachedDb = {
            users: data.record.users || [],
            quizzes: data.record.quizzes || [],
          };
          isLoaded = true;
          notifyListeners();
          return cachedDb;
        }
      } else {
        console.warn("JSONBin load failed, falling back to LocalStorage:", response.statusText);
      }
    } catch (e) {
      console.error("JSONBin load network error, falling back to LocalStorage:", e);
    }
  }

  // Fallback to LocalStorage
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
      cachedDb = JSON.parse(localData);
    } else {
      cachedDb = { ...initialDatabase };
    }
  } catch (e) {
    console.error("Failed to read from local storage", e);
    cachedDb = { ...initialDatabase };
  }

  isLoaded = true;
  notifyListeners();
  return cachedDb;
}

// Save database to JSONBin or LocalStorage
export async function saveDatabase(newDb: DatabaseState): Promise<boolean> {
  cachedDb = { ...newDb };
  notifyListeners();

  // Always back up locally
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cachedDb));
  } catch (e) {
    console.error("Failed to back up to local storage", e);
  }

  if (API_KEY && BIN_ID) {
    isSaving = true;
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'X-Master-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cachedDb),
      });
      isSaving = false;
      if (response.ok) {
        return true;
      } else {
        console.error("Failed to save to JSONBin:", response.statusText);
        return false;
      }
    } catch (e) {
      console.error("Network error saving to JSONBin:", e);
      isSaving = false;
      return false;
    }
  }

  return true;
}

export function getCachedDatabase(): DatabaseState {
  return cachedDb;
}

export function getIsSaving(): boolean {
  return isSaving;
}

export function getIsLoaded(): boolean {
  return isLoaded;
}

export function isJsonBinConnected(): boolean {
  return !!(API_KEY && BIN_ID);
}
