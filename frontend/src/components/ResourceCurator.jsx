import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, BookOpen, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function ResourceCurator({ onOpenTraceability }) {
  const [resources, setResources] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [textContent, setTextContent] = useState('');

  const loadData = async () => {
    try {
      const [resList, confList] = await Promise.all([
        api.getResources(),
        api.getConflicts()
      ]);
      setResources(resList);
      setConflicts(confList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file_type', fileType);
      formData.append('authority_score', '0.94');
      formData.append('recency_year', '2026');
      if (textContent) formData.append('text_content', textContent);

      await api.uploadResource(formData);
      setTitle('');
      setTextContent('');
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResolveConflict = async (id) => {
    try {
      await api.resolveConflict(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          Step 2 & 3: Resource Collection, Trust Ranking & Conflict Detection
        </div>
        <h2 className="text-2xl font-extrabold text-white">Curated Knowledge Base & Conflict Engine</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Upload teacher notes, textbooks, and presentations. Agnes 3.0 Flash compares sources across time and authority,
          autonomously detects outdated or contradictory definitions, and builds a grounded knowledge base you can trust.
        </p>
      </div>

      {/* Upload and Conflict Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Add Teaching Material
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Multi-Source
            </span>
          </div>

          <form onSubmit={handleQuickUpload} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Document Title / Reference</label>
              <input
                type="text"
                placeholder="e.g. NCERT Science 2026 Chapter 11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Resource Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="pdf">Textbook / Paper (PDF)</option>
                <option value="notes">Educator Lecture Notes</option>
                <option value="ppt">Presentation Slides</option>
                <option value="link">Curated Web Reference</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Key Excerpt / Content Summary</label>
              <textarea
                rows={3}
                placeholder="Paste key notes or formulas to extract..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Extracting Knowledge...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Run Agnes Knowledge Extractor
                </>
              )}
            </button>
          </form>
        </div>

        {/* Conflicts Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Conflict & Outdated Information Detection
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {conflicts.filter(c => c.status === 'detected').length} Active
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Autonomous Check</span>
          </div>

          <div className="space-y-3">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all ${
                  c.status === 'resolved'
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : 'bg-amber-950/20 border-amber-500/30 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${c.status === 'resolved' ? 'text-slate-500' : 'text-amber-400'}`} />
                    <span className="text-sm font-bold text-slate-200">{c.concept_name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>

                {/* Discrepancy comparison */}
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-sky-400 font-bold block mb-1">Source A (Standard 2026)</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{c.source_a_text}</p>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-rose-400 font-bold block mb-1">Source B (Legacy 2018)</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{c.source_b_text}</p>
                  </div>
                </div>

                {/* Resolution */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-300 text-[11px]">
                    <strong className="text-emerald-400">Agnes Recommendation:</strong> {c.resolution}
                  </span>
                  {c.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveConflict(c.id)}
                      className="ml-3 shrink-0 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
                    >
                      Approve & Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust & Source Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Grounded Knowledge Base & Trust Ranking</h3>
            <p className="text-xs text-slate-400">Sources ranked by institutional authority, syllabus alignment, and recency.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
            {resources.length} Verified Sources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Source Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Authority Score</th>
                <th className="p-3">Recency</th>
                <th className="p-3">Verification Status</th>
                <th className="p-3 text-right">Traceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    {r.title}
                  </td>
                  <td className="p-3 uppercase text-[10px] text-slate-400 font-mono">{r.file_type}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${r.authority_score * 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{(r.authority_score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">{r.recency_year}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      Approved
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onOpenTraceability('c_ke')}
                      className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1 ml-auto"
                    >
                      Inspect Citation
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
