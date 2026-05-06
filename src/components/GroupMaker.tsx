import React, { useState } from 'react';
import { Users, LayoutGrid, Plus, Minus, MoveRight, RotateCw, Download } from 'lucide-react';
import { Participant, Group } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface GroupMakerProps {
  participants: Participant[];
}

export default function GroupMaker({ participants }: GroupMakerProps) {
  const [perGroup, setPerGroup] = useState(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalPossible = participants.length > 0 ? Math.ceil(participants.length / perGroup) : 0;

  const generateGroups = () => {
    if (participants.length === 0) return;
    
    setIsGenerating(true);
    
    // Shuffle
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < totalPossible; i++) {
      newGroups.push({
        id: `group-${i}`,
        name: `第 ${i + 1} 組`,
        members: shuffled.slice(i * perGroup, (i + 1) * perGroup)
      });
    }

    // Simulate thinking/animation
    setTimeout(() => {
      setGroups(newGroups);
      setIsGenerating(false);
    }, 800);
  };

  const exportGroups = () => {
    // Header
    const csvRows = [['組別 (Group)', '姓名 (Name)']];
    
    // Data rows
    groups.forEach(group => {
      group.members.forEach(member => {
        csvRows.push([group.name, member.name]);
      });
    });

    // Convert to CSV string with standard quoting
    const csvContent = csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    
    // Add UTF-8 BOM for Excel to display Chinese correctly
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `分組結果_${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Control Panel */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">自動分組功能</h2>
          </div>
          <p className="text-gray-500 text-sm">設定每組人數，系統將為您隨機分配名單。</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">每組人數</span>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
              <button
                onClick={() => setPerGroup(Math.max(2, perGroup - 1))}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-2xl font-black text-indigo-600 w-8 text-center">{perGroup}</span>
              <button
                onClick={() => setPerGroup(Math.min(participants.length, perGroup + 1))}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <MoveRight className="w-6 h-6 text-gray-300 hidden sm:block" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">預計組數</span>
            <div className="text-2xl font-black text-gray-400 h-[56px] flex items-center">
              {totalPossible} <span className="text-sm font-bold ml-1">組</span>
            </div>
          </div>

          <button
            onClick={generateGroups}
            disabled={participants.length < 2 || isGenerating}
            className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center gap-2 group"
          >
            {isGenerating ? (
              <RotateCw className="w-5 h-5 animate-spin" />
            ) : (
              <LayoutGrid className="w-5 h-5 transition-transform group-hover:rotate-12" />
            )}
            執行自動分組
          </button>
        </div>
      </div>

      {/* Results Display */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            分組結果 
            {groups.length > 0 && <span className="text-indigo-600">({groups.length} 組)</span>}
          </h3>
          {groups.length > 0 && (
            <button 
              onClick={exportGroups}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              導出結果
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {groups.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl opacity-30 text-gray-400">
                <Users className="w-12 h-12 mb-2" />
                <p className="font-medium text-sm">點擊上方按鈕開始分組</p>
              </div>
            ) : (
              groups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-900 px-5 py-3 flex items-center justify-between">
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">SUCCESSFUL ASSIGNMENT</span>
                    <span className="text-white font-bold text-xs">{group.name}</span>
                  </div>
                  <div className="p-5 space-y-2">
                    {group.members.map((member, mIdx) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                      >
                        <span className="text-sm font-bold text-gray-700">{member.name}</span>
                        <span className="text-[10px] font-mono text-gray-300">#{mIdx + 1}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-center">
                      <span className="text-[10px] text-gray-400 font-medium">共 {group.members.length} 人</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
