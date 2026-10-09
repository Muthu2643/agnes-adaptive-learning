# Agnes 3.0 Flash — Agentic Adaptive Learning Platform
**HR26 AI Track | Agnes AI Hackathon**

An autonomous, agentic curriculum and personalized learning experience engine powered by **Agnes 3.0 Flash** (512K context window). The system bridges fragmented educator materials (PDFs, lecture notes, textbooks) with multi-modal adaptive learner pathways through natural voice interaction and continuous misconception assessment.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Web Speech API (Voice recognition & speech synthesis).
- **Backend**: FastAPI (Python 3.14 async server), Pydantic v2 schemas, multipart file processing, PyPDF extractor.
- **Database**: PostgreSQL support via SQLAlchemy ORM (with automatic fallback to embedded SQLite for zero-setup local resilience).
- **AI Agent**: **Agnes 3.0 Flash** (`agnes-3.0-flash` primary model, `agnes-image-2.5-flash` visual model) via `https://apihub.agnes-ai.com/v1`, featuring request queuing, exponential backoff rate limiting (10 RPM), and demo fallbacks.

---

## 🛠️ The 12 Agentic Tools

Agnes 3.0 Flash is equipped with 12 specialized agentic tools:

1. `search_knowledge(query, topic, top_k)`: Searches the grounded knowledge base of verified concepts, definitions, and mathematical formulations.
2. `retrieve_source(source_id, concept_id)`: Fetches original source citations, authority scores (0.0–1.0), and recency metadata.
3. `compare_sources(source_ids, concept_id)`: Analyzes definitions and perspectives across multiple uploaded documents.
4. `check_conflict(statements, sources)`: Detects contradictions, outdated figures, or conflicting terminology between sources.
5. `get_student_profile(student_id)`: Retrieves learner pace, language preference, interaction style, and real-time concept masteries.
6. `get_assessment_history(student_id, topic)`: Accesses past quiz attempts, response times, hints requested, and error patterns.
7. `predict_learning_gap(student_id, current_mastery, target_concept)`: Forecasts future conceptual bottlenecks before they occur.
8. `generate_activity(concept, student_profile, difficulty_level, activity_type)`: Generates personalized interactive quizzes, case studies, or simulations.
9. `translate_content(content, target_language, bilingual)`: Translates content into regional languages (Hindi, Tamil, Spanish, etc.) with bilingual term preservation.
10. `change_difficulty(content, target_level, learner_state)`: Dynamically modulates cognitive load and scaffolding from Level 1 (foundational) to Level 3 (rigorous).
11. `update_learning_path(student_id, performance_data, remaining_time)`: Recalculates sequence and prunes non-essential modules during time constraints.
12. `generate_visual(prompt, concept_id, diagram_type)`: Produces interactive SVG diagrams and visual aids for visual learners.

---

## 🔄 End-to-End Workflow

```mermaid
flowchart TD
    A["🎙️ Educator Voice Input (Web Speech STT)"] --> B["🧠 Intent & Constraint Analysis"]
    B --> C["📚 Resource Collection (PDF, Notes, Links)"]
    C --> D["🔍 Source Comparison & Conflict Detection"]
    D --> E["🛡️ Grounded Knowledge Base & Trust Ranking"]
    E --> F["👤 Learner Profiling & Diagnostic Test"]
    F --> G["🧭 Personalized Learning Path"]
    G --> H["📖 Adaptive Multilingual & Visual Content"]
    H --> I["✍️ Continuous Assessment (Hints, Response Times)"]
    I --> J["🔬 Misconception Diagnosis & Gap Prediction"]
    J --> K["⚡ Proactive Intervention & Dynamic Re-Planning"]
    K --> L["📊 Classroom Analytics Dashboard"]
    L --> M["📑 Grounded Source Traceability"]
    M --> N["🚀 Next-Lesson Recommendation"]
```

### Key Capabilities
- **Educator Voice Studio**: Speak lesson requirements naturally. Intent analysis extracts Subject, Topic, Duration, Student Level, Language, Objectives, and Constraints.
- **Conflict & Outdated Information Engine**: Compares modern 2026 standards with legacy notes, flagging discrepancies with recommended resolutions.
- **Dynamic 10-Minute Re-Planning**: Teacher can say *"We only have 10 minutes left!"* — Agnes immediately compresses the curriculum, prunes optional activities, and prioritizes core mastery.
- **Misconception Detection**: Evaluates *why* learners make mistakes rather than simply calculating percentages.
- **Source Traceability**: Every generated explanation and concept links back directly to the educator's verified uploaded materials.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ (Node 24 LTS recommended)
- Git & GitHub CLI

### 2. Environment Setup
Create or update `backend/.env`:
```env
AGNES_API_BASE=https://apihub.agnes-ai.com/v1
AGNES_MODEL=agnes-3.0-flash
AGNES_IMAGE_MODEL=agnes-image-2.5-flash
AGNES_API_KEY=your_agnes_api_key_here

# PostgreSQL URL (Falls back to SQLite automatically if offline)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agnes_learning
```

### 3. Running the Website
Run the single command:
```powershell
python run_app.py
```

Then visit:
- **Application Web UI**: [http://localhost:8000](http://localhost:8000)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐙 Git & GitHub Integration

```bash
git init
git add .
git commit -m "feat: Agnes 3.0 Flash agentic adaptive learning platform"
gh auth login
gh repo create agnes-adaptive-learning --public --source=. --remote=origin --push
```
