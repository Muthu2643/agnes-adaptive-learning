const API_BASE = import.meta.env.VITE_API_URL || "";

export const api = {
  // Voice & Intent
  async processVoiceIntent(transcript) {
    const res = await fetch(`${API_BASE}/educator/voice-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    return res.json();
  },

  // Resource & Sources
  async uploadResource(formData) {
    const res = await fetch(`${API_BASE}/educator/upload-resource`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async getResources() {
    const res = await fetch(`${API_BASE}/educator/resources`);
    return res.json();
  },

  async getConflicts() {
    const res = await fetch(`${API_BASE}/educator/conflicts`);
    return res.json();
  },

  async resolveConflict(conflictId) {
    const res = await fetch(`${API_BASE}/educator/resolve-conflict/${conflictId}`, {
      method: 'POST',
    });
    return res.json();
  },

  // Real-time Educator Control
  async educatorControl(controlData) {
    const res = await fetch(`${API_BASE}/educator/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(controlData),
    });
    return res.json();
  },

  // The 12 Agentic Tools
  async executeTool(toolName, parameters = {}) {
    const res = await fetch(`${API_BASE}/tools/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_name: toolName, parameters }),
    });
    return res.json();
  },

  async getToolsList() {
    const res = await fetch(`${API_BASE}/tools/list`);
    return res.json();
  },

  // Learner Adaptive Experience
  async getLearnerProfile(learnerId = 's_aarav') {
    const res = await fetch(`${API_BASE}/learner/profile/${learnerId}`);
    return res.json();
  },

  async getLearningPath(learnerId = 's_aarav') {
    const res = await fetch(`${API_BASE}/learner/learning-path/${learnerId}`);
    return res.json();
  },

  async getDiagnosticQuestions(learnerId = 's_aarav') {
    const res = await fetch(`${API_BASE}/learner/diagnostic/${learnerId}`);
    return res.json();
  },

  async submitAnswer(answerData) {
    const res = await fetch(`${API_BASE}/learner/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answerData),
    });
    return res.json();
  },

  async adaptContent(content, targetLanguage, difficulty, bilingual = true) {
    const res = await fetch(`${API_BASE}/learner/adapt-content?content=${encodeURIComponent(content)}&target_language=${encodeURIComponent(targetLanguage)}&difficulty=${difficulty}&bilingual=${bilingual}`, {
      method: 'POST',
    });
    return res.json();
  },

  // Analytics & Provenance
  async getAnalyticsDashboard() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },

  async getSourceTraceability(conceptId) {
    const res = await fetch(`${API_BASE}/analytics/traceability/${conceptId}`);
    return res.json();
  },
};
