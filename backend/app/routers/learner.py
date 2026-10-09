from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models import LearnerProfileModel, LearningPathItemModel, ConceptModel
from app.schemas import LearnerAnswerSubmission, DiagnosticResponse
from app.agent.tools import agent_tools
from app.agent.workflow import workflow_orchestrator

router = APIRouter(prefix="/learner", tags=["Learner Adaptive Experience"])

@router.get("/profile/{learner_id}")
def get_learner_profile(learner_id: str, db: Session = Depends(get_db)):
    """Retrieve learner profile with pace, language, mastery & predicted gaps."""
    res = agent_tools.get_student_profile(db, learner_id)
    return res["profile"]

@router.get("/learning-path/{learner_id}")
def get_learning_path(learner_id: str, db: Session = Depends(get_db)):
    """Returns the ordered personalized learning path for this learner."""
    items = db.query(LearningPathItemModel).filter(
        LearningPathItemModel.learner_id == learner_id
    ).order_by(LearningPathItemModel.step_order).all()

    return [{
        "id": i.id,
        "concept_id": i.concept_id,
        "title": i.title,
        "step_order": i.step_order,
        "difficulty": i.difficulty,
        "estimated_minutes": i.estimated_minutes,
        "activity_type": i.activity_type,
        "status": i.status,
        "is_priority": i.is_priority,
        "explanation_text": i.explanation_text,
        "visual_content": i.visual_content,
        "source_citation": i.source_citation
    } for i in items]

@router.get("/diagnostic/{learner_id}")
def get_diagnostic_questions(learner_id: str, db: Session = Depends(get_db)):
    """Generates an initial adaptive diagnostic test to identify baseline knowledge."""
    return [
        {
            "id": "diag_1",
            "concept_id": "c_work",
            "concept_name": "Work Done",
            "question": "A student pushes against a heavy stone wall with 500 N force for 10 minutes without moving it. How much work is done?",
            "options": [
                "5000 Joules",
                "0 Joules (Displacement is zero)",
                "500 Joules",
                "Infinite Joules due to biological fatigue"
            ],
            "correct_option": "0 Joules (Displacement is zero)",
            "difficulty": 1,
            "pedagogical_target": "Checks if student confuses biological muscular fatigue with physical work (W = F × d)."
        },
        {
            "id": "diag_2",
            "concept_id": "c_ke",
            "concept_name": "Kinetic Energy",
            "question": "If the speed of a moving car is doubled, what happens to its kinetic energy?",
            "options": [
                "It remains unchanged",
                "It doubles (2x)",
                "It quadruples (4x)",
                "It halves (0.5x)"
            ],
            "correct_option": "It quadruples (4x)",
            "difficulty": 2,
            "pedagogical_target": "Checks quadratic velocity dependence in KE = ½mv²."
        },
        {
            "id": "diag_3",
            "concept_id": "c_conservation",
            "concept_name": "Conservation of Energy",
            "question": "A 1 kg pendulum swings back and forth in a frictionless room. At the lowest point of swing:",
            "options": [
                "Potential energy is maximum, kinetic energy is zero",
                "Kinetic energy is maximum, potential energy is minimum",
                "Both kinetic and potential energy are zero",
                "Energy is destroyed by gravity"
            ],
            "correct_option": "Kinetic energy is maximum, potential energy is minimum",
            "difficulty": 3,
            "pedagogical_target": "Checks understanding of continuous mechanical energy interchange."
        }
    ]

@router.post("/submit-answer")
def submit_learner_answer(submission: LearnerAnswerSubmission, db: Session = Depends(get_db)):
    """
    Submits an activity/quiz answer.
    AI evaluates correctness, response time, hints used, updates concept mastery,
    diagnoses misconceptions, and predicts future learning gaps in real time.
    """
    result = workflow_orchestrator.run_continuous_assessment_cycle(
        db=db,
        learner_id=submission.learner_id,
        answer_data=submission.dict()
    )
    return result

@router.post("/adapt-content")
def adapt_content_request(
    content: str, 
    target_language: str = "English", 
    difficulty: int = 2, 
    bilingual: bool = True
):
    """
    Multilingual adaptation & difficulty modification on the fly.
    """
    diff_res = agent_tools.change_difficulty(content, target_level=difficulty)
    trans_res = agent_tools.translate_content(
        content=diff_res["adapted_content"], 
        target_language=target_language, 
        bilingual=bilingual
    )
    return {
        "adapted_difficulty": diff_res,
        "translation": trans_res
    }
