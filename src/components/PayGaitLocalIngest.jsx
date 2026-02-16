import React, { useState } from 'react';
import { Video, Scale, Fingerprint, Zap, Terminal } from 'lucide-react';

const PayGaitLocalIngest = () => {
  const [activeTab, setActiveTab] = useState('paygait');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [stakeData, setStakeData] = useState({
    workTitle: '',
    choreographer: ''
  });

  const handleProcess = async () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingComplete(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Holiday Activity</h1>
          <p className="text-slate-400 text-sm mt-1">Choreographic Rights Management</p>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('paygait')}
            className={`w-full text-left px-4 py-3 rounded-xl transition ${
              activeTab === 'paygait' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            PayGait Ingest
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`w-full text-left px-4 py-3 rounded-xl transition ${
              activeTab === 'checklist' 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Checklist
          </button>
        </nav>

        {/* Operator Session Status */}
        <div className="mt-8 p-4 border border-slate-700 rounded-xl bg-slate-800/50">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">
            Operator Session
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-mono">NODE: CANONICAL-01</span>
            </div>
            <Terminal size={14} className="text-slate-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 flex-1 p-10 bg-[#f8fafc]">
        {activeTab === 'paygait' && (
          <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">PayGait Local Ingest</h2>
              <p className="text-slate-500 mt-1">
                High-fidelity kinesthetic hashing & choreographer claim stake.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ingest Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Video className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">
                      Choreographer's Claim Stake
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Work Title
                      </label>
                      <input
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="e.g. Serenade Analysis v2"
                        value={stakeData.workTitle}
                        onChange={(e) =>
                          setStakeData({ ...stakeData, workTitle: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Choreographer
                      </label>
                      <input
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Name or Studio ID"
                        value={stakeData.choreographer}
                        onChange={(e) =>
                          setStakeData({ ...stakeData, choreographer: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale size={16} className="text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                          Syntactic Protection Protocol
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed opacity-90">
                        "I hereby claim the <strong>movement syntax</strong> of this work. 
                        This claim utilizes Balanchine's syntax, Laban notation, and Pilates 
                        principles processed via <strong>Py.Rouette kinesthetic hashing</strong>. 
                        This claim pertains to the movement logic and sequence,{' '}
                        <strong>never the bodies</strong>."
                      </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Fingerprint size={120} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Zap className="animate-spin" size={20} />
                          GENERATING ARTIFACTS...
                        </>
                      ) : (
                        <>
                          <Zap size={20} />
                          INGEST & HASH WORK
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Panel */}
              {processingComplete && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h4 className="font-bold text-green-900 mb-2">Processing Complete</h4>
                  <p className="text-sm text-green-700">
                    Work has been successfully ingested and hashed.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="max-w-5xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Checklist</h2>
              <p className="text-slate-500 mt-1">Track your progress</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-600">Checklist items will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayGaitLocalIngest;
