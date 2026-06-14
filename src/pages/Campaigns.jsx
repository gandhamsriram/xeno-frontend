import React, { useState, useEffect } from 'react';
import API from '../api';
import CampaignDetail from './CampaignDetail';
import { 
  Plus, 
  Send, 
  Sparkles, 
  Eye, 
  Check, 
  Play, 
  FileText, 
  ChevronRight, 
  Layers, 
  MessageCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const Campaigns = ({ selectedCampaignId, setSelectedCampaignId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'wizard', 'detail'

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [campName, setCampName] = useState('');
  const [selectedSegId, setSelectedSegId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [msgTemplate, setMsgTemplate] = useState('');

  // AI Message Helper State
  const [brand, setBrand] = useState('My Brand');
  const [tone, setTone] = useState('friendly');
  const [goal, setGoal] = useState('re-engagement');
  const [aiMsgLoading, setAiMsgLoading] = useState(false);
  const [aiVariants, setAiVariants] = useState([]);

  // Live personalization preview sample customer
  const sampleCustomer = {
    name: 'Aarav Sharma',
    city: 'Mumbai',
    totalSpend: 7500,
    orderCount: 4,
    email: 'aarav.sharma@gmail.com',
    phone: '+919876543210'
  };

  const getPersonalizedPreview = (template) => {
    if (!template) return '';
    return template
      .replace(/\{\{name\}\}/gi, sampleCustomer.name)
      .replace(/\{\{city\}\}/gi, sampleCustomer.city)
      .replace(/\{\{totalSpend\}\}/gi, String(sampleCustomer.totalSpend))
      .replace(/\{\{orderCount\}\}/gi, String(sampleCustomer.orderCount))
      .replace(/\{\{email\}\}/gi, sampleCustomer.email)
      .replace(/\{\{phone\}\}/gi, sampleCustomer.phone);
  };

  // Fetch campaign list
  const fetchCampaignsAndSegments = async () => {
    try {
      setLoading(true);
      const [campRes, segRes] = await Promise.all([
        API.get('/campaigns'),
        API.get('/segments')
      ]);
      setCampaigns(campRes.data);
      setSegments(segRes.data);
      
      // Auto-open if selected campaign ID is passed from dashboard
      if (selectedCampaignId) {
        setView('detail');
      }
    } catch (err) {
      console.error('Error fetching campaigns data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignsAndSegments();
  }, [selectedCampaignId]);

  const handleLaunchCampaign = async (id) => {
    try {
      await API.post(`/campaigns/${id}/launch`);
      fetchCampaignsAndSegments();
    } catch (err) {
      alert('Launch failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Create Campaign Wizard submit
  const handleSaveCampaign = async (launchImmediately = false) => {
    if (!campName.trim() || !selectedSegId || !msgTemplate.trim()) {
      return alert('Please fill in all campaign fields');
    }

    try {
      const res = await API.post('/campaigns', {
        name: campName,
        segmentId: selectedSegId,
        channel: selectedChannel,
        messageTemplate: msgTemplate
      });

      const campaign = res.data;

      if (launchImmediately) {
        await API.post(`/campaigns/${campaign._id}/launch`);
      }

      // Reset
      resetWizard();
      setView('list');
      fetchCampaignsAndSegments();
    } catch (err) {
      alert('Failed to save campaign: ' + (err.response?.data?.error || err.message));
    }
  };

  // Call Claude AI message generator
  const handleGenerateAiMessage = async () => {
    const selectedSeg = segments.find(s => s._id === selectedSegId);
    const segmentDesc = selectedSeg 
      ? `${selectedSeg.name} - ${selectedSeg.description}`
      : 'Our core high value customers';

    try {
      setAiMsgLoading(true);
      setAiVariants([]);
      const res = await API.post('/ai/message', {
        segmentDescription: segmentDesc,
        brand,
        channel: selectedChannel,
        tone,
        goal
      });

      setMsgTemplate(res.data.message);
      setAiVariants(res.data.variants || []);
    } catch (err) {
      alert('AI Message Generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiMsgLoading(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setCampName('');
    setSelectedSegId('');
    setSelectedChannel('email');
    setMsgTemplate('');
    setBrand('My Brand');
    setTone('friendly');
    setGoal('re-engagement');
    setAiVariants([]);
    setSelectedCampaignId(null);
  };

  const handleOpenCampaignDetail = (id) => {
    setSelectedCampaignId(id);
    setView('detail');
  };

  if (view === 'detail') {
    return (
      <CampaignDetail 
        campaignId={selectedCampaignId} 
        onBack={() => {
          setView('list');
          setSelectedCampaignId(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Campaigns</h1>
          <p className="text-gray-400 text-sm mt-1">Design, launch, and track your e-commerce campaigns</p>
        </div>
        {view === 'list' ? (
          <button
            onClick={() => { resetWizard(); setView('wizard'); }}
            className="flex items-center gap-2 bg-crmAccent hover:bg-purple-650 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="px-4 py-2.5 rounded-xl border border-gray-800 bg-crmCard text-gray-400 font-semibold text-sm hover:text-white transition-colors"
          >
            Cancel Wizard
          </button>
        )}
      </div>

      {view === 'list' ? (
        /* Campaigns Roster */
        loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="animate-spin w-8 h-8 border-4 border-crmAccent border-t-transparent rounded-full"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 bg-crmCard rounded-2xl border border-gray-800 text-gray-500 font-medium">
            No campaigns found. Kick off your marketing with "Create Campaign"!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((c) => {
              const sent = c.stats.sent || 0;
              const delivered = c.stats.delivered || 0;
              const opened = c.stats.opened || 0;
              const clicked = c.stats.clicked || 0;
              const converted = c.stats.converted || 0;

              // Sparkline data representing the funnel drop-off trend
              const sparklineData = [
                { value: sent },
                { value: delivered },
                { value: opened },
                { value: clicked },
                { value: converted }
              ];

              return (
                <div
                  key={c._id}
                  onClick={() => handleOpenCampaignDetail(c._id)}
                  className="bg-crmCard p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-crmAccent transition-colors">{c.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'completed' ? 'bg-crmSuccess/10 text-crmSuccess border border-crmSuccess/25' :
                        c.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse' :
                        c.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                        'bg-gray-900 text-gray-500 border border-gray-850'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold bg-gray-900 border border-gray-800 px-2 py-0.5 rounded capitalize">{c.channel}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold truncate">Target: {c.segmentId?.name || 'Deleted Segment'}</p>
                  </div>

                  {/* Sparkline Funnel Trend */}
                  {c.status !== 'draft' && sent > 0 && (
                    <div className="w-24 h-10 flex flex-col items-center justify-center bg-gray-900/40 border border-gray-850 rounded-xl p-1 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <span className="text-[8px] text-gray-500 uppercase tracking-wider font-extrabold">Funnel Trend</span>
                    </div>
                  )}

                  {/* Funnel Counters */}
                  <div className="flex items-center gap-6 text-xs text-gray-400 border-l border-gray-850 pl-6 shrink-0">
                    <div className="text-center">
                      <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Sent</span>
                      <span className="text-white font-extrabold text-sm">{c.status === 'draft' ? '-' : sent.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Clicks</span>
                      <span className="text-white font-extrabold text-sm">{c.status === 'draft' ? '-' : clicked.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-crmSuccess block uppercase font-bold text-[9px] tracking-wider mb-0.5">Conversions</span>
                      <span className="text-crmSuccess font-extrabold text-sm">{c.status === 'draft' ? '-' : converted.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-crmSuccess block uppercase font-bold text-[9px] tracking-wider mb-0.5">Revenue</span>
                      <span className="text-crmSuccess font-extrabold text-sm">{c.status === 'draft' ? '-' : `₹${(c.stats.revenue || 0).toLocaleString()}`}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {c.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchCampaign(c._id);
                        }}
                        className="bg-crmAccent hover:bg-purple-650 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-purple-500/10 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Launch
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCampaignDetail(c._id);
                      }}
                      className="bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Wizard Campaign Creation flow */
        <div className="max-w-3xl mx-auto bg-crmCard rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-scaleUp">
          {/* Progress Header */}
          <div className="bg-gray-900/60 border-b border-gray-800 px-8 py-5 flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold text-crmAccent tracking-wider">Step {wizardStep} of 3</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <span 
                  key={step} 
                  className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                    wizardStep >= step ? 'bg-crmAccent' : 'bg-gray-800'
                  }`}
                ></span>
              ))}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* STEP 1: Basic Campaign settings */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Campaign Info</h2>
                  <p className="text-xs text-gray-500">Provide name, segment targeting, and channel preferences</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Name</label>
                    <input
                      type="text"
                      placeholder="Summer Clearance Special"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent rounded-xl p-3 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Segment</label>
                      <select
                        value={selectedSegId}
                        onChange={(e) => setSelectedSegId(e.target.value)}
                        className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent rounded-xl p-3 text-sm text-white outline-none"
                      >
                        <option value="">Select Audience Segment...</option>
                        {segments.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.audienceSize} customers)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Channel</label>
                      <select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent rounded-xl p-3 text-sm text-white outline-none capitalize"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="sms">SMS</option>
                        <option value="rcs">RCS</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Writing campaign copy */}
            {wizardStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fadeIn">
                {/* Editor & AI trigger */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Message Content</h2>
                      <p className="text-xs text-gray-500">Draft message copy with placeholders</p>
                    </div>
                  </div>

                  <textarea
                    rows="6"
                    placeholder="Hi {{name}}, get 20% off on your next purchase! Valid for online stores inside {{city}}."
                    value={msgTemplate}
                    onChange={(e) => setMsgTemplate(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent rounded-xl p-4 text-xs font-mono text-gray-300 outline-none leading-relaxed"
                  ></textarea>

                  {/* Variant helpers */}
                  {aiVariants.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-gray-850">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Copy Variants generated by Claude</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {aiVariants.map((v, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMsgTemplate(v)}
                            className="bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-left p-3 rounded-xl text-xs text-gray-400 hover:text-white transition-all duration-150 leading-relaxed font-mono"
                          >
                            <span className="text-crmAccent font-extrabold text-[10px] uppercase block mb-1">Variant #{idx + 1}</span>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Claude copywriting panel */}
                <div className="lg:col-span-2 bg-gray-900/40 border border-gray-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-850">
                    <Sparkles className="w-4 h-4 text-crmAccent animate-pulse" />
                    <h3 className="font-extrabold text-white text-sm">Claude Copywriter</h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Brand Name</label>
                      <input 
                        type="text" 
                        value={brand} 
                        onChange={e => setBrand(e.target.value)} 
                        className="w-full bg-gray-950 border border-gray-850 rounded p-1.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Copy Tone</label>
                      <select 
                        value={tone} 
                        onChange={e => setTone(e.target.value)} 
                        className="w-full bg-gray-950 border border-gray-850 rounded p-1.5 text-white outline-none"
                      >
                        <option value="friendly">Friendly</option>
                        <option value="urgent">Urgent</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="witty">Witty</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Campaign Goal</label>
                      <select 
                        value={goal} 
                        onChange={e => setGoal(e.target.value)} 
                        className="w-full bg-gray-950 border border-gray-850 rounded p-1.5 text-white outline-none"
                      >
                        <option value="re-engagement">Re-engagement</option>
                        <option value="holiday discount">Discount Sale</option>
                        <option value="new arrivals">New Arrivals</option>
                        <option value="feedback">Customer Feedback</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAiMessage}
                      disabled={aiMsgLoading || !selectedSegId}
                      className="w-full bg-crmAccent hover:bg-purple-650 disabled:bg-purple-850 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {aiMsgLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Drafting Copy...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate Copy
                        </>
                      )}
                    </button>
                    
                    {!selectedSegId && (
                      <p className="text-[10px] text-crmWarning mt-1 text-center font-medium">Select a target segment in Step 1 first.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Review and preview */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Review & Launch</h2>
                  <p className="text-xs text-gray-500">Confirm details before dispatching messages</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary info */}
                  <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-850 space-y-4 text-sm">
                    <h3 className="font-extrabold text-white text-base">Campaign Details</h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-semibold text-white">{campName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Segment:</span>
                        <span className="font-semibold text-white">
                          {segments.find(s => s._id === selectedSegId)?.name || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Channel:</span>
                        <span className="font-semibold text-white capitalize">{selectedChannel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Estimated Reach:</span>
                        <span className="font-extrabold text-crmAccent">
                          {segments.find(s => s._id === selectedSegId)?.audienceSize || 0} shoppers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Personalization preview */}
                  <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-850 space-y-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Live Personalization Preview (Sample Customer)</span>
                    <div className="p-4 bg-gray-950 rounded-xl border border-gray-850 text-xs leading-relaxed text-gray-300 italic min-h-[90px]">
                      {getPersonalizedPreview(msgTemplate) || 'No template content drafted.'}
                    </div>
                    <span className="text-[9px] text-gray-500 block">Personalizing for mock shopper: {sampleCustomer.name} from {sampleCustomer.city}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-800 mt-8">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep === 1) {
                    setView('list');
                  } else {
                    setWizardStep(w => w - 1);
                  }
                }}
                className="px-5 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
              >
                Back
              </button>

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1 && !campName.trim()) return alert('Please enter a campaign name');
                    if (wizardStep === 1 && !selectedSegId) return alert('Please select a target segment');
                    if (wizardStep === 2 && !msgTemplate.trim()) return alert('Please write a message template');
                    setWizardStep(w => w + 1);
                  }}
                  className="bg-crmAccent hover:bg-purple-650 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
                >
                  Continue
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleSaveCampaign(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveCampaign(true)}
                    className="bg-crmAccent hover:bg-purple-650 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Launch Campaign
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
