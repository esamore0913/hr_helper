import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, Settings, History, CheckCircle2 } from 'lucide-react';
import { Participant, DrawResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface LuckyDrawProps {
  participants: Participant[];
}

export default function LuckyDraw({ participants }: LuckyDrawProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [shufflingNames, setShufflingNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Available pool for non-repeat mode
  const availableParticipants = allowRepeat 
    ? participants 
    : participants.filter(p => !results.some(r => r.participant.id === p.id));

  const startDraw = useCallback(() => {
    if (availableParticipants.length === 0) return;
    
    setIsDrawing(true);
    setWinner(null);
    
    // Create a shuffle animation effect
    const shuffleDuration = 2000; // 2 seconds
    const interval = 80; // switch every 80ms
    const steps = shuffleDuration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      setCurrentIndex(randomIndex);
      currentStep++;

      if (currentStep >= steps) {
        clearInterval(timer);
        const finalWinner = availableParticipants[randomIndex];
        setWinner(finalWinner);
        setIsDrawing(false);
        setResults(prev => [{
          id: Math.random().toString(36).substring(2, 9),
          participant: finalWinner,
          timestamp: Date.now()
        }, ...prev]);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b']
        });
      }
    }, interval);
  }, [availableParticipants, allowRepeat, results]);

  const clearResults = () => {
    if (confirm('確定要清除所有中獎紀錄嗎？')) {
      setResults([]);
      setWinner(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Stage */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl relative overflow-hidden h-[400px] flex flex-col items-center justify-center text-center">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            
            <AnimatePresence mode="wait">
              {isDrawing ? (
                <motion.div
                  key="drawing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="space-y-4"
                >
                  <div className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse">
                    {availableParticipants[currentIndex]?.name}
                  </div>
                  <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">正在抽取幸運兒...</p>
                </motion.div>
              ) : winner ? (
                <motion.div
                  key="winner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-lg" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm">中獎的是！</p>
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900">
                      {winner.name}
                    </h2>
                  </div>
                  <button
                    onClick={startDraw}
                    className="py-3 px-8 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    再抽一次
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-12 h-12 text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">準備好抽籤了嗎？</h2>
                    <p className="text-gray-500 max-w-xs mx-auto text-sm">
                      點擊下方按鈕開始隨機抽取名單中的幸運兒。
                    </p>
                  </div>
                  {participants.length > 0 ? (
                    <button
                      onClick={startDraw}
                      className="py-4 px-12 bg-indigo-600 text-white text-lg font-bold rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200"
                    >
                      開始抽獎
                    </button>
                  ) : (
                    <p className="text-red-500 font-medium">請先在名單來源中加入姓名</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">抽籤設定</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                  允許重複抽中
                </span>
              </label>
              
              <div className="h-6 w-px bg-gray-200" />
              
              <p className="text-sm font-medium text-gray-500">
                剩餘抽取對象: <span className="text-indigo-600 font-bold">{availableParticipants.length}</span> 人
              </p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="w-full md:w-80 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">中獎紀錄</h3>
            </div>
            {results.length > 0 && (
              <button 
                onClick={clearResults}
                className="text-xs text-red-500 font-medium hover:underline"
              >
                清除
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-2">
                  <CheckCircle2 className="w-10 h-10" />
                  <p className="text-xs">尚無紀錄</p>
                </div>
              ) : (
                results.map((res, index) => (
                  <motion.div
                    key={res.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0">
                        {results.length - index}
                      </div>
                      <span className="font-bold text-gray-800">{res.participant.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
