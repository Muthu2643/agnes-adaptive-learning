from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VoiceInputRequest(BaseModel):
    transcript: str = Field(..., description="Speech transcript from the educator")
    audio_base64: Optional[str] = None

class IntentAnalysisResponse(BaseModel):
    subject: str
    topic: str
    duration_minutes: int
    student_level: str
    language: str
    learning_objectives: List[str]
    classroom_constraints: List[str]
    raw_transcript: str

class ConflictDetectionResult(BaseModel):
    id: str
    concept_name: str
    source_a_id: str
    source_b_id: str
    source_a_text: str
    source_b_text: str
    conflict_type: str
    resolution: str
    status: str

class ToolCallRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]

class ToolCallResponse(BaseModel):
    tool_name: str
    status: str
    result: Any
    is_demo_fallback: bool = False
    execution_time_ms: float

class EducatorControlRequest(BaseModel):
    action: str  # approve, edit, reject, regenerate, change_priority, time_constraint
    item_id: Optional[str] = None
    time_remaining_minutes: Optional[int] = None
    custom_instruction: Optional[str] = None

class LearnerAnswerSubmission(BaseModel):
    learner_id: str
    concept_id: str
    question: str
    selected_option: str
    correct_option: str
    response_time_sec: float
    hints_used: int = 0
    attempts: int = 1

class DiagnosticResponse(BaseModel):
    learner_id: str
    answers: List[LearnerAnswerSubmission]
