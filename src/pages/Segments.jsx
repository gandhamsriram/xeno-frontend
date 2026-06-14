import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  Users, 
  ChevronRight, 
  Calendar,
  X,
  Loader2,
  ListFilter,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';

const Segments = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'build'

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Conversational Command Bar
  const [conversationalPrompt, setConversationalPrompt] = useState('');
  const [conversationalLoading, setConversationalLoading] = useState(false);

  // Builder state
  const [segmentId, setSegmentId] = useState(null); // for editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [operator, setOperator] = useState('AND');
  const [conditions, setConditions] = useState([
    { field: 'totalSpend', operator: 'gt', value: '5000' }
  ]);
  const [aiExplanation, setAiExplanation] = useState('');

  // Live Preview
  const [previewSize, setPreviewSize] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Load Segments
  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/segments');
      setSegments(res.data);
    } catch (err) {
      console.error('Error fetching segments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const res = await API.get('/segments/suggestions');
      setSuggestions(res.data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchSegments();
      fetchSuggestions();
    }
  }, [view]);

  // Debounced Live Preview
  useEffect(() => {
    if (view !== 'build') return;
    
    const rules = { operator, conditions };
    
    const isComplete = conditions.every(c => c.field && c.operator && c.value !== '');
    if (!isComplete) {
      setPreviewSize(null);
      return;
    }

    setPreviewLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await API.post('/segments/preview', { rules });
        setPreviewSize(res.data.audienceSize);
      } catch (err) {
        console.error('Preview error:', err);
        setPreviewSize(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounce);
  }, [conditions, operator, view]);

  // Condition handlers
  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'totalSpend', operator: 'gt', value: '' }]);
  };

  const handleRemoveCondition = (index) => {
    const updated = conditions.filter((_, idx) => idx !== index);
    setConditions(updated.length > 0 ? updated : [{ field: 'totalSpend', operator: 'gt', value: '' }]);
  };

  const handleConditionChange = (index, key, val) => {
    const updated = [...conditions];
    updated[index][key] = val;
    setConditions(updated);
  };

  // Build Segment with AI (from modal or conversational bar)
  const executeAiBuild = async (promptText) => {
    try {
      const res = await API.post('/ai/segment', { prompt: promptText });
      
      const { rules, explanation } = res.data.segment ? res.data : { rules: res.data.rules, explanation: res.data.explanation };
      
      if (rules) {
        if (rules.operator) setOperator(rules.operator);
        if (rules.conditions) setConditions(rules.conditions);
        setAiExplanation(explanation || 'AI generated segment');
        setName(promptText.substring(0, 35) + ' (AI)');
        setDescription(explanation);
        setView('build');
      }
    } catch (err) {
      alert('AI Segment Building failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAiBuild = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    try {
      setAiLoading(true);
      await executeAiBuild(aiPrompt);
      setShowAiModal(false);
      setAiPrompt('');
    } finally {
      setAiLoading(false);
    }
  };

  const handleConversationalBuild = async (e) => {
    e.preventDefault();
    if (!conversationalPrompt) return;
    try {
      setConversationalLoading(true);
      await executeAiBuild(conversationalPrompt);
      setConversationalPrompt('');
    } finally {
      setConversationalLoading(false);
    }
  };

  const handleCreateSuggestedSegment = async (sug) => {
    try {
      setLoading(true);
      await API.post('/segments', {
        name: sug.name,
        description: sug.description,
        rules: sug.rules
      });
      fetchSegments();
      fetchSuggestions();
    } catch (err) {
      alert('Error creating suggested segment: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Save Segment
  const handleSaveSegment = async () => {
    if (!name.trim()) return alert('Please enter a segment name');
    const rules = { operator, conditions };

    try {
      if (segmentId) {
        await API.put(`/segments/${segmentId}`, { name, description, rules });
      } else {
        await API.post('/segments', { name, description, rules });
      }
      setView('list');
      resetBuilder();
    } catch (err) {
      alert('Error saving segment: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditSegment = (seg) => {
    setSegmentId(seg._id);
    setName(seg.name);
    setDescription(seg.description);
    setOperator(seg.rules.operator || 'AND');
    setConditions(seg.rules.conditions || []);
    setView('build');
  };

  const handleDeleteSegment = async (id) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    try {
      await API.delete(`/segments/${id}`);
      fetchSegments();
    } catch (err) {
      alert('Error deleting segment: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetBuilder = () => {
    setSegmentId(null);
    setName('');
    setDescription('');
    setOperator('AND');
    setConditions([{ field: 'totalSpend', operator: 'gt', value: '5000' }]);
    setAiExplanation('');
    setPreviewSize(null);
  };

  const handleNewSegmentClick = () => {
    resetBuilder();
    setView('build');
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Segments</h1>
          <p className="text-gray-400 text-sm mt-1">Group shoppers dynamically using rule filters and AI</p>
        </div>
        {view === 'list' ? (
          <button
            onClick={handleNewSegmentClick}
            className="flex items-center gap-2 bg-crmAccent hover:bg-purple-650 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create Segment
          </button>
        ) : (
          <button
            onClick={() => setView('list')}
            className="px-4 py-2.5 rounded-xl border border-gray-800 bg-crmCard text-gray-400 font-semibold text-sm hover:text-white transition-colors"
          >
            Cancel Builder
          </button>
        )}
      </div>

      {view === 'list' ? (
        /* Segment List View */
        <>
          {/* Natural Language Conversational Command Bar */}
          <div className="bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-crmAccent animate-pulse" />
              Conversational Segment Builder
            </h2>
            <form onSubmit={handleConversationalBuild} className="flex gap-4">
              <input
                type="text"
                placeholder="Type a query, e.g. 'Customers who spent more than ₹5000 and have not ordered in 60 days'..."
                value={conversationalPrompt}
                onChange={(e) => setConversationalPrompt(e.target.value)}
                className="flex-1 bg-gray-900/60 border border-gray-850 focus:border-crmAccent focus:ring-2 focus:ring-purple-550/15 rounded-xl p-3 text-sm text-white outline-none placeholder-gray-650 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={conversationalLoading || !conversationalPrompt.trim()}
                className="bg-crmAccent hover:bg-purple-650 disabled:bg-purple-850 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center gap-2"
              >
                {conversationalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling Rules...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Build Segment
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI suggested audiences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">AI-Suggested Audiences</h2>
            </div>
            
            {suggestionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-crmCard p-5 rounded-2xl border border-gray-800 animate-pulse h-36"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestions.map((sug) => (
                  <div 
                    key={sug.id} 
                    className="bg-crmCard p-5 rounded-2xl border border-gray-800/80 hover:border-gray-700/85 transition-all duration-200 flex flex-col justify-between h-38 hover:shadow-lg group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-white text-xs tracking-wider line-clamp-1">{sug.name}</h4>
                        <span className="text-[10px] font-bold text-crmAccent bg-purple-555/10 px-2 py-0.5 rounded-full border border-purple-550/20 shrink-0">
                          {sug.audienceSize} matched
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 leading-relaxed line-clamp-2">{sug.description}</p>
                    </div>
                    <button
                      onClick={() => handleCreateSuggestedSegment(sug)}
                      className="w-full mt-3 bg-gray-900 hover:bg-purple-550 border border-gray-850 hover:border-purple-550 text-gray-450 hover:text-white py-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all duration-150"
                    >
                      <Zap className="w-3 h-3 text-crmWarning fill-current" />
                      1-Click Segment Create
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Segments list cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="animate-spin w-8 h-8 border-4 border-crmAccent border-t-transparent rounded-full"></div>
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center py-20 bg-crmCard rounded-2xl border border-gray-800 text-gray-500 font-medium">
              No segments defined. Create one using the Segment Builder or "✨ Build with AI".
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-gray-400" />
                Active Segments ({segments.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {segments.map((seg) => (
                  <div 
                    key={seg._id}
                    className="bg-crmCard p-6 rounded-2xl border border-gray-800 flex flex-col justify-between hover:shadow-xl transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-lg text-white truncate max-w-[70%]">{seg.name}</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-crmAccent border border-purple-500/20 text-xs font-bold shadow-sm">
                          <Users className="w-3.5 h-3.5" />
                          {seg.audienceSize} matched
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed min-h-[36px]">{seg.description || 'No description provided'}</p>

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-850/60">
                        <span className="text-[10px] uppercase font-extrabold text-gray-500 tracking-wider flex items-center mr-1">Rules ({seg.rules.operator}):</span>
                        {seg.rules.conditions.map((c, idx) => (
                          <span key={idx} className="bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-[10px] font-medium text-gray-400">
                            {c.field} {c.operator} {String(c.value)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-850/40">
                      <button
                        onClick={() => handleEditSegment(seg)}
                        className="bg-gray-800 hover:bg-gray-750 text-gray-300 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-gray-700 transition-all duration-150"
                      >
                        Edit Rules
                      </button>
                      <button
                        onClick={() => handleDeleteSegment(seg._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-red-500/20 transition-all duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Segment Builder View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Builder Options */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-850">
                <h2 className="text-lg font-bold text-white">Segment Setup</h2>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-crmAccent font-semibold text-xs border border-purple-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  ✨ Build with AI
                </button>
              </div>

              {aiExplanation && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold leading-relaxed">
                  💡 {aiExplanation}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Segment Name</label>
                  <input
                    type="text"
                    placeholder="Delhi High Spenders"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent rounded-xl p-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                  <input
                    type="text"
                    placeholder="Delhi customers with spend > ₹5k"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent rounded-xl p-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Operator */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Combine Conditions via</label>
                <div className="flex gap-2">
                  {['AND', 'OR'].map(op => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperator(op)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all duration-150 ${
                        operator === op
                          ? 'bg-crmAccent border-crmAccent text-white shadow-lg shadow-purple-500/15'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {op === 'AND' ? 'Match ALL (AND)' : 'Match ANY (OR)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Rows */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Condition Rules</label>
                <div className="space-y-3">
                  {conditions.map((cond, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 bg-gray-900/40 p-4 rounded-xl border border-gray-850">
                      {/* Field */}
                      <div className="flex-1">
                        <select
                          value={cond.field}
                          onChange={(e) => handleConditionChange(idx, 'field', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg p-2 outline-none"
                        >
                          <option value="totalSpend">Total Spend (₹)</option>
                          <option value="orderCount">Order Count</option>
                          <option value="city">City (String)</option>
                          <option value="lastOrderDate">Last Order Date</option>
                          <option value="firstOrderDate">First Order Date</option>
                          <option value="tags">Tags</option>
                          <option value="preferredChannel">Preferred Channel</option>
                          <option value="gender">Gender</option>
                          <option value="purchasedCategories">Purchased Categories</option>
                          <option value="engagementScore">Engagement Score</option>
                          <option value="healthScore">Health Score</option>
                          <option value="churnRisk">Churn Risk</option>
                        </select>
                      </div>

                      {/* Operator */}
                      <div className="flex-1">
                        <select
                          value={cond.operator}
                          onChange={(e) => handleConditionChange(idx, 'operator', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg p-2 outline-none"
                        >
                          <option value="gt">&gt; (Greater Than)</option>
                          <option value="lt">&lt; (Less Than)</option>
                          <option value="eq">= (Equal To)</option>
                          <option value="contains">Contains (Regex)</option>
                          <option value="not_contains">Does Not Contain (Regex)</option>
                          <option value="in">In list (Mumbai,Delhi)</option>
                        </select>
                      </div>

                      {/* Value */}
                      <div className="flex-2 flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder={
                            cond.field.endsWith('Date') ? "e.g. 60days or 2026-05-01" :
                            cond.operator === 'in' ? "e.g. Mumbai, Delhi" :
                            "e.g. 5000, VIP, whatsapp"
                          }
                          value={cond.value}
                          onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 text-xs text-white rounded-lg p-2 outline-none placeholder-gray-650"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="flex items-center gap-1.5 text-xs text-crmAccent hover:text-purple-400 font-bold outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Condition Row
                </button>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-850 justify-end">
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSegment}
                  className="bg-crmAccent hover:bg-purple-650 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/10"
                >
                  Save Segment
                </button>
              </div>
            </div>
          </div>

          {/* Real-time preview card */}
          <div className="space-y-6">
            <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 shadow-xl space-y-4">
              <h3 className="font-extrabold text-white text-base">Live Preview</h3>
              <p className="text-xs text-gray-500">Estimated audience sizing based on current filters</p>
              
              <div className="h-44 bg-gray-900/60 rounded-2xl border border-gray-850 flex flex-col justify-center items-center gap-2 p-4 text-center">
                {previewLoading ? (
                  <Loader2 className="w-8 h-8 text-crmAccent animate-spin" />
                ) : previewSize !== null ? (
                  <>
                    <h2 className="text-4xl font-extrabold text-white">{previewSize.toLocaleString()}</h2>
                    <p className="text-xs text-gray-400 font-semibold">Matching Shoppers</p>
                    <span className="mt-2 text-[10px] text-crmSuccess bg-crmSuccess/10 px-2 py-0.5 rounded-full border border-crmSuccess/15 font-semibold">Active Database Match</span>
                  </>
                ) : (
                  <p className="text-xs text-gray-650">Enter complete conditions to generate audience preview.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
          ></div>

          <div className="bg-crmCard rounded-3xl border border-gray-800 shadow-2xl p-6 w-full max-w-lg relative z-10 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Build Segment with AI</h3>
                <p className="text-xs text-gray-400 mt-1">Translate a plain description into query rules using Claude</p>
              </div>
              <button 
                onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAiBuild} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Segment Request Prompt</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Shoppers who ordered more than 3 times, spent over ₹5000, and haven't ordered anything in the last 60 days."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent focus:ring-2 focus:ring-purple-500/20 rounded-xl p-4 text-sm text-white outline-none placeholder-gray-650 transition-all duration-200"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowAiModal(false); setAiPrompt(''); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-crmAccent hover:bg-purple-650 disabled:bg-purple-850 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/10"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Rules
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Segments;
