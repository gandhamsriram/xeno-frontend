import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import AIAssistant from './pages/AIAssistant';
import CampaignAgent from './pages/CampaignAgent';
import Architecture from './pages/Architecture';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient();

function MainLayout() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-crmBg flex flex-col items-center justify-center text-gray-400">
        <div className="animate-spin w-10 h-10 border-4 border-crmAccent border-t-transparent rounded-full mb-4 font-bold"></div>
        <p className="text-sm font-semibold tracking-wider animate-pulse">Restoring Session...</p>
      </div>
    );
  }

  // Show authentication screens if not logged in
  if (!user) {
    if (showRegister) {
      return <Register onToggleLogin={() => setShowRegister(false)} />;
    }
    return <Login onToggleRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="min-h-screen bg-crmBg flex">
      {/* Sidebar Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'campaigns') {
            setSelectedCampaignId(null);
          }
        }} 
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 ml-64 p-8 min-h-screen bg-crmBg text-gray-150 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedCampaignId={setSelectedCampaignId} 
          />
        )}
        {activeTab === 'customers' && <Customers />}
        {activeTab === 'segments' && <Segments />}
        {activeTab === 'campaigns' && (
          <Campaigns 
            selectedCampaignId={selectedCampaignId} 
            setSelectedCampaignId={setSelectedCampaignId} 
          />
        )}
        {activeTab === 'ai-assistant' && <AIAssistant />}
        {activeTab === 'campaign-agent' && (
          <CampaignAgent 
            setActiveTab={setActiveTab} 
            setSelectedCampaignId={setSelectedCampaignId} 
          />
        )}
        {activeTab === 'architecture' && <Architecture />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
