import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, BookOpen, ExternalLink, Calendar, Award } from 'lucide-react';
import { api } from '../services/api';

export default function SourceTraceabilityModal({ conceptId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conceptId) return;
    const load = async () => {
      try {
        const res = await api.getSourceTraceability(conceptId);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conceptId]);

  if (!conceptId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-sky-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              Source Traceability & Provenance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading citation trace...</div>
          ) : data?.provenance ? (
            <>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Concept Under Inspection
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {data.concept.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {data.concept.definition}
                </p>
              </div>

              {/* Provenance Metadata Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>{data.provenance.source_title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Authority: {(data.provenance.authority_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Year: {data.provenance.recency_year}</span>
                  </div>
                  <div className="text-right font-mono text-[11px] text-sky-400">
                    {data.provenance.citation}
                  </div>
                </div>
              </div>

              {/* Verifiable Raw Snippet */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Verifiable Source Excerpt
                </span>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400/90 leading-relaxed max-h-36 overflow-y-auto">
                  "{data.provenance.verifiable_snippet}"
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-slate-400">No provenance record found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close Provenance Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
