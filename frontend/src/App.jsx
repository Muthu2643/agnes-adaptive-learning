import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EducatorVoiceStudio from './components/EducatorVoiceStudio';
import ResourceCurator from './components/ResourceCurator';
import AgnesAgentStudio from './components/AgnesAgentStudio';
import LearnerPortal from './components/LearnerPortal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SourceTraceabilityModal from './components/SourceTraceabilityModal';
import { api } from './services/api';
import { Sparkles, Shield, Zap, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('voice');
  const [remainingTime, setRemainingTime] = useState(45);
  const [replanNotification, setReplanNotification] = useState(null);
  const [traceabilityConceptId, setTraceabilityConceptId] = useState(null);

  const handleTriggerTimeConstraint = async (mins = 10) => {
    try {
      setRemainingTime(mins);
      const res = await api.educatorControl({
        action: 'time_constraint',
        time_remaining_minutes: mins,
      });
      setReplanNotification(
        `⚡ Emergency Time Constraint Applied: Session compressed to ${mins} mins! Non-essential topics pruned, prioritising core concept mastery.`
      );
      setTimeout(() => setReplanNotification(null), 8000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        remainingTime={remainingTime}
        onTriggerTimeConstraint={handleTriggerTimeConstraint}
      />

      {/* Dynamic Re-Plan Notification Toast */}
      {replanNotification && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2.5 text-center text-xs font-semibold text-amber-300 flex items-center justify-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{replanNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'voice' && <EducatorVoiceStudio onSessionCreated={() => setActiveTab('resources')} />}
        {activeTab === 'resources' && <ResourceCurator onOpenTraceability={(cId) => setTraceabilityConceptId(cId)} />}
        {activeTab === 'tools' && <AgnesAgentStudio />}
        {activeTab === 'learner' && <LearnerPortal onOpenTraceability={(cId) => setTraceabilityConceptId(cId)} />}
        {activeTab === 'analytics' && <AnalyticsDashboard onOpenTraceability={(cId) => setTraceabilityConceptId(cId)} />}
      </main>

      {/* Source Provenance Modal */}
      {traceabilityConceptId && (
        <SourceTraceabilityModal
          conceptId={traceabilityConceptId}
          onClose={() => setTraceabilityConceptId(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Agnes 3.0 Flash · 512K Context · Continuous Agentic Learning System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>React + Vite</span>
            <span>FastAPI Backend</span>
            <span>PostgreSQL Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
