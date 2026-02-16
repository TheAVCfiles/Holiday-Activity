import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Share2,
  ClipboardList,
  Fingerprint,
  Scale,
  Download,
  Terminal,
  Activity,
  Zap,
  Award,
  Video,
  FileCheck
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('paygait');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // State for SOP Checklist
  const [checklist, setChecklist] = useState({
    tier0Sealed: true,
    hashesStored: true,
    legalHeadersApplied: false,
    noCryptoFraming: false,
    singleCTADeployed: false,
  });

  // Kinetic Artifact State (Post-Processing)
  const [kineticArtifact, setKineticArtifact] = useState(null);

  // Choreographer Stake Form
  const [stakeData, setStakeData] = useState({
    workTitle: '',
    choreographer: '',
    syntax: 'Py.Rouette', // Default to proprietary
    stakePercentage: 100,
    claimType: 'Whole-Work' // vs Solo
  });

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setKineticArtifact({
        qftPeaks: [0.88, 0.42, 0.91, 0.12, 0.67],
        qrngSeed: "7a29f8e1...d3b2",
        signature: "PyR_v1_HASH_9921_SIG",
        royalty: {
          sc: "0.042 ETH",
          stagecoin: "500 STG",
          streetcred: "+12.5"
        }
      });
      setIsProcessing(false);
      setProcessingComplete(true);
    }, 2500);
  };

  const NavItem = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-white fixed h-full p-6 flex flex-col z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Shield className="text-blue-400" size={32} />
          <h1 className="text-xl font-bold tracking-tight uppercase">StagePort<span className="text-blue-400">OS</span></h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={<Activity size={18} />} label="PayGait Local" active={activeTab === 'paygait'} onClick={() => setActiveTab('paygait')} />
          <NavItem icon={<ClipboardList size={18} />} label="Release Checklist" active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} />
          <NavItem icon={<Fingerprint size={18} />} label="Asset Defense" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
          <NavItem icon={<Scale size={18} />} label="Legal Wrapper" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} />
          <NavItem icon={<Database size={18} />} label="Distribution Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
        </nav>

        <div className="p-4 border border-slate-700 rounded-xl bg-slate-800/50">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Operator Session</p>
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
              <h2 className="text-3xl font-bold">PayGait Local Ingest</h2>
              <p className="text-slate-500 mt-1">High-fidelity kinesthetic hashing &amp; choreographer claim stake.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ingest Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Video className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold">Choreographer's Claim Stake</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Work Title</label>
                      <input 
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="e.g. Serenade Analysis v2"
                        value={stakeData.workTitle}
                        onChange={(e) => setStakeData({...stakeData, workTitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Choreographer</label>
                      <input 
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Name or Studio ID"
                        value={stakeData.choreographer}
                        onChange={(e) => setStakeData({...stakeData, choreographer: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale size={16} className="text-blue-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Syntactic Protection Protocol</span>
                      </div>
                      <p className="text-sm leading-relaxed opacity-90">
                        "I hereby claim the <strong>movement syntax</strong> of this work. This claim utilizes Balanchine's syntax, Laban notation, and Pilates principles processed via <strong>Py.Rouette kinesthetic hashing</strong>. This claim pertains to the movement logic and sequence, <strong>never the bodies</strong>."
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
                      {isProcessing ? <Zap className="animate-spin" size={20} /> : <FileCheck size={20} />}
                      {isProcessing ? 'GENERATING ARTIFACTS...' : 'INGEST & HASH WORK'}
                    </button>
                  </div>
                </div>

                {/* Output Panel */}
                {processingComplete && (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Award className="text-green-600" size={24} />
                      <h3 className="text-xl font-bold">Kinetic Artifact Generated</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <ArtifactCard 
                        title="QFT Peaks" 
                        icon={<Activity size={16} className="text-blue-500" />}
                        value={kineticArtifact.qftPeaks.join(', ')}
                        footer="5 dimensional peaks"
                      />
                      <ArtifactCard 
                        title="QRNG Seed" 
                        icon={<Lock size={16} className="text-purple-500" />}
                        value={kineticArtifact.qrngSeed}
                        footer="Quantum entropy"
                      />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={18} className="text-green-600" />
                        <span className="font-bold text-green-900">Signature: {kineticArtifact.signature}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <Metric label="SC" value={kineticArtifact.royalty.sc} color="bg-blue-100" />
                        <Metric label="Stagecoin" value={kineticArtifact.royalty.stagecoin} color="bg-purple-100" />
                        <Metric label="Street Cred" value={kineticArtifact.royalty.streetcred} color="bg-green-100" />
                      </div>
                    </div>

                    <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                      <Download size={18} />
                      EXPORT STAMP BUNDLE
                    </button>
                  </div>
                )}
              </div>

              {/* Status Panel */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Processing Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Hashing Engine</span>
                      <span className="text-xs font-mono text-green-600">READY</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">QRNG Module</span>
                      <span className="text-xs font-mono text-green-600">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Claim Registry</span>
                      <span className="text-xs font-mono text-blue-600">SYNCED</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-700">
                  <h3 className="text-lg font-bold mb-3">Protected by</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-blue-400" />
                      <span className="text-sm">Stagecoin Royalty</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-purple-400" />
                      <span className="text-sm">Py.Rouette Hash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fingerprint size={16} className="text-green-400" />
                      <span className="text-sm">Whole-Work Claim</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Release Checklist</h2>
              <p className="text-slate-500 mt-1">Standard Operating Procedure for deployment.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="space-y-4">
                <CheckItem 
                  title="Tier-0 Archive Sealed"
                  desc="All source materials archived in cold storage"
                  checked={checklist.tier0Sealed}
                  onToggle={() => setChecklist({...checklist, tier0Sealed: !checklist.tier0Sealed})}
                />
                <CheckItem 
                  title="Hashes Stored Off-Chain"
                  desc="Kinetic hashes backed up to distributed storage"
                  checked={checklist.hashesStored}
                  onToggle={() => setChecklist({...checklist, hashesStored: !checklist.hashesStored})}
                />
                <CheckItem 
                  title="Legal Headers Applied"
                  desc="All files include proper licensing and attribution"
                  checked={checklist.legalHeadersApplied}
                  onToggle={() => setChecklist({...checklist, legalHeadersApplied: !checklist.legalHeadersApplied})}
                />
                <CheckItem 
                  title="No Crypto Framing"
                  desc="Ensure no references to cryptocurrency trading or speculation"
                  checked={checklist.noCryptoFraming}
                  onToggle={() => setChecklist({...checklist, noCryptoFraming: !checklist.noCryptoFraming})}
                />
                <CheckItem 
                  title="Single CTA Deployed"
                  desc="One clear call-to-action for user engagement"
                  checked={checklist.singleCTADeployed}
                  onToggle={() => setChecklist({...checklist, singleCTADeployed: !checklist.singleCTADeployed})}
                />
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Completion Status</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab === 'assets' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Asset Defense</h2>
              <p className="text-slate-500 mt-1">Protect your creative works with kinesthetic hashing.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-600">Asset defense tools and monitoring will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Legal Wrapper</h2>
              <p className="text-slate-500 mt-1">Legal framework and compliance tools.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-600">Legal wrapper configuration and documentation will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Distribution Logs</h2>
              <p className="text-slate-500 mt-1">Track deployment and distribution history.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-600">Distribution logs and analytics will be displayed here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Metric = ({ label, value, color, valueColor = "text-slate-900" }) => (
  <div className={`${color} p-3 rounded-lg`}>
    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">{label}</div>
    <div className={`text-sm font-bold ${valueColor}`}>{value}</div>
  </div>
);

const ArtifactCard = ({ title, icon, value, footer }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-bold uppercase text-slate-500">{title}</span>
    </div>
    <div className="text-sm font-mono text-slate-900 mb-2 break-all">{value}</div>
    <div className="text-[10px] text-slate-400">{footer}</div>
  </div>
);

const CheckItem = ({ title, desc, checked, onToggle }) => (
  <div 
    onClick={onToggle}
    className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition"
  >
    <div className="mt-1">
      {checked ? (
        <CheckCircle size={20} className="text-green-600" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  </div>
);

export default App;
