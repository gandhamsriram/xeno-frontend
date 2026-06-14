import React, { useState } from 'react';
import API from '../api';
import { 
  Sparkles, 
  Bot, 
  Send, 
  CheckCircle2, 
  Loader2, 
  MessageCircle, 
  BarChart, 
  ChevronRight,
  TrendingUp,
  Mail,
  Smartphone,
  PhoneCall
} from 'lucide-react';

const CampaignAgent = ({ setActiveTab, setSelectedCampaignId }) => {
  const [prompt, setPrompt] = useState('');
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepsLog, setStepsLog] = useState([
    { id: 'analysis', name: 'Analyze Customer Data', desc: 'Scan metrics for dormant, VIP, and at-risk behaviors', status: 'idle', log: '' },
    { id: 'segment', name: 'Create Audience Segment', desc: 'Compile dynamic query filters and register segment', status: 'idle', log: '' },
    { id: 'channel', name: 'Determine Optimal Channel', desc: 'Aggregate customer preferred channels and historical open rates', status: 'idle', log: '' },
    { id: 'campaign', name: 'Generate Campaign Template', desc: 'Generate personalized D2C copy using copywriter rules', status: 'idle', log: '' },
    { id: 'launch', name: 'Launch & Dispatch Campaign', desc: 'Queue and send batch payloads via carrier service stub', status: 'idle', log: '' }
  ]);
  
  const [result, setResult] = useState(null);

  const samplePrompts = [
    { text: "Bring back customers who have not purchased in 90 days", label: "Dormant Winback" },
    { text: "Reward VIP customers who spent over ₹7000 with private sale coupons", label: "VIP Loyalty Promotion" },
    { text: "Re-engage customers at risk of churning soon", label: "Churn Prevention" },
    { text: "Increase repeat purchases from dormant high-value customers", label: "Repeat Buyers Push" }
  ];

  const handleRunAgent = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setRunning(true);
    setResult(null);
    setCurrentStep(0);
    
    // Reset steps
    const reset = stepsLog.map(s => ({ ...s, status: 'idle', log: '' }));
    setStepsLog(reset);

    // Helper to simulate step transitions in UI while backend executes
    const updateUIState = (stepId, status, logText) => {
      setStepsLog(prev => prev.map(s => {
        if (s.id === stepId) {
          return { ...s, status, log: logText || s.log };
        }
        return s;
      }));
    };

    try {
      // Step 1: Start Analysis
      updateUIState('analysis', 'running', 'Connecting to analytics server...');
      await new Promise(r => setTimeout(r, 1200));

      // Post to backend to run workflow
      const apiPromise = API.post('/ai/agent/run', { prompt });

      // Step 2: Segment Creation in UI
      updateUIState('analysis', 'completed', 'Identified target criteria.');
      updateUIState('segment', 'running', 'Drafting MongoDB query rules...');
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 1200));

      // Step 3: Channel selection in UI
      updateUIState('segment', 'completed', 'Segment generated successfully.');
      updateUIState('channel', 'running', 'Aggregating open rates and click performance...');
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 1200));

      // Step 4: Campaign creation in UI
      updateUIState('channel', 'completed', 'Selected optimal delivery channel.');
      updateUIState('campaign', 'running', 'Compiling personalization fields...');
      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 1250));

      // Step 5: Launch in UI
      updateUIState('campaign', 'completed', 'Drafted personalized copy template.');
      updateUIState('launch', 'running', 'Pushing queue jobs to campaign batch engine...');
      setCurrentStep(4);

      // Await actual API execution
      const res = await apiPromise;

      // Finish launch in UI
      updateUIState('launch', 'completed', 'All messages successfully dispatched!');
      setCurrentStep(5);
      
      // Update logs with actual backend responses
      setStepsLog(prev => prev.map(s => {
        const matchingStepObj = res.data.steps.find(stepItem => stepItem.step === s.id);
        if (matchingStepObj) {
          return { ...s, log: matchingStepObj.message };
        }
        return s;
      }));

      setResult({
        campaignId: res.data.campaignId,
        segmentId: res.data.segmentId,
        steps: res.data.steps
      });

    } catch (err) {
      console.error('Agent execution failure:', err);
      // Mark current step as error
      setStepsLog(prev => prev.map((s, idx) => {
        if (idx === currentStep) {
          return { ...s, status: 'failed', log: 'Error: ' + (err.response?.data?.error || err.message) };
        }
        return s;
      }));
    } finally {
      setRunning(false);
    }
  };

  const handleTrackCampaign = () => {
    if (result && result.campaignId) {
      setSelectedCampaignId(result.campaignId);
      setActiveTab('campaigns');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-crmAccent/15 flex items-center justify-center border border-purple-500/25">
          <Bot className="w-7 h-7 text-crmAccent animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Campaign Agent</h1>
          <p className="text-gray-400 text-sm mt-0.5">Define your D2C growth objective and let Xeno CRM execute it end-to-end</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input & Prompt Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-crmAccent" />
              Agent Command Center
            </h2>

            <form onSubmit={handleRunAgent} className="space-y-4">
              <div className="relative">
                <textarea
                  rows="4"
                  disabled={running}
                  placeholder="Describe your marketing objective in simple terms, e.g., 'Increase repeat purchases from dormant high-value customers who spent over ₹5000 and haven't shopped in 90 days.'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent focus:ring-2 focus:ring-purple-500/20 rounded-2xl p-4 text-sm text-white outline-none placeholder-gray-650 transition-all duration-200 resize-none leading-relaxed"
                  required
                ></textarea>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-500 font-semibold italic">Minimal input required · Autonomous execution</p>
                <button
                  type="submit"
                  disabled={running || !prompt.trim()}
                  className="flex items-center gap-2 bg-crmAccent hover:bg-purple-650 disabled:bg-purple-850 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200"
                >
                  {running ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Agent Active...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4.5 h-4.5" />
                      Run Campaign Agent
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Strategy Suggestions templates */}
            <div className="space-y-3 pt-5 border-t border-gray-850/60">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Suggested Growth Objectives</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={running}
                    onClick={() => setPrompt(p.text)}
                    className="bg-gray-950 border border-gray-850 hover:border-gray-800 text-left p-3.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all duration-150 flex flex-col justify-between hover:shadow-md"
                  >
                    <span className="text-crmAccent font-extrabold text-[9px] uppercase tracking-wider block mb-1">{p.label}</span>
                    <span className="font-medium line-clamp-2 leading-relaxed">{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Success Result Container */}
          {result && (
            <div className="bg-crmCard p-6 rounded-3xl border border-crmSuccess/25 bg-crmSuccess/5 shadow-xl space-y-5 animate-scaleUp">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-crmSuccess/10 text-crmSuccess flex items-center justify-center border border-crmSuccess/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Campaign Strategy Launched</h3>
                    <p className="text-xs text-gray-400 mt-0.5">AI Campaign Agent successfully finished the setup pipelines.</p>
                  </div>
                </div>
                <button
                  onClick={handleTrackCampaign}
                  className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-850 hover:text-white text-crmSuccess font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <BarChart className="w-3.5 h-3.5" />
                  Track Live Analytics
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Checklist Pipeline Section */}
        <div className="bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-850 flex justify-between items-center">
              <h3 className="font-extrabold text-white text-base">Execution Pipeline</h3>
              {running && <Loader2 className="w-4 h-4 text-crmAccent animate-spin" />}
            </div>

            <div className="space-y-6">
              {stepsLog.map((step, idx) => {
                const isIdle = step.status === 'idle';
                const isRunning = step.status === 'running';
                const isCompleted = step.status === 'completed';
                const isFailed = step.status === 'failed';

                return (
                  <div key={step.id} className="flex gap-4 relative">
                    {/* Pipeline vertical timeline line */}
                    {idx < stepsLog.length - 1 && (
                      <span className={`absolute left-3 top-7 w-[1px] h-10 ${
                        idx < currentStep ? 'bg-purple-550' : 'bg-gray-850'
                      }`}></span>
                    )}

                    {/* Node status icon */}
                    <div className="relative z-10">
                      {isIdle && (
                        <div className="w-6.5 h-6.5 rounded-full bg-gray-950 border border-gray-800 text-gray-650 flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </div>
                      )}
                      {isRunning && (
                        <div className="w-6.5 h-6.5 rounded-full bg-purple-550/15 border border-crmAccent text-crmAccent flex items-center justify-center">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </div>
                      )}
                      {isCompleted && (
                        <div className="w-6.5 h-6.5 rounded-full bg-purple-550 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {isFailed && (
                        <div className="w-6.5 h-6.5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs">
                          !
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-xs font-extrabold tracking-wide uppercase ${
                        isRunning ? 'text-crmAccent' : (isCompleted ? 'text-white' : 'text-gray-500')
                      }`}>{step.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{step.desc}</p>
                      {step.log && (
                        <div className={`p-2.5 rounded-xl border text-[10px] leading-relaxed font-semibold italic ${
                          isFailed 
                            ? 'bg-red-500/10 border-red-500/15 text-red-400' 
                            : 'bg-gray-900/50 border-gray-850/80 text-gray-400'
                        } mt-2`}>
                          {step.log}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-850 flex items-center gap-1.5 text-gray-650 text-[10px] font-mono justify-center">
            <Bot className="w-4 h-4" />
            <span>Autonomous Agent Logs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAgent;
