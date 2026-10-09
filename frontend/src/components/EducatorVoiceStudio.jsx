import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Send, Volume2, CheckCircle2, AlertCircle, ArrowRight, Play } from 'lucide-react';
import { api } from '../services/api';

export default function EducatorVoiceStudio({ onSessionCreated }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(
    "Good morning class. Today we will teach Grade 10 Physics on Work and Kinetic Energy. Duration is 45 minutes. Focus on kinetic energy formulas, real-world examples, and the conservation theorem for intermediate learners in English."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Speech Recognition not natively supported. You can type or use the voice presets below!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleAnalyzeIntent = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await api.processVoiceIntent(transcript);
      setAnalysisResult(res.parsed_intent);
      if (onSessionCreated) onSessionCreated(res);
    } catch (e) {
      console.error(e);
      alert("Error analyzing voice intent.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const presets = [
    {
      label: "Standard 45-min Physics Lesson",
      text: "Good morning class. Today we will teach Grade 10 Physics on Work and Kinetic Energy. Duration is 45 minutes. Focus on kinetic energy formulas, real-world examples, and the conservation theorem for intermediate learners in English."
    },
    {
      label: "15-min Compressed Lab",
      text: "We only have 15 minutes left today. Quick revision on mechanical work versus biological fatigue, key kinetic formula KE = half m v squared, and a quick visual check."
    },
    {
      label: "Bilingual Math/Physics Prep",
      text: "Teach Grade 10 conservation of mechanical energy in bilingual format (English and Hindi). Duration 30 minutes with interactive diagrams and continuous diagnostic questions."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Mic className="w-4 h-4" />
            Step 1: Educator Voice Input & STT
          </div>
          <h2 className="text-2xl font-extrabold text-white">Educator Voice Studio</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Speak your lesson goals naturally. Agnes 3.0 Flash will perform real-time speech-to-text, 
            extract curriculum constraints, objectives, and autonomously construct the grounded learning experience.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Voice Input Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Natural Speech Input
              </span>
              <div className="flex items-center gap-2">
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Listening live...
                  </span>
                )}
                <button
                  onClick={toggleVoiceRecording}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                      : 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? 'Stop Recording' : 'Start Microphone'}
                </button>
              </div>
            </div>

            {/* Transcript Textarea */}
            <div className="relative">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={5}
                placeholder="Speak or paste your teaching requirements here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
              />
              {isRecording && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <div className="w-1 h-3 bg-sky-400 animate-bounce rounded" />
                  <div className="w-1 h-5 bg-sky-400 animate-bounce delay-75 rounded" />
                  <div className="w-1 h-2 bg-sky-400 animate-bounce delay-150 rounded" />
                </div>
              )}
            </div>

            {/* Quick Voice Presets */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Voice Simulation Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTranscript(p.text)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all text-left flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 text-sky-400" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleAnalyzeIntent}
              disabled={isAnalyzing || !transcript.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-600/30 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Agnes 3.0 Flash Analyzing Intent...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract Intent & Build Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Intent Analysis Result */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Intent & Requirement Analysis
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Agnes NLP
            </span>
          </div>

          {analysisResult ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Subject</span>
                  <span className="text-sm font-bold text-sky-400">{analysisResult.subject}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Topic</span>
                  <span className="text-sm font-bold text-emerald-400">{analysisResult.topic}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Allocated Duration</span>
                  <span className="text-sm font-bold text-amber-400">{analysisResult.duration_minutes} Mins</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Student Level</span>
                  <span className="text-sm font-bold text-indigo-400">{analysisResult.student_level}</span>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Core Learning Objectives:
                </span>
                <ul className="space-y-1.5">
                  {analysisResult.learning_objectives?.map((obj, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Constraints */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Classroom Constraints & Adaptations:
                </span>
                <ul className="space-y-1.5">
                  {analysisResult.classroom_constraints?.map((c, i) => (
                    <li key={i} className="text-xs text-amber-300 flex items-start gap-2 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
              <Sparkles className="w-8 h-8 mb-2 text-slate-600 animate-pulse" />
              <p className="text-xs">No intent analysis executed yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Click "Extract Intent & Build Plan" to process the spoken transcript.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
