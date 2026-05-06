import React, { useState, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import { Upload, X, Users, ClipboardList, Trash2, Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { Participant } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ParticipantInputProps {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
}

const MOCK_NAMES = [
  '陳小明', '林美玲', '王大同', '張雅婷', '李家豪', 
  '劉怡君', '吳叔叔', '蔡佩珊', '楊志偉', '許淑芬',
  '鄭名捷', '謝和諧', '郭台銘', '洪秀全', '曾國城'
];

export default function ParticipantInput({ participants, setParticipants }: ParticipantInputProps) {
  const [inputText, setInputText] = useState('');
  const [csvEncoding, setCsvEncoding] = useState<'UTF-8' | 'Big5'>('UTF-8');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identify duplicate names
  const duplicates = useMemo(() => {
    const counts = new Map<string, number>();
    participants.forEach(p => counts.set(p.name, (counts.get(p.name) || 0) + 1));
    return new Set([...counts.entries()].filter(([_, count]) => count > 1).map(([name]) => name));
  }, [participants]);

  const handleTextSubmit = () => {
    const names = inputText
      .split(/\n|,/)
      .map(n => n.trim())
      .filter(n => n !== '');
    
    const newParticipants: Participant[] = names.map(name => ({
      id: Math.random().toString(36).substring(2, 9),
      name
    }));

    setParticipants([...participants, ...newParticipants]);
    setInputText('');
  };

  const loadMockData = () => {
    const newParticipants: Participant[] = MOCK_NAMES.map(name => ({
      id: Math.random().toString(36).substring(2, 9),
      name
    }));
    setParticipants([...participants, ...newParticipants]);
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const uniqueParticipants = participants.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    setParticipants(uniqueParticipants);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      encoding: csvEncoding,
      complete: (results) => {
        // Flatten and clean up the data
        const rows = results.data as any[][];
        const names: string[] = [];

        rows.forEach(row => {
          if (!row || row.length === 0) return;
          const firstVal = row.find(val => val && String(val).trim() !== '');
          if (firstVal && String(firstVal).trim() !== '姓名' && String(firstVal).trim() !== 'Name') {
            names.push(String(firstVal).trim());
          }
        });
        
        const newParticipants: Participant[] = names.map(name => ({
          id: Math.random().toString(36).substring(2, 9),
          name
        }));

        setParticipants([...participants, ...newParticipants]);
      },
      header: false,
      skipEmptyLines: true,
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const clearAll = () => {
    if (confirm('確定要清除所有名單嗎？')) {
      setParticipants([]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Methods */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">貼上姓名名單</h3>
              </div>
              <button
                onClick={loadMockData}
                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                載入模擬名單
              </button>
            </div>
            <textarea
              className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm transition-all"
              placeholder="請輸入姓名，可用逗號或換行分隔...&#10;例如：&#10;陳小明&#10;王大同, 李美華"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!inputText.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              新增至名單
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">上傳 CSV 檔案</h3>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCsvEncoding('UTF-8')}
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                    csvEncoding === 'UTF-8' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  UTF-8
                </button>
                <button
                  onClick={() => setCsvEncoding('Big5')}
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                    csvEncoding === 'Big5' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Big5
                </button>
              </div>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">點擊或拖曳檔案至此</p>
                <p className="text-[10px] text-gray-400 mt-1">系統將自動抓取第一欄作為姓名</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>
        </div>

        {/* List Preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-bottom border-gray-100 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  目前的來源名單 ({participants.length})
                </h3>
              </div>
              {participants.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                  id="clear-all-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  全部移除
                </button>
              )}
            </div>

            {duplicates.size > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-bold text-amber-700">發現 {duplicates.size} 組重複姓名</span>
                </div>
                <button
                  onClick={removeDuplicates}
                  className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-700 underline"
                >
                  一次性移除
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {participants.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                  <Users className="w-12 h-12" />
                  <p className="text-sm">尚未加入任何名單</p>
                </div>
              ) : (
                participants.map((p, index) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors group",
                      duplicates.has(p.name) ? "bg-amber-50/50 border border-amber-100" : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400 w-6">{index + 1}</span>
                      <span className={cn(
                        "text-sm font-medium",
                        duplicates.has(p.name) ? "text-amber-700" : "text-gray-700"
                      )}>{p.name}</span>
                      {duplicates.has(p.name) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded">
                          重複
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
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
