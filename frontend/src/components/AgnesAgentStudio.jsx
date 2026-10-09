import React, { useState } from 'react';
import { Wrench, Play, CheckCircle, Clock, Sparkles, Terminal, Code2, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function AgnesAgentStudio() {
  const [selectedTool, setSelectedTool] = useState('predict_learning_gap');
  const [paramsJson, setParamsJson] = useState(
    JSON.stringify({ student_id: 's_aarav', current_mastery: { c_work: 0.88, c_ke: 0.52 }, target_concept: 'Conservation of Mechanical Energy' }, null, 2)
  );
  const [toolResult, setToolResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const tools = [
    {
      name: 'search_knowledge',
      label: '1. search_knowledge()',
      desc: 'Searches grounded knowledge base for verified concepts and formulas.',
      defaultParams: { query: 'Kinetic energy formula', topic: 'Physics', top_k: 3 }
    },
    {
      name: 'retrieve_source',
      label: '2. retrieve_source()',
      desc: 'Retrieves original educator source text, authority score, and citation.',
      defaultParams: { source_id: 'res_textbook_2026', concept_id: 'c_ke' }
    },
    {
      name: 'compare_sources',
      label: '3. compare_sources()',
      desc: 'Compares concept definitions across multiple uploaded documents.',
      defaultParams: { source_ids: ['res_textbook_2026', 'res_legacy_notes_2018'], concept_id: 'c_work' }
    },
    {
      name: 'check_conflict',
      label: '4. check_conflict()',
      desc: 'Detects contradictory or outdated information between sources.',
      defaultParams: { statements: ['Work under zero displacement'] }
    },
    {
      name: 'get_student_profile',
      label: '5. get_student_profile()',
      desc: 'Retrieves learner pace, language, interaction style, and concept masteries.',
      defaultParams: { student_id: 's_aarav' }
    },
    {
      name: 'get_assessment_history',
      label: '6. get_assessment_history()',
      desc: 'Fetches past quiz attempts, response times, hints, and error patterns.',
      defaultParams: { student_id: 's_aarav', topic: 'Physics' }
    },
    {
      name: 'predict_learning_gap',
      label: '7. predict_learning_gap()',
      desc: 'Forecasts future conceptual bottlenecks before they happen!',
      defaultParams: { student_id: 's_aarav', current_mastery: { c_work: 0.88, c_ke: 0.52 }, target_concept: 'Conservation of Mechanical Energy' }
    },
    {
      name: 'generate_activity',
      label: '8. generate_activity()',
      desc: 'Creates personalized exercises, interactive quizzes, or simulations.',
      defaultParams: { concept: 'Kinetic Energy', student_profile: { interaction_preference: 'visual' }, difficulty_level: 2, activity_type: 'interactive_quiz' }
    },
    {
      name: 'translate_content',
      label: '9. translate_content()',
      desc: 'Translates educational content into regional languages with bilingual support.',
      defaultParams: { content: 'Kinetic Energy is the energy possessed by an object due to its motion.', target_language: 'Hindi', bilingual: true }
    },
    {
      name: 'change_difficulty',
      label: '10. change_difficulty()',
      desc: 'Dynamically scales explanation depth & scaffolding (Levels 1 to 5).',
      defaultParams: { content: 'Kinetic Energy formula explanation', target_level: 1, learner_state: 'struggling' }
    },
    {
      name: 'update_learning_path',
      label: '11. update_learning_path()',
      desc: 'Recalculates sequence, prunes non-essentials (e.g. 10 mins left).',
      defaultParams: { student_id: 's_aarav', performance_data: {}, remaining_time: 10 }
    },
    {
      name: 'generate_visual',
      label: '12. generate_visual()',
      desc: 'Generates responsive SVG/Mermaid diagrams and visual aids.',
      defaultParams: { prompt: 'Mechanical Energy Interchange', concept_id: 'c_conservation', diagram_type: 'conceptual_diagram' }
    }
  ];

  const handleSelectTool = (tool) => {
    setSelectedTool(tool.name);
    setParamsJson(JSON.stringify(tool.defaultParams, null, 2));
    setToolResult(null);
  };

  const handleRunTool = async () => {
    setIsExecuting(true);
    try {
      const parsedParams = JSON.parse(paramsJson);
      const res = await api.executeTool(selectedTool, parsedParams);
      setToolResult(res);
    } catch (e) {
      console.error(e);
      alert('Error parsing JSON or executing tool.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-sky-950/80 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Wrench className="w-4 h-4" />
          Autonomous Agent Core
        </div>
        <h2 className="text-2xl font-extrabold text-white">The 12 Agentic Tools Studio</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Direct interactive console to trigger, test, and observe each of the 12 tools used by Agnes 3.0 Flash 
          in its autonomous learning feedback loop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool Selector List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 max-h-[640px] overflow-y-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Registered Agentic Tools (12)
          </span>
          {tools.map((t) => (
            <button
              key={t.name}
              onClick={() => handleSelectTool(t)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedTool === t.name
                  ? 'bg-sky-600/20 border-sky-500/60 text-white shadow-md'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-sky-300">{t.label}</span>
                <Sparkles className="w-3 h-3 text-sky-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Execution & Output Console */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Parameter Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200 font-mono">
                  Input Parameters for `{selectedTool}()`
                </span>
              </div>
              <button
                onClick={handleRunTool}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Invoke Tool
                  </>
                )}
              </button>
            </div>

            <textarea
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Results Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Agent Execution Trace
                </span>
              </div>
              {toolResult && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Status: {toolResult.status}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> {toolResult.execution_time_ms}ms
                  </span>
                </div>
              )}
            </div>

            {/* Visual preview if visual tool */}
            {toolResult?.result?.svg_content && (
              <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Generated Interactive Visual Aid:
                </span>
                <div
                  dangerouslySetInnerHTML={{ __html: toolResult.result.svg_content }}
                  className="rounded-lg overflow-hidden"
                />
              </div>
            )}

            {/* Raw JSON */}
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-80 flex-1">
              {toolResult
                ? JSON.stringify(toolResult.result, null, 2)
                : '// Output will appear here after tool invocation...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
