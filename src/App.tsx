import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  MessageSquare,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  MOCK_SAP_PL, 
  MOCK_POS_SIGNALS, 
  MOCK_VENDOR_CLAIMS,
  analyzeLaborVariance,
  generateDisputeResponse
} from './services/geminiService';
import Markdown from 'react-markdown';

// --- Components ---

const StatCard = ({ title, value, change, trend, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
        <Icon className="w-5 h-5 text-zinc-600" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}
      </div>
    </div>
    <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-zinc-900">{value}</p>
  </div>
);

const ModuleHeader = ({ title, subtitle, icon: Icon }: any) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2.5 bg-zinc-900 rounded-xl">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      <p className="text-sm text-zinc-500">{subtitle}</p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'labor' | 'vendor'>('labor');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeResponse, setDisputeResponse] = useState<string | null>(null);

  // Data processing for charts
  const laborChartData = useMemo(() => {
    return MOCK_SAP_PL.filter(d => d.StoreID === "101").map(d => ({
      name: d.Dept,
      budget: d.Budgeted_Hours,
      actual: d.Actual_Hours,
      variance: d.Actual_Hours - d.Budgeted_Hours
    }));
  }, []);

  const handleAnalyzeLabor = async () => {
    setAnalysisLoading(true);
    try {
      const result = await analyzeLaborVariance("Explain the labor variance for Store 101 on 2024-03-08. Why is Grocery so far over budget?");
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      setAnalysisResult("Error generating analysis. Please try again.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateDispute = async (claimId: string) => {
    setSelectedClaim(claimId);
    setDisputeLoading(true);
    try {
      const result = await generateDisputeResponse(claimId);
      setDisputeResponse(result);
    } catch (error) {
      console.error(error);
      setDisputeResponse("Error generating dispute response.");
    } finally {
      setDisputeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-200 z-50">
        <div className="p-6 flex items-center gap-3 border-bottom border-zinc-100 mb-4">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Meijer ACT</span>
        </div>
        
        <nav className="px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('labor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'labor' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Labor Variance
          </button>
          <button 
            onClick={() => setActiveTab('vendor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'vendor' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            Vendor Recovery
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">SV</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Srijaya Vaishnavi</p>
              <p className="text-[10px] text-zinc-500 truncate">Finance Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
              {activeTab === 'labor' ? 'Operational Guardrails' : 'Capital Recovery'}
            </h1>
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <History className="w-3 h-3" />
              Last sync: 2 mins ago
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search Store ID..." 
                className="pl-9 pr-4 py-1.5 bg-zinc-100 border-none rounded-full text-xs focus:ring-2 focus:ring-zinc-900 transition-all w-48"
              />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'labor' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Budgeted Hours" value="1,130" change="+2.4%" trend="up" icon={BarChart3} />
                <StatCard title="Actual Hours" value="1,212" change="+7.2%" trend="up" icon={TrendingUp} />
                <StatCard title="Labor Variance" value="$3,710" change="+12%" trend="up" icon={AlertCircle} />
                <StatCard title="Net Margin Impact" value="-0.04%" change="Critical" trend="down" icon={TrendingUp} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <ModuleHeader 
                    title="Departmental Labor Variance" 
                    subtitle="Store 101 - Week Ending Mar 08" 
                    icon={BarChart3} 
                  />
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={laborChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                        <Tooltip 
                          cursor={{ fill: '#f4f4f5' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="budget" name="Budget" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" name="Actual" fill="#18181b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                  <ModuleHeader 
                    title="AI Narrative" 
                    subtitle="Root Cause Analysis" 
                    icon={MessageSquare} 
                  />
                  
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-[300px]">
                    {analysisResult ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-zinc-600 leading-relaxed markdown-body"
                      >
                        <Markdown>{analysisResult}</Markdown>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="w-6 h-6 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 text-sm">No analysis generated yet. Trigger the logic gate to begin.</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleAnalyzeLabor}
                    disabled={analysisLoading}
                    className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {analysisLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running Tri-Agent Logic...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Generate Narrative
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Open Disputes" value="12" change="-2" trend="down" icon={FileText} />
                <StatCard title="Total At Risk" value="$14,250" change="+$1.2k" trend="up" icon={ShieldAlert} />
                <StatCard title="Recovery Rate" value="92.4%" change="+4.1%" trend="up" icon={CheckCircle2} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Claims List */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-100">
                    <ModuleHeader 
                      title="VendorNet Claims" 
                      subtitle="Pending Dispute Resolution" 
                      icon={FileText} 
                    />
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {MOCK_VENDOR_CLAIMS.map((claim) => (
                      <div 
                        key={claim.ClaimID}
                        onClick={() => handleGenerateDispute(claim.ClaimID)}
                        className={`p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer ${selectedClaim === claim.ClaimID ? 'bg-zinc-50' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${claim.Status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {claim.Status === 'Resolved' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900">{claim.Supplier}</h4>
                            <p className="text-xs text-zinc-500">{claim.ClaimID} • {claim.Status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-900">${claim.Disputed_Amount.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-400">Variance: {claim.Claim_Quantity - claim.Receipt_Quantity} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispute Generator */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                  <ModuleHeader 
                    title="Dispute Shield" 
                    subtitle="Evidence-Backed Response" 
                    icon={ShieldAlert} 
                  />
                  
                  <div className="flex-1 overflow-y-auto bg-zinc-50 rounded-xl p-6 mb-6 min-h-[400px]">
                    {disputeLoading ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-4" />
                        <p className="text-zinc-500 text-sm font-medium">Comparing Receiving Logs vs SAP Dock Receipts...</p>
                      </div>
                    ) : disputeResponse ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-zinc-600 leading-relaxed markdown-body"
                      >
                        <Markdown>{disputeResponse}</Markdown>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <ShieldAlert className="w-12 h-12 text-zinc-200 mb-4" />
                        <p className="text-zinc-400 text-sm">Select a claim to generate an evidence-backed dispute response.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all">
                      Export PDF
                    </button>
                    <button className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all">
                      Submit to VendorNet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-64 right-0 h-10 bg-white border-t border-zinc-200 flex items-center justify-between px-8 text-[10px] font-medium text-zinc-400 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            System Status: Operational
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
            Data Integrity: 99.8%
          </div>
        </div>
        <div className="flex items-center gap-4 italic">
          [Source: SAP Row 12, Workday ID: 8821]
        </div>
      </footer>
    </div>
  );
}
