import datetime
from sqlalchemy.orm import Session
from app.models import (
    ResourceModel, ConceptModel, ConflictModel, 
    LearnerProfileModel, AssessmentHistoryModel, 
    LearningPathItemModel, EducatorSessionModel
)

def seed_database(db: Session):
    # Check if already seeded
    if db.query(ConceptModel).count() > 0:
        return

    # Resources
    res1 = ResourceModel(
        id="res_textbook_2026",
        title="Class 10 Physics: Standard Curriculum (2026 Edition)",
        file_type="pdf",
        authority_score=0.98,
        recency_year=2026,
        status="approved",
        raw_content=(
            "Chapter 11: Work and Energy. Work is done when a force produces motion in an object. "
            "Formula: W = F * s * cos(theta). The unit of work is Joule (J). "
            "Kinetic energy is energy possessed by a body due to motion: KE = 0.5 * m * v^2. "
            "Gravitational potential energy is PE = m * g * h. "
            "Law of Conservation of Mechanical Energy: In an isolated system with conservative forces, "
            "the total mechanical energy (KE + PE) remains strictly constant throughout motion."
        ),
        summary="National standard accredited 2026 science curriculum textbook."
    )
    res2 = ResourceModel(
        id="res_lecture_notes_2023",
        title="Prof. Sharma Classroom Lecture Handouts (2023)",
        file_type="notes",
        authority_score=0.88,
        recency_year=2023,
        status="approved",
        raw_content=(
            "Lecture 4: Work-Energy Theorem. When net work is done on an object, its kinetic energy changes: "
            "W_net = Delta_KE. Note: Be careful with sign conventions when friction or air resistance is present. "
            "Older notes sometimes omitted vector dot product, but modern syllabus requires W = F dot d."
        ),
        summary="Detailed university instructor handouts focusing on real-world problem solving."
    )
    res3 = ResourceModel(
        id="res_legacy_notes_2018",
        title="Old Physics Review Guide (2018 Edition)",
        file_type="notes",
        authority_score=0.72,
        recency_year=2018,
        status="pending",
        raw_content=(
            "Work can be measured in calories or foot-pounds in older systems. "
            "Some old texts state work is done even if motion is resisted by opposing surfaces."
        ),
        summary="Archived reference with legacy units and outdated definitions."
    )
    db.add_all([res1, res2, res3])

    # Concepts
    c1 = ConceptModel(
        id="c_work",
        name="Work Done by Constant Force",
        subject="Physics",
        topic="Work and Energy",
        definition="Work is scalar product of applied force vector and displacement in the direction of force.",
        formulas=["W = F \\cdot d \\cdot \\cos(\\theta)", "1\\text{ J} = 1\\text{ N} \\times 1\\text{ m}"],
        examples=["Pushing a trolley 5 meters across flat ground", "Lifting a 10 kg box vertically upward"],
        prerequisites=[],
        source_id="res_textbook_2026",
        source_citation="Class 10 Physics 2026, Ch. 11, Section 11.1, p. 142",
        difficulty_level=1
    )
    c2 = ConceptModel(
        id="c_ke",
        name="Kinetic Energy",
        subject="Physics",
        topic="Work and Energy",
        definition="The capacity to do work possessed by an object strictly due to its translational motion.",
        formulas=["KE = \\frac{1}{2} m v^2"],
        examples=["A speeding bullet", "Water flowing through a hydroelectric turbine"],
        prerequisites=["c_work"],
        source_id="res_textbook_2026",
        source_citation="Class 10 Physics 2026, Ch. 11, Section 11.2, p. 146",
        difficulty_level=2
    )
    c3 = ConceptModel(
        id="c_pe",
        name="Gravitational Potential Energy",
        subject="Physics",
        topic="Work and Energy",
        definition="Energy stored in an object as a consequence of its vertical elevation relative to a reference datum.",
        formulas=["PE_g = m \\cdot g \\cdot h"],
        examples=["Water stored behind a high dam", "A drawn bowstring ready to release"],
        prerequisites=["c_work"],
        source_id="res_lecture_notes_2023",
        source_citation="Prof. Sharma Handouts 2023, Lecture 4, p. 3",
        difficulty_level=2
    )
    c4 = ConceptModel(
        id="c_conservation",
        name="Conservation of Mechanical Energy",
        subject="Physics",
        topic="Work and Energy",
        definition="In the absence of non-conservative forces, the total mechanical sum of KE and PE remains invariant.",
        formulas=["E_{total} = KE + PE = \\text{constant}", "KE_1 + PE_1 = KE_2 + PE_2"],
        examples=["Ideal roller coaster loop", "Free-fall acceleration of a dropped sphere"],
        prerequisites=["c_work", "c_ke", "c_pe"],
        source_id="res_textbook_2026",
        source_citation="Class 10 Physics 2026, Ch. 11, Section 11.4, p. 153",
        difficulty_level=3
    )
    db.add_all([c1, c2, c3, c4])

    # Conflicts
    conf1 = ConflictModel(
        id="conf_01",
        concept_id="c_work",
        concept_name="Definition of Work Under Zero Displacement",
        source_a_id="res_textbook_2026",
        source_b_id="res_legacy_notes_2018",
        source_a_text="Work done is strictly zero if displacement d = 0, regardless of muscular exertion.",
        source_b_text="Exerting effort against an immovable obstacle is classified as internal biological work.",
        conflict_type="contradiction",
        resolution="Adopt 2026 National Standard: Strictly 0 Joules in Newtonian mechanics; label biological fatigue as metabolic consumption.",
        status="detected"
    )
    db.add(conf1)

    # Learner Profiles
    lp1 = LearnerProfileModel(
        id="s_aarav",
        name="Aarav Sharma",
        avatar="Student",
        grade_level="Grade 10",
        language_preference="English",
        learning_pace="moderate",
        interaction_preference="visual",
        mastery_scores={"c_work": 0.88, "c_ke": 0.52, "c_pe": 0.40, "c_conservation": 0.25},
        identified_misconceptions=["Believes energy is destroyed on impact"],
        predicted_learning_gaps=["Conservation of Mechanical Energy"]
    )
    lp2 = LearnerProfileModel(
        id="s_priya",
        name="Priya Patel",
        avatar="Student",
        grade_level="Grade 10",
        language_preference="Hindi",
        learning_pace="fast",
        interaction_preference="conceptual",
        mastery_scores={"c_work": 0.95, "c_ke": 0.82, "c_pe": 0.78, "c_conservation": 0.70},
        identified_misconceptions=[],
        predicted_learning_gaps=[]
    )
    lp3 = LearnerProfileModel(
        id="s_rohan",
        name="Rohan Verma",
        avatar="Student",
        grade_level="Grade 10",
        language_preference="English",
        learning_pace="steady",
        interaction_preference="hands_on",
        mastery_scores={"c_work": 0.60, "c_ke": 0.35, "c_pe": 0.30, "c_conservation": 0.15},
        identified_misconceptions=["Confuses velocity doubling with energy doubling"],
        predicted_learning_gaps=["Kinetic Energy Formulas", "Conservation of Energy"]
    )
    db.add_all([lp1, lp2, lp3])

    svg_sample = """<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto rounded-lg bg-slate-900"><circle cx="80" cy="50" r="24" fill="#38bdf8"/><text x="80" y="55" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">PE=196J</text><path d="M 120 70 Q 250 120 380 150" fill="none" stroke="#64748b" stroke-width="2"/><circle cx="420" cy="150" r="24" fill="#f59e0b"/><text x="420" y="155" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">KE=196J</text><text x="250" y="30" fill="#94a3b8" font-size="13" text-anchor="middle">Continuous Energy Interchange</text></svg>"""

    lp_items = [
        LearningPathItemModel(
            id="node_1",
            learner_id="s_aarav",
            concept_id="c_work",
            title="1. Foundational Work & Displacement Check",
            step_order=1,
            difficulty=1,
            estimated_minutes=4,
            activity_type="explanation",
            status="completed",
            is_priority=True,
            explanation_text="Work done requires both force AND net displacement in the direction of the force: W = F * d.",
            source_citation="Class 10 Physics 2026, p. 142"
        ),
        LearningPathItemModel(
            id="node_2",
            learner_id="s_aarav",
            concept_id="c_ke",
            title="2. Kinetic Energy: Quadratic Velocity Visualizer",
            step_order=2,
            difficulty=2,
            estimated_minutes=6,
            activity_type="visual_diagram",
            status="in_progress",
            is_priority=True,
            explanation_text="Kinetic energy scales with velocity squared (v^2). Doubling speed quadruples the kinetic energy!",
            visual_content=svg_sample,
            source_citation="Class 10 Physics 2026, p. 146"
        ),
        LearningPathItemModel(
            id="node_3",
            learner_id="s_aarav",
            concept_id="c_ke",
            title="3. Interactive Diagnostic Check: Kinetic Energy Calculation",
            step_order=3,
            difficulty=2,
            estimated_minutes=5,
            activity_type="interactive_quiz",
            status="pending",
            is_priority=True,
            explanation_text="Hands-on multiple choice test assessing energy magnitude and calculations.",
            source_citation="Prof. Sharma Handouts 2023, p. 3"
        ),
        LearningPathItemModel(
            id="node_4",
            learner_id="s_aarav",
            concept_id="c_pe",
            title="4. Gravitational Potential Energy Elevation Lab",
            step_order=4,
            difficulty=2,
            estimated_minutes=7,
            activity_type="explanation",
            status="pending",
            is_priority=False,
            explanation_text="Explores potential energy accumulation as a function of height: PE = m * g * h.",
            source_citation="Class 10 Physics 2026, p. 150"
        ),
        LearningPathItemModel(
            id="node_5",
            learner_id="s_aarav",
            concept_id="c_conservation",
            title="5. Proactive Intervention: Law of Conservation",
            step_order=5,
            difficulty=3,
            estimated_minutes=8,
            activity_type="visual_diagram",
            status="pending",
            is_priority=True,
            explanation_text="Proactive scaffolding synthesizing KE and PE into total invariant mechanical energy.",
            visual_content=svg_sample,
            source_citation="Class 10 Physics 2026, p. 153"
        )
    ]
    db.add_all(lp_items)

    sess = EducatorSessionModel(
        id="sess_1",
        subject="Physics",
        topic="Work, Energy and Power",
        duration_minutes=45,
        remaining_minutes=45,
        student_level="Grade 10 - Intermediate",
        language="English",
        objectives=[
            "Understand mechanical work and the Work-Energy Theorem",
            "Differentiate kinetic vs gravitational potential energy",
            "Apply the Law of Conservation of Mechanical Energy"
        ],
        constraints=[
            "Visual diagrams for quick comprehension",
            "Continuous misconception detection"
        ],
        voice_transcript="Good morning. Today's session is on Grade 10 Work and Energy. Duration is 45 minutes. Focus on kinetic energy formulas and conservation theorem."
    )
    db.add(sess)

    db.commit()
