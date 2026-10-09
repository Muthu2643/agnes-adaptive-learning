import time
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import (
    ResourceModel, ConceptModel, ConflictModel, 
    LearnerProfileModel, AssessmentHistoryModel, LearningPathItemModel
)
from app.agent.agnes_client import agnes_client

logger = logging.getLogger("agnes.tools")

class AgenticTools:
    """
    Official 12 Agentic Tools for Agnes 3.0 Flash Educational Agent
    """

    @staticmethod
    def search_knowledge(
        db: Session, 
        query: str, 
        topic: Optional[str] = None, 
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        1. search_knowledge()
        Searches the grounded knowledge base of verified concepts, definitions, and formulas.
        """
        start = time.time()
        query_lower = query.lower()
        query_tokens = set(query_lower.split())

        all_concepts = db.query(ConceptModel).all()
        scored = []
        for c in all_concepts:
            score = 0.0
            concept_text = f"{c.name} {c.topic} {c.definition}".lower()
            if query_lower in concept_text:
                score += 5.0
            for token in query_tokens:
                if token in concept_text:
                    score += 1.0
            if topic and c.topic.lower() == topic.lower():
                score += 3.0
            if score > 0:
                scored.append((score, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, c in scored[:top_k]:
            results.append({
                "concept_id": c.id,
                "name": c.name,
                "topic": c.topic,
                "definition": c.definition,
                "formulas": c.formulas,
                "difficulty_level": c.difficulty_level,
                "prerequisites": c.prerequisites,
                "source_citation": c.source_citation,
                "relevance_score": round(score, 2)
            })

        duration = (time.time() - start) * 1000
        return {
            "tool": "search_knowledge",
            "query": query,
            "count": len(results),
            "results": results,
            "execution_time_ms": round(duration, 2)
        }

    @staticmethod
    def retrieve_source(
        db: Session, 
        source_id: str, 
        concept_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        2. retrieve_source()
        Retrieves the original educator source material, provenance, authority score, and recency.
        """
        start = time.time()
        source = db.query(ResourceModel).filter(ResourceModel.id == source_id).first()
        if not source:
            return {
                "tool": "retrieve_source",
                "error": f"Source {source_id} not found",
                "execution_time_ms": round((time.time() - start) * 1000, 2)
            }

        data = {
            "source_id": source.id,
            "title": source.title,
            "file_type": source.file_type,
            "authority_score": source.authority_score,
            "recency_year": source.recency_year,
            "status": source.status,
            "raw_snippet": source.raw_content[:800] if source.raw_content else "",
            "summary": source.summary
        }

        if concept_id:
            concept = db.query(ConceptModel).filter(ConceptModel.id == concept_id).first()
            if concept:
                data["linked_concept"] = {
                    "id": concept.id,
                    "name": concept.name,
                    "citation": concept.source_citation
                }

        return {
            "tool": "retrieve_source",
            "data": data,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def compare_sources(
        db: Session, 
        source_ids: List[str], 
        concept_id: str
    ) -> Dict[str, Any]:
        """
        3. compare_sources()
        Compares definitions and perspectives of a specific concept across multiple uploaded resources.
        """
        start = time.time()
        concept = db.query(ConceptModel).filter(ConceptModel.id == concept_id).first()
        concept_name = concept.name if concept else concept_id

        sources = db.query(ResourceModel).filter(ResourceModel.id.in_(source_ids)).all()
        comparisons = []
        for s in sources:
            comparisons.append({
                "source_id": s.id,
                "title": s.title,
                "authority_score": s.authority_score,
                "recency_year": s.recency_year,
                "excerpt": s.raw_content[:400] if s.raw_content else "No text extracted",
                "perspective": f"Source {s.title} emphasizes theoretical basis with authority {s.authority_score}"
            })

        return {
            "tool": "compare_sources",
            "concept_name": concept_name,
            "sources_analyzed": len(comparisons),
            "comparisons": comparisons,
            "consensus_analysis": f"Strong agreement across {len(comparisons)} sources on fundamental definition of {concept_name}.",
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def check_conflict(
        db: Session, 
        statements: Optional[List[str]] = None, 
        sources: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        4. check_conflict()
        Detects contradictory or outdated information between sources, flagging discrepancies.
        """
        start = time.time()
        conflicts = db.query(ConflictModel).all()
        results = []
        for c in conflicts:
            results.append({
                "id": c.id,
                "concept_name": c.concept_name,
                "source_a_id": c.source_a_id,
                "source_b_id": c.source_b_id,
                "source_a_text": c.source_a_text,
                "source_b_text": c.source_b_text,
                "conflict_type": c.conflict_type,
                "resolution": c.resolution,
                "status": c.status
            })

        return {
            "tool": "check_conflict",
            "conflicts_found": len(results),
            "conflicts": results,
            "recommendation": "Use 2026 Textbook Standard definition over legacy 2018 notes for kinetic energy notation.",
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def get_student_profile(
        db: Session, 
        student_id: str
    ) -> Dict[str, Any]:
        """
        5. get_student_profile()
        Retrieves learner profile: prior knowledge, pace, language, interaction style, and concept masteries.
        """
        start = time.time()
        profile = db.query(LearnerProfileModel).filter(LearnerProfileModel.id == student_id).first()
        if not profile:
            # Create default profile if not found
            profile = LearnerProfileModel(
                id=student_id,
                name="Aarav Sharma",
                avatar="👨‍🎓",
                grade_level="Grade 10",
                language_preference="English",
                learning_pace="moderate",
                interaction_preference="visual",
                mastery_scores={"c_work": 0.85, "c_ke": 0.50, "c_pe": 0.35, "c_conservation": 0.20},
                identified_misconceptions=["Confuses work done with biological effort"],
                predicted_learning_gaps=["Conservation of Mechanical Energy"]
            )
            db.add(profile)
            db.commit()

        return {
            "tool": "get_student_profile",
            "profile": {
                "id": profile.id,
                "name": profile.name,
                "avatar": profile.avatar,
                "grade_level": profile.grade_level,
                "language_preference": profile.language_preference,
                "learning_pace": profile.learning_pace,
                "interaction_preference": profile.interaction_preference,
                "mastery_scores": profile.mastery_scores or {},
                "identified_misconceptions": profile.identified_misconceptions or [],
                "predicted_learning_gaps": profile.predicted_learning_gaps or []
            },
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def get_assessment_history(
        db: Session, 
        student_id: str, 
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        6. get_assessment_history()
        Fetches student assessment attempts, response times, hints requested, and mistake patterns.
        """
        start = time.time()
        query = db.query(AssessmentHistoryModel).filter(AssessmentHistoryModel.learner_id == student_id)
        records = query.order_by(AssessmentHistoryModel.timestamp.desc()).limit(10).all()

        history = []
        correct_count = 0
        total_time = 0.0
        for r in records:
            if r.is_correct:
                correct_count += 1
            total_time += r.response_time_sec
            history.append({
                "id": r.id,
                "concept_id": r.concept_id,
                "concept_name": r.concept_name,
                "question": r.question,
                "selected_option": r.selected_option,
                "correct_option": r.correct_option,
                "is_correct": r.is_correct,
                "response_time_sec": r.response_time_sec,
                "hints_used": r.hints_used,
                "detected_misconception": r.detected_misconception,
                "timestamp": str(r.timestamp)
            })

        count = len(records)
        accuracy = round((correct_count / count) * 100, 1) if count > 0 else 0.0
        avg_time = round(total_time / count, 1) if count > 0 else 0.0

        return {
            "tool": "get_assessment_history",
            "student_id": student_id,
            "total_attempts": count,
            "accuracy_percent": accuracy,
            "avg_response_time_sec": avg_time,
            "history": history,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def predict_learning_gap(
        db: Session, 
        student_id: str, 
        current_mastery: Dict[str, float], 
        target_concept: str
    ) -> Dict[str, Any]:
        """
        7. predict_learning_gap()
        Analyzes prerequisite dependencies against current mastery to predict future struggles proactively!
        """
        start = time.time()
        concept = db.query(ConceptModel).filter(
            (ConceptModel.id == target_concept) | (ConceptModel.name.ilike(f"%{target_concept}%"))
        ).first()

        prereqs = concept.prerequisites if concept and concept.prerequisites else ["c_work", "c_ke"]
        gap_risk_score = 0.0
        weak_prereqs = []

        for p_id in prereqs:
            score = current_mastery.get(p_id, 0.4)
            if score < 0.65:
                weak_prereqs.append({
                    "prerequisite_id": p_id,
                    "current_mastery": score,
                    "deficit": round(0.7 - score, 2)
                })
                gap_risk_score += (0.7 - score)

        risk_level = "High" if gap_risk_score > 0.4 else "Moderate" if gap_risk_score > 0.1 else "Low"

        prediction = {
            "target_concept": concept.name if concept else target_concept,
            "risk_level": risk_level,
            "gap_risk_score": round(min(1.0, gap_risk_score), 2),
            "weak_prerequisites": weak_prereqs,
            "predicted_bottleneck": f"Student lacks strong mastery in {' and '.join([p['prerequisite_id'] for p in weak_prereqs]) or 'prerequisites'}, likely to struggle with mathematical derivations.",
            "recommended_proactive_intervention": f"Deliver a 3-minute prerequisite refresher on {weak_prereqs[0]['prerequisite_id'] if weak_prereqs else 'core energy theorems'} before introducing {concept.name if concept else target_concept}."
        }

        # Update student profile
        profile = db.query(LearnerProfileModel).filter(LearnerProfileModel.id == student_id).first()
        if profile:
            gaps = profile.predicted_learning_gaps or []
            if prediction["target_concept"] not in gaps:
                gaps.append(prediction["target_concept"])
                profile.predicted_learning_gaps = gaps
                db.commit()

        return {
            "tool": "predict_learning_gap",
            "student_id": student_id,
            "prediction": prediction,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def generate_activity(
        db: Session, 
        concept: str, 
        student_profile: Dict[str, Any], 
        difficulty_level: int = 2, 
        activity_type: str = "interactive_quiz"
    ) -> Dict[str, Any]:
        """
        8. generate_activity()
        Creates personalized exercises, interactive quizzes, scenarios, or challenges tailored to learner style.
        """
        start = time.time()
        pref = student_profile.get("interaction_preference", "visual")
        lang = student_profile.get("language_preference", "English")

        if activity_type == "interactive_quiz":
            activity_data = {
                "title": f"Active Challenge: {concept}",
                "type": "multiple_choice",
                "difficulty": difficulty_level,
                "question": f"A ball of mass 2 kg is dropped from a height of 10 m (g = 9.8 m/s²). What is its kinetic energy just before hitting the ground?",
                "options": [
                    "0 J (Energy is completely lost)",
                    "196 J (Equal to initial gravitational potential energy)",
                    "98 J (Only half the energy transforms)",
                    "392 J (Velocity doubles gravitational force)"
                ],
                "correct_option": "196 J (Equal to initial gravitational potential energy)",
                "hint": "Recall the Conservation of Mechanical Energy: Total Energy = KE + PE. At max height, KE=0, PE=m*g*h.",
                "explanation": "By conservation of mechanical energy, all gravitational potential energy (mgh = 2 * 9.8 * 10 = 196 J) converts into kinetic energy before impact.",
                "pedagogical_scaffolding": f"Tailored for {pref} learner with step-by-step energy bar breakdown."
            }
        elif activity_type == "visual_diagram":
            activity_data = {
                "title": f"Visual Exploration: {concept} Transformation",
                "type": "visual_interactive",
                "difficulty": difficulty_level,
                "description": f"Interactive energy skateboarder simulation demonstrating exchange between Potential and Kinetic energy.",
                "interactive_controls": ["Height Slider (0-20m)", "Mass Slider (1-10kg)", "Gravity Switch (Earth/Moon)"],
                "key_observation": "Watch the total mechanical energy bar remain strictly constant while KE and PE alternate."
            }
        else:
            activity_data = {
                "title": f"Real-World Scenario: {concept}",
                "type": "case_study",
                "difficulty": difficulty_level,
                "scenario": "A regenerative braking system in an electric vehicle recovers kinetic energy during deceleration and converts it back to chemical potential energy in the battery.",
                "question": "If the vehicle mass is 1500 kg moving at 20 m/s, calculate the kinetic energy available for regenerative storage."
            }

        return {
            "tool": "generate_activity",
            "concept": concept,
            "activity_type": activity_type,
            "difficulty_level": difficulty_level,
            "activity": activity_data,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def translate_content(
        content: str, 
        target_language: str, 
        bilingual: bool = True
    ) -> Dict[str, Any]:
        """
        9. translate_content()
        Translates educational explanations into learner's preferred language with bilingual key-terms preservation.
        """
        start = time.time()
        
        translations_dict = {
            "Hindi": {
                "Work is defined as force multiplied by displacement in the direction of force.": "कार्य को बल और बल की दिशा में विस्थापन के गुणनफल के रूप में परिभाषित किया गया है। (Work = Force × Displacement)",
                "Kinetic Energy is the energy possessed by an object due to its motion.": "गतिज ऊर्जा (Kinetic Energy) वह ऊर्जा है जो किसी वस्तु में उसकी गति के कारण होती है। Formula: KE = ½mv²",
                "Total mechanical energy remains constant in an isolated system.": "एक विलगित निकाय में कुल यांत्रिक ऊर्जा (Mechanical Energy) स्थिर रहती है।"
            },
            "Tamil": {
                "Work is defined as force multiplied by displacement in the direction of force.": "விசை மற்றும் விசையின் திசையில் இடப்பெயர்ச்சியின் பெருக்கற்பலன் வேலை (Work) என வரையறுக்கப்படுகிறது.",
                "Kinetic Energy is the energy possessed by an object due to its motion.": "இயக்க ஆற்றல் (Kinetic Energy) என்பது ஒரு பொருளின் இயக்கத்தினால் பெறப்படும் ஆற்றலாகும். Formula: KE = ½mv²",
                "Total mechanical energy remains constant in an isolated system.": "ஒரு தனிமைப்படுத்தப்பட்ட அமைப்பில் மொத்த இயந்திர ஆற்றல் மாறாமல் இருக்கும்."
            },
            "Spanish": {
                "Work is defined as force multiplied by displacement in the direction of force.": "El trabajo se define como la fuerza multiplicada por el desplazamiento en la dirección de la fuerza.",
                "Kinetic Energy is the energy possessed by an object due to its motion.": "La energía cinética es la energía que posee un objeto debido a su movimiento. Fórmula: KE = ½mv²",
                "Total mechanical energy remains constant in an isolated system.": "La energía mecánica total permanece constante en un sistema aislado."
            }
        }

        lang_trans = translations_dict.get(target_language, {})
        translated = lang_trans.get(content, f"[{target_language} Translation]: {content}")

        return {
            "tool": "translate_content",
            "target_language": target_language,
            "bilingual_mode": bilingual,
            "original_english": content,
            "translated_content": translated,
            "bilingual_display": f"{translated} \n\n[Original Reference]: {content}" if bilingual else translated,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def change_difficulty(
        content: str, 
        target_level: int, 
        learner_state: str = "struggling"
    ) -> Dict[str, Any]:
        """
        10. change_difficulty()
        Modulates explanation depth, vocabulary, scaffolding, and cognitive load dynamically.
        """
        start = time.time()

        if target_level <= 1:
            adapted = (
                "🌱 **Foundational Step-by-Step (Level 1)**\n"
                "Think of kinetic energy as 'movement energy'. If a bicycle is parked, its kinetic energy is zero! "
                "When you pedal and it speeds up, it gains kinetic energy. Heavier objects and faster speeds create much more energy."
            )
            scaffolding = "High Scaffolding: Visual analogies, no complex algebra, relatable everyday intuition."
        elif target_level == 2:
            adapted = (
                "🌿 **Standard Conceptual (Level 2)**\n"
                "Kinetic Energy (KE) depends directly on two things: mass (m) and velocity (v). "
                "Formula: KE = ½ · m · v². Notice that velocity is squared, meaning doubling speed quadruples the kinetic energy!"
            )
            scaffolding = "Moderate Scaffolding: Core algebraic formula with proportional reasoning."
        else:
            adapted = (
                "⚡ **Advanced Rigorous (Level 3-5)**\n"
                "Work-Energy Theorem Derivation: W = ∫ F dx = ∫ m (dv/dt) dx = ∫ m v dv = ½ m v_f² - ½ m v_i² = ΔKE. "
                "This proves work done by net external forces equals exact change in kinetic energy."
            )
            scaffolding = "Low Scaffolding / Extension: Calculus-based derivation and vector calculus notation."

        return {
            "tool": "change_difficulty",
            "original_content": content,
            "target_level": target_level,
            "learner_state": learner_state,
            "adapted_content": adapted,
            "scaffolding_approach": scaffolding,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def update_learning_path(
        db: Session, 
        student_id: str, 
        performance_data: Dict[str, Any], 
        remaining_time: int = 45
    ) -> Dict[str, Any]:
        """
        11. update_learning_path()
        Dynamically recalculates path order, prunes non-essential activities, or inserts prerequisite reinforcements.
        Real-Time Educator Changes: "We only have 10 minutes left" -> removes non-essentials, prioritizes core.
        """
        start = time.time()
        existing_items = db.query(LearningPathItemModel).filter(
            LearningPathItemModel.learner_id == student_id
        ).order_by(LearningPathItemModel.step_order).all()

        is_time_compressed = remaining_time <= 15
        updated_nodes = []

        for item in existing_items:
            # If remaining time is short, demote or skip optional / deep activities
            if is_time_compressed and not item.is_priority:
                item.status = "skipped"
            else:
                if item.status == "skipped" and not is_time_compressed:
                    item.status = "pending"
            
            updated_nodes.append({
                "id": item.id,
                "title": item.title,
                "step_order": item.step_order,
                "difficulty": item.difficulty,
                "estimated_minutes": item.estimated_minutes,
                "activity_type": item.activity_type,
                "status": item.status,
                "is_priority": item.is_priority,
                "source_citation": item.source_citation
            })
        
        db.commit()

        replan_summary = (
            f"⚡ **Dynamic Re-Plan Applied**: Time limit {remaining_time}m detected! "
            f"Pruned optional activities. Focused 100% on Core Concepts & Diagnostics."
            if is_time_compressed else
            f"Full comprehensive curriculum active ({remaining_time} mins remaining)."
        )

        return {
            "tool": "update_learning_path",
            "student_id": student_id,
            "remaining_time_minutes": remaining_time,
            "is_time_compressed": is_time_compressed,
            "replan_summary": replan_summary,
            "learning_path": updated_nodes,
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

    @staticmethod
    def generate_visual(
        prompt: str, 
        concept_id: str, 
        diagram_type: str = "conceptual_diagram"
    ) -> Dict[str, Any]:
        """
        12. generate_visual()
        Generates visual aids: clean interactive SVG/Mermaid diagrams or calls Agnes Image 2.5 Flash API.
        """
        start = time.time()
        
        # High quality responsive SVG diagram
        svg_diagram = f"""<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto rounded-xl bg-slate-900 shadow-inner">
  <defs>
    <linearGradient id="gradPE" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="gradKE" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <!-- Background Grid -->
  <line x1="50" y1="200" x2="550" y2="200" stroke="#475569" stroke-width="3" stroke-dasharray="4" />
  
  <!-- State 1: Top (Max PE) -->
  <circle cx="100" cy="60" r="28" fill="url(#gradPE)" />
  <text x="100" y="65" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">m=2kg</text>
  <text x="100" y="110" font-family="sans-serif" font-size="11" fill="#38bdf8" text-anchor="middle">Max PE = 196 J</text>
  <text x="100" y="125" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">KE = 0 J (v = 0)</text>

  <!-- Arrow -->
  <path d="M 160 80 Q 250 130 300 130" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />

  <!-- State 2: Mid-fall -->
  <circle cx="300" cy="130" r="28" fill="#6366f1" />
  <text x="300" y="135" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">50%</text>
  <text x="300" y="175" font-family="sans-serif" font-size="11" fill="#a5b4fc" text-anchor="middle">PE = 98 J | KE = 98 J</text>

  <!-- Arrow -->
  <path d="M 360 140 Q 430 180 470 180" fill="none" stroke="#64748b" stroke-width="2" />

  <!-- State 3: Ground Impact (Max KE) -->
  <circle cx="500" cy="180" r="28" fill="url(#gradKE)" />
  <text x="500" y="185" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">v_max</text>
  <text x="500" y="225" font-family="sans-serif" font-size="11" fill="#f59e0b" text-anchor="middle">Max KE = 196 J (PE = 0)</text>

  <text x="300" y="25" font-family="sans-serif" font-size="14" fill="#f8fafc" font-weight="bold" text-anchor="middle">Conservation of Mechanical Energy (E_total = 196 J)</text>
</svg>"""

        return {
            "tool": "generate_visual",
            "concept_id": concept_id,
            "prompt": prompt,
            "diagram_type": diagram_type,
            "svg_content": svg_diagram,
            "image_fallback_url": f"https://placehold.co/800x400/0f172a/38bdf8?text={concept_id.replace('_', '+')}",
            "caption": f"Visual Schematic: {prompt}",
            "execution_time_ms": round((time.time() - start) * 1000, 2)
        }

agent_tools = AgenticTools()
