
import React, { useState } from 'react';
import { Database, Table, Link2, Info, Code, Zap, Layers, RefreshCw, Terminal, Clock } from 'lucide-react';
import { DBOrchestrator } from '../dbOrchestrator';

const TechnicalSpec: React.FC = () => {
  const sqlLogs = DBOrchestrator.getLog();
  const [activeTab, setActiveTab] = useState<'schema' | 'logs'>('schema');

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 서론 */}
      <div className="bg-indigo-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Database size={28} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">System Data Architecture</h2>
          </div>
          <p className="text-indigo-200 font-medium max-w-2xl leading-relaxed">
            StaySync 게스트하우스 시스템의 안정적인 운영을 위한 SQLite 데이터 스키마 및 오케스트레이션 로직입니다. 
            모든 UI 액션은 즉시 SQL 문으로 변환되어 로컬 데이터베이스에 동기화됩니다.
          </p>
          <div className="pt-4 flex gap-4">
            <button 
              onClick={() => setActiveTab('schema')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schema' ? 'bg-white text-indigo-900 shadow-xl' : 'bg-indigo-800/50 text-indigo-200'}`}
            >
              스키마 정의
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white text-indigo-900 shadow-xl' : 'bg-indigo-800/50 text-indigo-200'}`}
            >
              SQL 실행 로그 ({sqlLogs.length})
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
      </div>

      {activeTab === 'schema' ? (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
          {/* 테이블 정의 섹션 */}
          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="text-indigo-600" size={24} />
                <h3 className="text-xl font-black text-slate-800">1. Rooms (객실 마스터)</h3>
              </div>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">Master Table</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Column</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Constraint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  <tr>
                    <td className="px-6 py-4 font-black text-indigo-600">id</td>
                    <td className="px-6 py-4 font-mono text-xs">TEXT</td>
                    <td className="px-6 py-4 text-slate-600">객실 식별자</td>
                    <td className="px-6 py-4 font-bold text-rose-500">PRIMARY KEY</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-black text-slate-800">price</td>
                    <td className="px-6 py-4 font-mono text-xs">INTEGER</td>
                    <td className="px-6 py-4 text-slate-600">기본 숙박 요금</td>
                    <td className="px-6 py-4 font-bold text-slate-400">NOT NULL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="text-emerald-600" size={24} />
                <h3 className="text-xl font-black text-slate-800">2. Invoices (정산 데이터)</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Financial Table</span>
            </div>
            <div className="p-8">
               <div className="bg-slate-900 rounded-2xl p-6 text-indigo-300 font-mono text-xs leading-relaxed">
                  <p>-- Invoice Skeleton Creation Logic (Prepared by Data Orchestrator)</p>
                  <p className="mt-2 text-white">CREATE TABLE Invoices (</p>
                  <p className="pl-4">id TEXT PRIMARY KEY,</p>
                  <p className="pl-4">reservationId TEXT REFERENCES Reservations(id),</p>
                  <p className="pl-4">totalAmount INTEGER NOT NULL,</p>
                  <p className="pl-4">status TEXT DEFAULT 'DRAFT',</p>
                  <p className="pl-4 text-slate-500">-- The following fields are handled by External Logic</p>
                  <p className="pl-4 text-slate-500 opacity-50">invoiceNo TEXT,</p>
                  <p className="pl-4 text-slate-500 opacity-50">invoiceDate DATE,</p>
                  <p className="pl-4 text-slate-500 opacity-50">currency_usdmxn NUMERIC,</p>
                  <p className="pl-4">FOREIGN KEY(reservationId) REFERENCES Reservations(id)</p>
                  <p>);</p>
               </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-4">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Entity Relation</h4>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Reservations → Invoices</span>
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">1 : 1</span>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Reservations → BookedServices</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">1 : N</span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 flex flex-col justify-center">
               <div className="flex items-start gap-3">
                 <Zap className="text-indigo-600 mt-1" size={24} />
                 <div>
                   <h5 className="font-black text-indigo-900 text-sm">Offline-First Logic</h5>
                   <p className="text-xs text-indigo-700 mt-2 leading-relaxed font-medium">
                     모든 데이터 변경 사항은 SQL 명령어로 즉시 직렬화됩니다. <br/>
                     Invoice Skeleton은 'PENDING' 상태 진입 시 자동으로 생성되며, 최종 정산 완료 전까지 'DRAFT' 상태를 유지합니다.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Terminal size={20} className="text-indigo-600" />
              SQLite Execution Log
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Stream</span>
          </div>
          
          <div className="space-y-3">
            {sqlLogs.length === 0 ? (
              <div className="bg-white rounded-[32px] p-20 border border-slate-200 text-center">
                <Info size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm italic">실행된 SQL 명령어가 아직 없습니다. 예약을 생성하거나 수정해 보세요.</p>
              </div>
            ) : (
              sqlLogs.map((log, idx) => (
                <div key={idx} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg transition-all hover:border-indigo-500/50 group">
                  <div className="px-6 py-3 bg-slate-800/50 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.statement.startsWith('INSERT') ? 'bg-emerald-500' : log.statement.startsWith('UPDATE') ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.statement.split(' ')[0]} ACTION</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <code className="text-indigo-300 font-mono text-sm leading-relaxed block break-words">
                      {log.statement}
                    </code>
                    {log.params && log.params.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Bind Parameters</p>
                        <div className="flex flex-wrap gap-2">
                          {log.params.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-mono border border-slate-700">
                              {typeof p === 'string' ? `'${p}'` : p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalSpec;
