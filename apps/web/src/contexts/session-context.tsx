"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Session } from '@/types';

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  createSession: (nickname?: string) => Promise<boolean>;
  updateNickname: (nickname: string) => Promise<void>;
  endSession: () => void;
  validateSession: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_KEY = 'mingling_session';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return false;
      
      const parsed = JSON.parse(stored);
      if (!parsed?.token || new Date(parsed.expiresAt) <= new Date()) {
        localStorage.removeItem(SESSION_KEY);
        delete axios.defaults.headers.common['Authorization'];
        setSession(null);
        return false;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      const { data } = await axios.get('/api/v1/sessions/me');
      
      if (data?.success && data?.data) {
        const validatedSession: Session = {
          sessionId: data.data.sessionId,
          username: data.data.username,
          avatar: data.data.avatar,
          nickname: data.data.nickname,
          token: parsed.token,
          expiresAt: data.data.expiresAt,
        };
        setSession(validatedSession);
        localStorage.setItem(SESSION_KEY, JSON.stringify(validatedSession));
        return true;
      } else {
        localStorage.removeItem(SESSION_KEY);
        delete axios.defaults.headers.common['Authorization'];
        setSession(null);
        return false;
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      delete axios.defaults.headers.common['Authorization'];
      setSession(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    validateSession().finally(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, [validateSession]);

  const createSession = useCallback(async (nickname?: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/v1/sessions', { nickname });
      const newSession: Session = data.data;
      setSession(newSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newSession.token}`;
      return true;
    } catch (error) {
      console.error('Failed to create session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNickname = useCallback(async (nickname: string) => {
    if (!session) return;
    try {
      const { data } = await axios.patch('/api/v1/sessions/me/nickname', { nickname });
      const updated = { ...session, nickname: data.data.nickname };
      setSession(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update nickname:', error);
    }
  }, [session]);

  const endSession = useCallback(() => {
    if (session) {
      axios.delete('/api/v1/sessions/me').catch(() => {});
    }
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }, [session]);

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        createSession,
        updateNickname,
        endSession,
        validateSession,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}