import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Volume2, Globe, Sliders, CheckCircle2, 
  XCircle, AlertTriangle, ArrowRight, Sparkles, BookOpen, 
  Clock, ShieldCheck, RefreshCw, Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function LearnerPortal({ onOpenTraceability }) {
  const [selectedLearner, setSelectedLearner] = useState('s_aarav');
  const [profile, setProfile] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [language, setLanguage] = useState('English');
  const [difficulty, setDifficulty] = useState(2);
  const [isBilingual, setIsBilingual] = useState(true);

  // Diagnostic Mode
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState([]);
  const [diagIndex, setDiagIndex] = useState(0);

  // Continuous Assessment Feedback State
  const [selectedOption, setSelectedOption] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [assessmentFeedback, setAssessmentFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLearnerData = async (learnerId) => {
    try {
      const [profData, pathData] = await Promise.all([
        api.getLearnerProfile(learnerId),
        api.getLearningPath(learnerId)
      ]);
      setProfile(profData);
      setLearningPath(pathData);
      if (pathData && pathData.length > 0) {
        setActiveNode(pathData.find(n => n.status === 'in_progress') || pathData[0]);
      }
      setAssessmentFeedback(null);
      setSelectedOption('');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLearnerData(selectedLearner);
  }, [selectedLearner]);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser speech synthesis not supported.");
    }
  };

  const handleStartDiagnostic = async () => {
    try {
      const questions = await api.getDiagnosticQuestions(selectedLearner);
      setDiagnosticQuestions(questions);
      setDiagIndex(0);
      setIsDiagnosticMode(true);
      setAssessmentFeedback(null);
      setSelectedOption('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAnswer = async (questionData) => {
    if (!selectedOption) return;
    setIsSubmitting(true);
    try {
      const payload = {
        learner_id: selectedLearner,
        concept_id: questionData.concept_id,
        question: questionData.question,
        selected_option: selectedOption,
        correct_option: questionData.correct_option,
        response_time_sec: 14.5,
        hints_used: hintsUsed,
        attempts: 1
      };
      const res = await api.submitAnswer(payload);
      setAssessmentFeedback(res);
      // Reload profile to refresh real-time mastery
      const updatedProf = await api.getLearnerProfile(selectedLearner);
      setProfile(updatedProf);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              Step 4 & 5: Learner Profiling & Adaptive Delivery
            </div>
            <h2 className="text-2xl font-extrabold text-white">Learner Experience Portal</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Content dynamically scales with learner performance, language choice, and learning style.
              Agnes continuously diagnoses misconceptions rather than just grading answers.
            </p>
          </div>

          {/* Student Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 's_aarav', name: 'Aarav (Visual)', tag: 'Moderate' },
              { id: 's_priya', name: 'Priya (Conceptual)', tag: 'Fast' },
              { id: 's_rohan', name: 'Rohan (Hands-On)', tag: 'At-Risk' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedLearner(s.id);
                  setIsDiagnosticMode(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLearner === s.id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personalized Learning Path */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Personalized Learning Path
              </span>
              <button
                onClick={handleStartDiagnostic}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-indigo-400" />
                Adaptive Diagnostic
              </button>
            </div>

            <div className="space-y-2.5">
              {learningPath.map((node, index) => {
                const isActive = activeNode?.id === node.id;
                const isSkipped = node.status === 'skipped';
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      if (!isSkipped) {
                        setActiveNode(node);
                        setIsDiagnosticMode(false);
                        setAssessmentFeedback(null);
                        setSelectedOption('');
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSkipped
                        ? 'opacity-40 border-dashed border-slate-800 bg-slate-950/30 cursor-not-allowed'
                        : isActive
                        ? 'bg-sky-600/20 border-sky-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{node.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        node.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : node.status === 'in_progress'
                          ? 'bg-sky-500/20 text-sky-400 animate-pulse'
                          : isSkipped
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSkipped ? 'Pruned (Time)' : node.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>Est: {node.estimated_minutes} mins</span>
                      <span className="font-semibold uppercase text-sky-400">{node.activity_type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Learner Mastery Snapshot */}
          {profile && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-slate-300">Live Mastery Scores:</span>
                <span className="font-mono text-emerald-400 text-[11px] font-bold">
                  {profile.interaction_preference.toUpperCase()} LEARNER
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(profile.mastery_scores || {}).map(([cId, score]) => (
                  <div key={cId} className="text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span className="capitalize">{cId.replace('c_', '')}</span>
                      <span className="font-mono text-slate-200">{(score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 0.75 ? 'bg-emerald-500' : score >= 0.5 ? 'bg-sky-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Content Player & Assessment */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Top Controls: Multilingual & Difficulty */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Spanish">Spanish (Español)</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 ml-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBilingual}
                    onChange={(e) => setIsBilingual(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-sky-600 focus:ring-0"
                  />
                  <span>Bilingual Key Terms</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-400">Adaptive Level:</span>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
                        difficulty === lvl
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnostic Mode or Active Node Player */}
            {isDiagnosticMode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Adaptive Diagnostic Test — Question {diagIndex + 1} of {diagnosticQuestions.length}
                  </span>
                  <button
                    onClick={() => setIsDiagnosticMode(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Back to Learning Path
                  </button>
                </div>

                {diagnosticQuestions[diagIndex] && (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                      {diagnosticQuestions[diagIndex].question}
                    </p>

                    <div className="space-y-2">
                      {diagnosticQuestions[diagIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            selectedOption === opt
                              ? 'bg-sky-600/20 border-sky-500 text-white font-semibold'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 italic">
                        {diagnosticQuestions[diagIndex].pedagogical_target}
                      </span>
                      <button
                        onClick={() => handleSubmitAnswer(diagnosticQuestions[diagIndex])}
                        disabled={!selectedOption || isSubmitting}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 transition-all"
                      >
                        {isSubmitting ? 'Evaluating...' : 'Submit Diagnostic Answer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : activeNode ? (
              <div className="space-y-5">
                {/* Active Node Title & Audio Narrator */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeNode.title}
                  </h3>
                  <button
                    onClick={() => handleSpeak(activeNode.explanation_text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-sky-400 hover:text-sky-300 hover:border-sky-500/50 transition-all shadow-sm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Voice Narration
                  </button>
                </div>

                {/* Explanation Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {language !== 'English' ? (
                      <>
                        <span className="block text-sky-300 mb-2 font-medium">
                          {language === 'Hindi'
                            ? 'गतिज ऊर्जा (Kinetic Energy) वह ऊर्जा है जो किसी वस्तु में उसकी गति के कारण होती है। Formula: KE = ½mv²'
                            : language === 'Tamil'
                            ? 'இயக்க ஆற்றல் (Kinetic Energy) என்பது ஒரு பொருளின் இயக்கத்தினால் பெறப்படும் ஆற்றலாகும். Formula: KE = ½mv²'
                            : 'La energía cinética es la energía que posee un objeto debido a su movimiento. Fórmula: KE = ½mv²'}
                        </span>
                        {isBilingual && (
                          <span className="text-xs text-slate-400 block pt-2 border-t border-slate-800/80">
                            <strong>English Reference:</strong> {activeNode.explanation_text}
                          </span>
                        )}
                      </>
                    ) : (
                      activeNode.explanation_text
                    )}
                  </p>
                </div>

                {/* Visual Diagram Content (SVG) */}
                {activeNode.visual_content && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Interactive Visual Aid:
                    </span>
                    <div
                      dangerouslySetInnerHTML={{ __html: activeNode.visual_content }}
                      className="rounded-lg overflow-hidden"
                    />
                  </div>
                )}

                {/* Interactive Assessment Question (if active node is interactive_quiz) */}
                {activeNode.activity_type === 'interactive_quiz' && (
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        Concept Checkpoint: Free Fall Energy Transformation
                      </span>
                      <button
                        onClick={() => {
                          setShowHint(true);
                          setHintsUsed(h => h + 1);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Need a Hint?
                      </button>
                    </div>

                    {showHint && (
                      <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 animate-fadeIn">
                        💡 <strong>Agnes Hint:</strong> Recall that Mechanical Energy is conserved: Total E = KE + PE. At ground impact, height = 0, so all PE is converted to KE!
                      </div>
                    )}

                    <p className="text-xs text-slate-200 font-medium">
                      A ball of mass 2 kg is dropped from a height of 10 m (g = 9.8 m/s²). What is its kinetic energy just before hitting the ground?
                    </p>

                    <div className="space-y-2">
                      {[
                        "0 J (Energy is completely lost)",
                        "196 J (Equal to initial gravitational potential energy)",
                        "98 J (Only half the energy transforms)",
                        "392 J (Velocity doubles gravitational force)"
                      ].map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            selectedOption === opt
                              ? 'bg-sky-600/20 border-sky-500 text-white font-semibold'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSubmitAnswer({
                        concept_id: 'c_ke',
                        question: 'A ball of mass 2 kg is dropped from 10 m...',
                        correct_option: '196 J (Equal to initial gravitational potential energy)'
                      })}
                      disabled={!selectedOption || isSubmitting}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? 'Evaluating...' : 'Submit Answer & Run Continuous Assessment'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">Select a learning node to begin.</div>
            )}
          </div>

          {/* Real-Time Misconception & Proactive Intervention Feedback Banner */}
          {assessmentFeedback && (
            <div className={`mt-6 p-4 rounded-xl border animate-fadeIn ${
              assessmentFeedback.is_correct
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-start gap-3">
                {assessmentFeedback.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm">
                    {assessmentFeedback.is_correct
                      ? 'Correct! Mastery Level Increased (+15%)'
                      : 'Conceptual Misconception Detected!'}
                  </div>
                  {assessmentFeedback.detected_misconception && (
                    <p className="text-slate-200">
                      <strong>Diagnosis:</strong> {assessmentFeedback.detected_misconception}
                    </p>
                  )}
                  {assessmentFeedback.predicted_gap && (
                    <p className="text-amber-300 pt-1">
                      ⚠️ <strong>Proactive Warning:</strong> Predicted struggle in <em>{assessmentFeedback.predicted_gap.target_concept}</em>. {assessmentFeedback.predicted_gap.recommended_proactive_intervention}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Traceability Link */}
          {activeNode?.source_citation && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Grounded Source Citation: <strong className="text-slate-300">{activeNode.source_citation}</strong>
              </span>
              <button
                onClick={() => onOpenTraceability(activeNode.concept_id)}
                className="text-sky-400 hover:text-sky-300 font-semibold"
              >
                Verify Provenance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
