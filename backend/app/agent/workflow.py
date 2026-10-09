import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agent.tools import agent_tools
from app.agent.agnes_client import agnes_client
from app.models import (
    EducatorSessionModel, LearnerProfileModel, 
    AssessmentHistoryModel, LearningPathItemModel, ConceptModel
)

logger = logging.getLogger("agnes.workflow")

class ContinuousAgenticWorkflow:
    """
    Agnes 3.0 Flash Autonomous Continuous Loop Orchestrator:
    Educator Input -> Resources -> Grounded Knowledge -> Learner Profile ->
    Gap Detection -> Personalized Learning -> Assessment -> Prediction ->
    Intervention -> Re-planning -> Analytics -> Feedback -> Next Path
    """

    @staticmethod
    async def process_educator_voice_input(db: Session, transcript: str) -> Dict[str, Any]:
        """
        Step 1: Speech-to-Text & Intent Analysis
        Extracts subject, topic, duration, student level, language, learning objectives, constraints.
        """
        prompt = (
            f"Analyze this educator spoken requirement:\n'{transcript}'\n"
            f"Extract: subject, topic, duration_minutes, student_level, language, learning_objectives, constraints."
        )
        
        # Live Agnes call with fallback
        async def fallback():
            duration = 45
            if "10 min" in transcript.lower() or "15 min" in transcript.lower():
                duration = 15
            elif "30 min" in transcript.lower():
                duration = 30
            
            return {
                "subject": "Physics",
                "topic": "Work, Energy and Power",
                "duration_minutes": duration,
                "student_level": "Grade 10 - Intermediate",
                "language": "English (with Multilingual Support)",
                "learning_objectives": [
                    "Understand mechanical work and the Work-Energy Theorem",
                    "Differentiate kinetic vs gravitational potential energy",
                    "Apply the Law of Conservation of Mechanical Energy"
                ],
                "classroom_constraints": [
                    "Visual diagrams required for low-friction comprehension",
                    "Real-time adaptability for short remaining session time"
                ],
                "raw_transcript": transcript
            }

        parsed = await agnes_client.chat_completion(
            messages=[
                {"role": "system", "content": "You are Agnes 3.0 Flash educational curriculum assistant."},
                {"role": "user", "content": prompt}
            ],
            fallback_generator=fallback
        )

        session = EducatorSessionModel(
            id=f"sess_{int(db.query(EducatorSessionModel).count()) + 1}",
            subject=parsed.get("subject", "Physics"),
            topic=parsed.get("topic", "Work and Energy"),
            duration_minutes=parsed.get("duration_minutes", 45),
            remaining_minutes=parsed.get("duration_minutes", 45),
            student_level=parsed.get("student_level", "Grade 10"),
            language=parsed.get("language", "English"),
            objectives=parsed.get("learning_objectives", []),
            constraints=parsed.get("classroom_constraints", []),
            voice_transcript=transcript
        )
        db.add(session)
        db.commit()

        return {
            "session_id": session.id,
            "parsed_intent": parsed,
            "is_demo_fallback": parsed.get("is_demo_fallback", True)
        }

    @staticmethod
    def run_continuous_assessment_cycle(
        db: Session, 
        learner_id: str, 
        answer_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Continuous Assessment & Real-Time Performance Analysis:
        - Evaluates answer, response time, hints, attempts
        - Detects specific misconceptions
        - Updates mastery per concept
        - Predicts future learning gaps
        - Triggers proactive intervention or re-planning
        """
        concept_id = answer_data.get("concept_id", "c_ke")
        selected = answer_data.get("selected_option", "")
        correct = answer_data.get("correct_option", "")
        resp_time = answer_data.get("response_time_sec", 12.0)
        hints = answer_data.get("hints_used", 0)
        attempts = answer_data.get("attempts", 1)

        is_correct = (selected.strip() == correct.strip())

        # Misconception diagnosis
        misconception = None
        if not is_correct:
            if "0 J" in selected:
                misconception = "Believes mechanical energy is destroyed during free fall rather than converted."
            elif "98 J" in selected:
                misconception = "Assumed linear velocity loss instead of conservation of total energy."
            else:
                misconception = "Confusion between force and energy equations."

        # Save assessment record
        record = AssessmentHistoryModel(
            id=f"att_{int(db.query(AssessmentHistoryModel).count()) + 1}",
            learner_id=learner_id,
            concept_id=concept_id,
            concept_name="Kinetic Energy & Conservation",
            question=answer_data.get("question", "What is kinetic energy at impact?"),
            selected_option=selected,
            correct_option=correct,
            is_correct=is_correct,
            response_time_sec=resp_time,
            hints_used=hints,
            attempts=attempts,
            detected_misconception=misconception
        )
        db.add(record)

        # Update Learner Profile Mastery
        profile = db.query(LearnerProfileModel).filter(LearnerProfileModel.id == learner_id).first()
        if profile:
            scores = profile.mastery_scores or {}
            curr = scores.get(concept_id, 0.5)
            if is_correct:
                curr = min(1.0, curr + 0.15 - (hints * 0.03))
            else:
                curr = max(0.0, curr - 0.20)
            scores[concept_id] = round(curr, 2)
            profile.mastery_scores = scores

            if misconception and misconception not in (profile.identified_misconceptions or []):
                profile.identified_misconceptions = (profile.identified_misconceptions or []) + [misconception]
            db.commit()

        # Proactive Gap Prediction
        gap_prediction = agent_tools.predict_learning_gap(
            db=db,
            student_id=learner_id,
            current_mastery=profile.mastery_scores if profile else {},
            target_concept="Conservation of Mechanical Energy"
        )

        return {
            "is_correct": is_correct,
            "detected_misconception": misconception,
            "updated_mastery": profile.mastery_scores if profile else {},
            "predicted_gap": gap_prediction.get("prediction"),
            "proactive_intervention_triggered": not is_correct
        }

workflow_orchestrator = ContinuousAgenticWorkflow()
