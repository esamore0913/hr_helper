import React, { useState, useEffect } from 'react';
import { UserPlus, Trophy, Users, Info } from 'lucide-react';
import { Participant, AppTab } from './types';
import ParticipantInput from './components/ParticipantInput';
import LuckyDraw from './components/LuckyDraw';
import GroupMaker from './components/GroupMaker';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [tab, setTab] = useState<AppTab>('list');
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hr-tools-participants');
    if (saved) {
      try {
        setParticipants(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load participants', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('hr-tools-participants', JSON.stringify(participants));
  }, [participants]);

  const navItems = [
    { id: 'list', label: '名單來源', icon: UserPlus },
    { id: 'draw', label: '獎品抽籤', icon: Trophy },
    { id: 'group', label: '自動分組', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-gray-900">
                  HR 萬用工具箱
                </h1>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">
                  Multi-Tool for Professionals
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as AppTab)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 relative",
                      isActive 
                        ? "text-indigo-600 bg-white shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-gray-400")} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-indigo-600/5 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">目前名單人數</p>
                <p className="text-sm font-black text-indigo-600">{participants.length} 人</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {participants.length === 0 && tab !== 'list' && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">提醒：名單目前是空的</p>
              <p className="text-sm text-amber-700/80">請先前往「名單來源」加入參與者姓名，才能使用抽籤或分組功能。</p>
            </div>
          </div>
        )}

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {tab === 'list' && (
                <ParticipantInput 
                  participants={participants} 
                  setParticipants={setParticipants} 
                />
              )}
              {tab === 'draw' && (
                <LuckyDraw 
                  participants={participants} 
                />
              )}
              {tab === 'group' && (
                <GroupMaker 
                  participants={participants} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-100 px-6 py-4 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as AppTab)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? "text-indigo-600 scale-110" : "text-gray-400"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32 md:pb-20 text-center space-y-2 opacity-30 pointer-events-none">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          HR Professional Suite v1.0
        </p>
        <p className="text-[10px] text-gray-400">
          Designed for efficiency and accuracy in workforce management.
        </p>
      </footer>
    </div>
  );
}
