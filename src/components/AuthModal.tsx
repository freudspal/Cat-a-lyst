import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, KeyRound, UserPlus, LogIn, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { DatabaseState, hashPassword, saveDatabase } from '../lib/jsonbin';

interface AuthModalProps {
  dbState: DatabaseState;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

export default function AuthModal({ dbState, onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (trimmedUser.length < 3) {
      setErrorMsg("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 4) {
      setErrorMsg("Password must be at least 4 characters/numbers long.");
      return;
    }

    setIsLoading(true);

    try {
      const hashedPassword = await hashPassword(password);

      if (isRegister) {
        // Registration Flow
        if (password !== confirmPassword) {
          setErrorMsg("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        const userExists = dbState.users.some(
          (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
        );

        if (userExists) {
          setErrorMsg("This username is already taken. Try another kitten name!");
          setIsLoading(false);
          return;
        }

        // Add new user profile
        const updatedUsers = [
          ...dbState.users,
          { username: trimmedUser, passwordHash: hashedPassword }
        ];

        const success = await saveDatabase({
          ...dbState,
          users: updatedUsers
        });

        if (success) {
          setSuccessMsg("Account created! Logging you in...");
          setTimeout(() => {
            onLoginSuccess(trimmedUser);
            onClose();
          }, 1200);
        } else {
          setErrorMsg("Failed to sync registration to backend database. Try again.");
        }
      } else {
        // Login Flow
        const existingUser = dbState.users.find(
          (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
        );

        if (!existingUser) {
          setErrorMsg("User account not found. Try registering first!");
          setIsLoading(false);
          return;
        }

        if (existingUser.passwordHash !== hashedPassword) {
          setErrorMsg("Incorrect password hash. Access Denied.");
          setIsLoading(false);
          return;
        }

        setSuccessMsg("Cat-access granted! Unlocking feline portal...");
        setTimeout(() => {
          onLoginSuccess(existingUser.username);
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("An unexpected auth error occurred. Check browser cryptography.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-indigo-500 blur-sm"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-yellow-300" />
            <h3 className="font-display text-xl font-black text-white uppercase tracking-wider">
              {isRegister ? "Create Squad Account" : "Feline Portal Access"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message banners */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-yellow-300 uppercase tracking-widest pl-1 mb-1 block">
              Squad Leader Name (Username)
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 pr-10 text-white font-sans focus:outline-none focus:border-indigo-400 transition"
              placeholder="e.g. CaptainMeow"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-yellow-300 uppercase tracking-widest pl-1 mb-1 block">
              Access Code / Pin (Password)
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 pr-10 text-white font-sans focus:outline-none focus:border-indigo-400 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <label className="text-[10px] font-black text-yellow-300 uppercase tracking-widest pl-1 mb-1 block">
                Confirm Access Code
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-sans focus:outline-none focus:border-indigo-400 transition"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all font-display text-sm font-black uppercase tracking-wider text-white shadow-lg cursor-pointer hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : isRegister ? "Sign Up & Link Account" : "Authorize Entry"}
          </button>
        </form>

        {/* Change Mode */}
        <div className="mt-6 text-center text-xs text-gray-400 font-medium">
          {isRegister ? (
            <p>
              Already logged in with a feline profile?{" "}
              <button
                onClick={() => { setIsRegister(false); setErrorMsg(null); }}
                className="text-indigo-400 hover:text-indigo-300 underline font-bold"
              >
                Log In Here
              </button>
            </p>
          ) : (
            <p>
              New squad commander?{" "}
              <button
                onClick={() => { setIsRegister(true); setErrorMsg(null); }}
                className="text-indigo-400 hover:text-indigo-300 underline font-bold"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
