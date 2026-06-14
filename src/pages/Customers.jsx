import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  Search, 
  Filter, 
  Upload, 
  X, 
  ChevronRight, 
  Calendar, 
  Tag as TagIcon, 
  ShoppingBag, 
  Phone, 
  Mail, 
  MapPin,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  Heart,
  Zap,
  Activity
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [tag, setTag] = useState('');
  const [gender, setGender] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [maxSpend, setMaxSpend] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Bulk Ingest Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonPaste, setJsonPaste] = useState('');
  const [importStatus, setImportStatus] = useState(null); // { success: boolean, message: string }

  // Fetch list
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      let url = `/customers?page=${page}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;
      if (tag) url += `&tag=${encodeURIComponent(tag)}`;
      if (gender) url += `&gender=${encodeURIComponent(gender)}`;
      if (minSpend) url += `&minSpend=${minSpend}`;
      if (maxSpend) url += `&maxSpend=${maxSpend}`;

      const res = await API.get(url);
      setCustomers(res.data.customers);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, city, tag, gender]); // trigger refetches on quick filter selection

  // Trigger search on button click or enter
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  // Open Drawer and Fetch Customer Profile
  const handleOpenDrawer = async (id) => {
    try {
      setSelectedCustomerId(id);
      setDetailsLoading(true);
      setCustomerDetails(null);
      const res = await API.get(`/customers/${id}`);
      setCustomerDetails(res.data);
    } catch (err) {
      console.error('Error loading customer profile details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Bulk Ingest
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      setImportStatus(null);
      const parsed = JSON.parse(jsonPaste);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON data must be a top-level array of customer objects');
      }

      const res = await API.post('/customers/bulk', parsed);
      setImportStatus({
        success: true,
        message: `Imported ${res.data.count} shoppers successfully!`
      });
      setJsonPaste('');
      fetchCustomers();
    } catch (err) {
      setImportStatus({
        success: false,
        message: err.message || err.response?.data?.error || 'Failed to parse JSON content'
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Shoppers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and filter your entire shopper audience base</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 bg-crmAccent hover:bg-purple-650 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200"
        >
          <Upload className="w-4 h-4" />
          Bulk Import JSON
        </button>
      </div>

      {/* Filter Options Panel */}
      <div className="bg-crmCard p-6 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-12 pr-4 text-white outline-none placeholder-gray-650 transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-750 text-white border border-gray-700 px-6 py-3 rounded-xl font-bold text-sm transition-colors duration-200"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent text-sm text-white rounded-xl p-2.5 outline-none"
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Pune">Pune</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tag</label>
            <select
              value={tag}
              onChange={(e) => { setTag(e.target.value); setPage(1); }}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent text-sm text-white rounded-xl p-2.5 outline-none"
            >
              <option value="">All Tags</option>
              <option value="VIP">VIP</option>
              <option value="New shopper">New Shopper</option>
              <option value="Cart abandoner">Cart Abandoner</option>
              <option value="Sale buyer">Sale Buyer</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); setPage(1); }}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent text-sm text-white rounded-xl p-2.5 outline-none"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Spend Range */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Spend Range (₹)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min Spend"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent text-sm text-white rounded-xl p-2 outline-none"
              />
              <span className="text-gray-650 text-xs">to</span>
              <input
                type="number"
                placeholder="Max Spend"
                value={maxSpend}
                onChange={(e) => setMaxSpend(e.target.value)}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent text-sm text-white rounded-xl p-2 outline-none"
              />
              <button
                onClick={() => { setPage(1); fetchCustomers(); }}
                className="bg-gray-850 hover:bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Shoppers */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-crmAccent border-t-transparent rounded-full"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 bg-crmCard rounded-2xl border border-gray-800 text-gray-500 font-medium">
          No shoppers match your filter queries.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers.map((c) => (
            <div 
              key={c._id}
              onClick={() => handleOpenDrawer(c._id)}
              className="bg-crmCard p-5 rounded-2xl border border-gray-800/80 hover:border-crmAccent/40 transition-all duration-200 cursor-pointer hover:shadow-xl group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-crmAccent font-extrabold text-sm uppercase">
                    {c.name.substring(0, 2)}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.intelligenceTag && (
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                        c.intelligenceTag === 'VIP' ? 'bg-purple-550/15 text-purple-400 border border-purple-550/20' :
                        c.intelligenceTag === 'High Value' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                        c.intelligenceTag === 'At Risk' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                        c.intelligenceTag === 'Dormant' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      }`}>
                        {c.intelligenceTag}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-crmAccent transition-colors" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-extrabold text-white text-base group-hover:text-crmAccent transition-colors truncate">{c.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{c.email}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span className="flex gap-1.5 items-center">
                    <MapPin className="w-3.5 h-3.5 text-gray-650" />
                    {c.city}
                  </span>
                  
                  {/* Smart Channel Recommendation Badge */}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                    c.smartChannelRecommendation === 'whatsapp' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    c.smartChannelRecommendation === 'email' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    c.smartChannelRecommendation === 'sms' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {c.smartChannelRecommendation || 'email'}
                  </span>
                </div>

                {/* Health Score micro progress bar */}
                <div className="space-y-1 pt-1.5 border-t border-gray-850/50">
                  <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                    <span>Shopper Health</span>
                    <span className={
                      c.healthScore > 70 ? 'text-crmSuccess' :
                      c.healthScore > 40 ? 'text-crmWarning' :
                      'text-red-400'
                    }>{c.healthScore || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-950 rounded-full h-1 border border-gray-850/50">
                    <div className={`h-1 rounded-full ${
                      c.healthScore > 70 ? 'bg-crmSuccess' :
                      c.healthScore > 40 ? 'bg-crmWarning' :
                      'bg-red-400'
                    }`} style={{ width: `${c.healthScore || 0}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800/60 mt-4 pt-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500 block uppercase font-semibold text-[10px] tracking-wider">Total Spend</span>
                  <span className="text-white font-bold text-sm">₹{c.totalSpend.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block uppercase font-semibold text-[10px] tracking-wider">Orders</span>
                  <span className="text-white font-bold text-sm">{c.orderCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-crmCard border border-gray-800 disabled:opacity-35 hover:bg-gray-800 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl bg-crmCard border border-gray-800 disabled:opacity-35 hover:bg-gray-800 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Detail Drawer Sidebar Overlay */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCustomerId(null)}
          ></div>
          
          {/* Drawer container */}
          <div className="w-full max-w-lg bg-crmCard border-l border-gray-800 h-screen relative z-10 p-6 flex flex-col justify-between shadow-2xl animate-slideLeft overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-5 border-b border-gray-800 mb-6">
                <h3 className="text-xl font-bold text-white">Shopper Profile</h3>
                <button 
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <div className="animate-spin w-8 h-8 border-4 border-crmAccent border-t-transparent rounded-full"></div>
                </div>
              ) : customerDetails ? (
                <div className="space-y-6 pr-2">
                  {/* Summary Profile Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-crmAccent/10 text-crmAccent flex items-center justify-center text-xl font-extrabold uppercase border border-crmAccent/25">
                      {customerDetails.customer.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{customerDetails.customer.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{customerDetails.customer.gender} · {customerDetails.customer.city}</p>
                    </div>
                  </div>

                  {/* Profile Specs */}
                  <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300 font-semibold">{customerDetails.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300 font-semibold">{customerDetails.customer.phone}</span>
                    </div>
                    {customerDetails.customer.tags.length > 0 && (
                      <div className="flex items-start gap-3 text-sm pt-2 border-t border-gray-800/40">
                        <TagIcon className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="flex flex-wrap gap-2">
                          {customerDetails.customer.tags.map(t => (
                            <span key={t} className="bg-purple-500/10 text-purple-400 text-[10px] uppercase tracking-wide font-extrabold px-2 py-0.5 rounded border border-purple-500/15">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purchases stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Lifetime Value</span>
                      <span className="text-xl font-extrabold text-white">₹{customerDetails.customer.totalSpend.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
                      <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Total Purchases</span>
                      <span className="text-xl font-extrabold text-white">{customerDetails.customer.orderCount} orders</span>
                    </div>
                  </div>

                  {/* Health score gauges */}
                  <div className="space-y-3">
                    <h5 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-red-500" />
                      Shopper Health & Risks
                    </h5>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-4">
                      {/* Health score indicator */}
                      <div className="flex justify-between items-center pb-2.5 border-b border-gray-850/50">
                        <span className="text-xs text-gray-400 font-semibold">Health Score Index</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-extrabold ${
                            customerDetails.customer.healthScore > 70 ? 'text-crmSuccess' :
                            customerDetails.customer.healthScore > 40 ? 'text-crmWarning' :
                            'text-red-400'
                          }`}>{customerDetails.customer.healthScore || 0}%</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            customerDetails.customer.healthScore > 70 ? 'bg-crmSuccess/10 text-crmSuccess border border-crmSuccess/15' :
                            customerDetails.customer.healthScore > 40 ? 'bg-crmWarning/10 text-crmWarning border border-crmWarning/15' :
                            'bg-red-500/10 text-red-400 border border-red-500/15'
                          }`}>
                            {customerDetails.customer.healthScore > 70 ? 'Healthy' :
                             customerDetails.customer.healthScore > 40 ? 'Fair' : 'Critical'}
                          </span>
                        </div>
                      </div>

                      {/* Churn risk */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Churn Probability</span>
                          <span className="font-bold text-white">{customerDetails.customer.churnRisk || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-950 rounded-full h-2 border border-gray-850/50">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${customerDetails.customer.churnRisk || 0}%` }}></div>
                        </div>
                      </div>

                      {/* Conversion probability */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Purchase Likelihood</span>
                          <span className="font-bold text-white">{customerDetails.customer.conversionProbability || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-950 rounded-full h-2 border border-gray-850/50">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${customerDetails.customer.conversionProbability || 0}%` }}></div>
                        </div>
                      </div>

                      {/* Forecast LTV */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-gray-850/50">
                        <span className="text-xs text-gray-400 font-semibold">Projected 12m LTV Forecast</span>
                        <span className="text-base font-extrabold text-crmSuccess">₹{(customerDetails.customer.ltvEstimate || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Channel engagement score */}
                  <div className="space-y-3">
                    <h5 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-crmWarning" />
                      Smart Channel Recommendation
                    </h5>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-4">
                      {/* Best Channel banner */}
                      <div className="bg-purple-550/5 border border-purple-550/15 p-3.5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider block">Recommended Dispatch Channel</span>
                          <h4 className="text-base font-extrabold text-white mt-0.5 uppercase tracking-wide">
                            {customerDetails.customer.smartChannelRecommendation || 'email'}
                          </h4>
                        </div>
                        <span className="text-[10px] text-crmSuccess bg-crmSuccess/10 px-2.5 py-1 rounded-full border border-crmSuccess/15 font-semibold uppercase">High Engagement</span>
                      </div>

                      {/* Stats grids */}
                      <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-850">
                          <span className="text-[9px] text-gray-500 font-bold block uppercase">Engagement</span>
                          <span className="font-extrabold text-white block mt-1">{customerDetails.customer.engagementScore || 0}%</span>
                        </div>
                        <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-850">
                          <span className="text-[9px] text-gray-500 font-bold block uppercase">Open Rate</span>
                          <span className="font-extrabold text-white block mt-1">{customerDetails.customer.openRate || 0}%</span>
                        </div>
                        <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-850">
                          <span className="text-[9px] text-gray-500 font-bold block uppercase">Click Rate</span>
                          <span className="font-extrabold text-white block mt-1">{customerDetails.customer.clickRate || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order History Timeline */}
                  <div className="space-y-4">
                    <h5 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-crmAccent" />
                      Purchase Timeline
                    </h5>
                    
                    {customerDetails.orders.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-4 bg-gray-900/20 border border-gray-855 rounded-xl">No purchases logged yet.</p>
                    ) : (
                      <div className="relative pl-4 border-l border-gray-850 space-y-6">
                        {customerDetails.orders.map((o) => (
                          <div key={o._id} className="relative">
                            {/* Dot */}
                            <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-crmAccent shadow-lg shadow-purple-500/50"></span>
                            
                            <div className="bg-gray-900/30 border border-gray-855/50 rounded-xl p-4 hover:border-gray-800 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-sm font-bold text-white">₹{o.orderValue.toLocaleString()}</span>
                              </div>
                              <div className="space-y-1">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="text-xs text-gray-450 flex justify-between">
                                    <span>{it.name} <span className="text-gray-500">x{it.qty}</span></span>
                                    <span className="text-gray-650 capitalize">{it.category}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2 items-center mt-3 pt-3 border-t border-gray-850/50 text-[10px] text-gray-500 uppercase tracking-wider">
                                <span>Status: {o.status}</span>
                                <span>·</span>
                                <span>Channel: {o.channel}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowImportModal(false); setImportStatus(null); }}
          ></div>
          
          <div className="bg-crmCard rounded-3xl border border-gray-800 shadow-2xl p-6 w-full max-w-xl relative z-10 animate-scaleUp">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Bulk Ingest Customers</h3>
                <p className="text-xs text-gray-400 mt-1">Paste a JSON array of shopper profiles to ingest</p>
              </div>
              <button 
                onClick={() => { setShowImportModal(false); setImportStatus(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStatus && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border text-sm font-semibold ${
                importStatus.success 
                  ? 'bg-crmSuccess/10 border-crmSuccess/20 text-crmSuccess'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {importStatus.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                {importStatus.message}
              </div>
            )}

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">JSON Content</label>
                <textarea
                  rows="8"
                  placeholder='[\n  {\n    "name": "Arjun Sharma",\n    "email": "arjun@gmail.com",\n    "phone": "+919999999999",\n    "city": "Mumbai",\n    "gender": "Male",\n    "tags": ["VIP"]\n  }\n]'
                  value={jsonPaste}
                  onChange={(e) => setJsonPaste(e.target.value)}
                  className="w-full bg-gray-900/60 border border-gray-800 focus:border-crmAccent focus:ring-2 focus:ring-purple-500/20 rounded-xl p-4 text-xs font-mono text-white outline-none placeholder-gray-650 transition-all duration-200"
                  required
                ></textarea>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowImportModal(false); setImportStatus(null); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-crmAccent hover:bg-purple-650 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/10"
                >
                  Ingest Shoppers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
