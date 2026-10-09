import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, JSON
from app.database import Base

class ResourceModel(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_type = Column(String, default="pdf")  # pdf, ppt, notes, link, text
    file_path = Column(String, nullable=True)
    raw_content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    authority_score = Column(Float, default=0.9)  # 0.0 - 1.0
    recency_year = Column(Integer, default=2026)
    status = Column(String, default="approved")  # approved, pending, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ConceptModel(Base):
    __tablename__ = "concepts"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    subject = Column(String, default="Science")
    topic = Column(String, default="Physics")
    definition = Column(Text, nullable=False)
    formulas = Column(JSON, default=list)
    examples = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)  # list of concept IDs
    source_id = Column(String, nullable=True)
    source_citation = Column(String, nullable=True)
    difficulty_level = Column(Integer, default=2)  # 1 to 5
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ConflictModel(Base):
    __tablename__ = "conflicts"

    id = Column(String, primary_key=True, index=True)
    concept_id = Column(String, nullable=True)
    concept_name = Column(String, nullable=False)
    source_a_id = Column(String, nullable=False)
    source_b_id = Column(String, nullable=False)
    source_a_text = Column(Text, nullable=False)
    source_b_text = Column(Text, nullable=False)
    conflict_type = Column(String, default="contradiction")  # contradiction, outdated_fact, terminology
    resolution = Column(Text, nullable=True)
    status = Column(String, default="detected")  # detected, resolved, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LearnerProfileModel(Base):
    __tablename__ = "learner_profiles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    avatar = Column(String, default="👩‍🎓")
    grade_level = Column(String, default="Grade 10")
    language_preference = Column(String, default="English")  # English, Hindi, Tamil, Telugu, Spanish
    learning_pace = Column(String, default="moderate")  # fast, moderate, steady
    interaction_preference = Column(String, default="visual")  # visual, auditory, hands_on, conceptual
    mastery_scores = Column(JSON, default=dict)  # concept_id -> float (0.0 to 1.0)
    identified_misconceptions = Column(JSON, default=list)
    predicted_learning_gaps = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AssessmentHistoryModel(Base):
    __tablename__ = "assessment_history"

    id = Column(String, primary_key=True, index=True)
    learner_id = Column(String, nullable=False, index=True)
    concept_id = Column(String, nullable=False, index=True)
    concept_name = Column(String, nullable=True)
    question = Column(Text, nullable=False)
    selected_option = Column(String, nullable=False)
    correct_option = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    response_time_sec = Column(Float, default=12.0)
    hints_used = Column(Integer, default=0)
    attempts = Column(Integer, default=1)
    detected_misconception = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class LearningPathItemModel(Base):
    __tablename__ = "learning_paths"

    id = Column(String, primary_key=True, index=True)
    learner_id = Column(String, nullable=False, index=True)
    concept_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    step_order = Column(Integer, default=1)
    difficulty = Column(Integer, default=2)
    estimated_minutes = Column(Integer, default=5)
    activity_type = Column(String, default="explanation")  # explanation, interactive_quiz, visual_diagram, hands_on
    status = Column(String, default="pending")  # pending, in_progress, completed, skipped
    is_priority = Column(Boolean, default=True)
    explanation_text = Column(Text, nullable=True)
    visual_content = Column(Text, nullable=True)
    interactive_data = Column(JSON, default=dict)
    source_citation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EducatorSessionModel(Base):
    __tablename__ = "educator_sessions"

    id = Column(String, primary_key=True, index=True)
    subject = Column(String, default="Physics")
    topic = Column(String, default="Work, Energy and Power")
    duration_minutes = Column(Integer, default=45)
    remaining_minutes = Column(Integer, default=45)
    student_level = Column(String, default="Grade 10 - Intermediate")
    language = Column(String, default="English")
    objectives = Column(JSON, default=list)
    constraints = Column(JSON, default=list)
    voice_transcript = Column(Text, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
