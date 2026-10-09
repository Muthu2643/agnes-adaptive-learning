from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database import get_db
from app.agent.tools import agent_tools
from app.schemas import ToolCallRequest, ToolCallResponse

router = APIRouter(prefix="/tools", tags=["12 Agentic Tools"])

@router.post("/execute", response_model=ToolCallResponse)
def execute_tool(payload: ToolCallRequest, db: Session = Depends(get_db)):
    """
    Unified invocation point for all 12 Agentic Tools
    """
    name = payload.tool_name
    p = payload.parameters
    
    try:
        if name == "search_knowledge":
            res = agent_tools.search_knowledge(
                db=db, 
                query=p.get("query", ""), 
                topic=p.get("topic"), 
                top_k=p.get("top_k", 5)
            )
        elif name == "retrieve_source":
            res = agent_tools.retrieve_source(
                db=db, 
                source_id=p.get("source_id", ""), 
                concept_id=p.get("concept_id")
            )
        elif name == "compare_sources":
            res = agent_tools.compare_sources(
                db=db, 
                source_ids=p.get("source_ids", []), 
                concept_id=p.get("concept_id", "")
            )
        elif name == "check_conflict":
            res = agent_tools.check_conflict(
                db=db, 
                statements=p.get("statements"), 
                sources=p.get("sources")
            )
        elif name == "get_student_profile":
            res = agent_tools.get_student_profile(
                db=db, 
                student_id=p.get("student_id", "s_aarav")
            )
        elif name == "get_assessment_history":
            res = agent_tools.get_assessment_history(
                db=db, 
                student_id=p.get("student_id", "s_aarav"), 
                topic=p.get("topic")
            )
        elif name == "predict_learning_gap":
            res = agent_tools.predict_learning_gap(
                db=db, 
                student_id=p.get("student_id", "s_aarav"), 
                current_mastery=p.get("current_mastery", {}), 
                target_concept=p.get("target_concept", "Conservation of Energy")
            )
        elif name == "generate_activity":
            res = agent_tools.generate_activity(
                db=db, 
                concept=p.get("concept", "Kinetic Energy"), 
                student_profile=p.get("student_profile", {}), 
                difficulty_level=p.get("difficulty_level", 2), 
                activity_type=p.get("activity_type", "interactive_quiz")
            )
        elif name == "translate_content":
            res = agent_tools.translate_content(
                content=p.get("content", ""), 
                target_language=p.get("target_language", "Hindi"), 
                bilingual=p.get("bilingual", True)
            )
        elif name == "change_difficulty":
            res = agent_tools.change_difficulty(
                content=p.get("content", ""), 
                target_level=p.get("target_level", 2), 
                learner_state=p.get("learner_state", "struggling")
            )
        elif name == "update_learning_path":
            res = agent_tools.update_learning_path(
                db=db, 
                student_id=p.get("student_id", "s_aarav"), 
                performance_data=p.get("performance_data", {}), 
                remaining_time=p.get("remaining_time", 45)
            )
        elif name == "generate_visual":
            res = agent_tools.generate_visual(
                prompt=p.get("prompt", "Energy Conservation in Free Fall"), 
                concept_id=p.get("concept_id", "c_conservation"), 
                diagram_type=p.get("diagram_type", "conceptual_diagram")
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown tool: {name}")

        return ToolCallResponse(
            tool_name=name,
            status="success",
            result=res,
            is_demo_fallback=res.get("is_demo_fallback", False),
            execution_time_ms=res.get("execution_time_ms", 15.0)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")

@router.get("/list")
def list_available_tools():
    """Returns documentation and signatures of all 12 tools."""
    return {
        "models": ["agnes-3.0-flash", "agnes-image-2.5-flash"],
        "tools": [
            {"name": "search_knowledge", "description": "Search grounded knowledge base for verified concepts & formulas"},
            {"name": "retrieve_source", "description": "Retrieve original source text, authority score and citation"},
            {"name": "compare_sources", "description": "Compare concept definitions across multiple uploaded documents"},
            {"name": "check_conflict", "description": "Detect contradictory or outdated information between sources"},
            {"name": "get_student_profile", "description": "Get learner's background, pace, language, and concept mastery"},
            {"name": "get_assessment_history", "description": "Fetch past quiz answers, mistakes, hints and response times"},
            {"name": "predict_learning_gap", "description": "Forecast future conceptual bottlenecks before they happen"},
            {"name": "generate_activity", "description": "Create interactive adaptive quizzes, scenarios or simulations"},
            {"name": "translate_content", "description": "Translate learning content into regional languages with bilingual support"},
            {"name": "change_difficulty", "description": "Dynamically scale explanation depth & scaffolding (Levels 1-5)"},
            {"name": "update_learning_path", "description": "Re-order and compress path based on performance & time constraints"},
            {"name": "generate_visual", "description": "Produce responsive SVG/Mermaid diagrams and visual aids"}
        ]
    }
