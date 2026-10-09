import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, AlertTriangle, TrendingUp, Lightbulb, 
  ShieldCheck, ArrowUpRight, HelpCircle, CheckCircle, ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsDashboard({ onOpenTraceability }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalyticsDashboard();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mr-3" />
        Loading Classroom Analytics...
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-4 h-4" />
          Step 6 & 7: Continuous Assessment, Analytics & Feedback Loop
        </div>
        <h2 className="text-2xl font-extrabold text-white">Classroom Intelligence & Gap Forecaster</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Deep diagnostic view beyond traditional marks: detects specific conceptual misconceptions, identifies at-risk learners,
          and proactively forecasts upcoming bottlenecks before they disrupt student progress.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Class Average Mastery</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{analytics.class_average_mastery}%</div>
          <p className="text-[11px] text-emerald-400 mt-1">+14% since baseline diagnostic</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Active Learners</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{analytics.total_students}</div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-modal profiles loaded</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">At-Risk Learners</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{analytics.at_risk_count}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">Require immediate scaffolding</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Predicted Learning Gaps</span>
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {analytics.predicted_learning_gaps.length}
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">Proactive interventions queued</p>
        </div>
      </div>

      {/* Main Grid: Student Mastery & Misconceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student Mastery Matrix */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Learner Mastery & Status Matrix
          </h3>
          <div className="space-y-3">
            {analytics.students.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-xl border transition-all ${
                  s.is_at_risk
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.avatar}</span>
                    <div>
                      <span className="text-sm font-bold text-slate-200">{s.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        ({s.pref} · {s.language} · {s.pace} pace)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold ${
                      s.is_at_risk ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {s.avg_mastery}%
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      s.is_at_risk ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {s.is_at_risk ? 'At-Risk' : 'On Track'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${s.is_at_risk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${s.avg_mastery}%` }}
                  />
                </div>

                {/* Student specific misconceptions */}
                {s.misconceptions?.length > 0 && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30 mt-2">
                    <strong>Active Misconception:</strong> {s.misconceptions[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Common Misconceptions Leaderboard */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Classroom Misconception Leaderboard
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Identifies systemic conceptual errors across learners for targeted teaching intervention.
          </p>

          <div className="space-y-3">
            {analytics.common_misconceptions.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">Rank #{idx + 1}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {m.affected_students} Student(s)
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {m.misconception}
                </p>
              </div>
            ))}
          </div>

          {/* Next Lesson Recommendation Card */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-tr from-sky-950/60 to-indigo-950/60 border border-sky-500/30">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ArrowUpRight className="w-4 h-4" />
              Next-Lesson Recommendation
            </div>
            <h4 className="text-sm font-bold text-white">
              {analytics.next_lesson_recommendation.topic}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {analytics.next_lesson_recommendation.rationale}
            </p>
          </div>
        </div>
      </div>

      {/* Curriculum Mastery & Source Traceability */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
          Topic Mastery & Grounded Source Traceability
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.concept_analytics.map((c) => (
            <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">{c.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'Mastered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-white font-mono mb-2">
                  {c.average_mastery}%
                </div>
              </div>

              <button
                onClick={() => onOpenTraceability(c.id)}
                className="pt-3 border-t border-slate-800 text-xs text-sky-400 hover:text-sky-300 flex items-center justify-between font-semibold"
              >
                <span>Verify Citation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
