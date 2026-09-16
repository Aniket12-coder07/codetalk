"""
LangChain + Claude Interviewer Engine for CodeTalk
Evaluates verbal reasoning, generates proactive interviewer follow-ups,
and reviews candidate code submissions against their verbal explanations.
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

logger = logging.getLogger("codetalk.interviewer")

QUESTIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "questions.json"

def get_question_by_id(question_id: str) -> Optional[Dict[str, Any]]:
    """Loads a question from questions.json by its ID."""
    if not QUESTIONS_PATH.exists():
        return None
    try:
        with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
            questions = json.load(f)
            for q in questions:
                if q.get("id") == question_id:
                    return q
    except Exception as e:
        logger.error(f"Error loading question {question_id}: {e}")
    return None

def get_anthropic_model():
    """Returns ChatAnthropic instance or None if key is missing/placeholder."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    if not api_key or api_key.startswith("your_") or len(api_key) < 10:
        return None

    try:
        from langchain_anthropic import ChatAnthropic
        # Default to Claude 3.5 Sonnet for top-tier reasoning
        model_name = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        return ChatAnthropic(
            model=model_name,
            anthropic_api_key=api_key,
            temperature=0.3,
            max_tokens=2048,
        )
    except Exception as e:
        logger.warning(f"Failed to initialize ChatAnthropic: {e}")
        return None

# ============================================================================
# 1. Verbal Reasoning & Follow-up Generation
# ============================================================================

INTERVIEWER_SYSTEM_PROMPT = """You are a Senior Staff Software Engineer acting as a mock technical interviewer for a top-tier tech company.
The candidate is solving a Data Structures & Algorithms problem and speaking their thought process out loud.

Problem Context:
Title: {title}
Difficulty: {difficulty}
Description: {description}
Constraints: {constraints}
Expected Time Complexity: {expected_time}
Expected Space Complexity: {expected_space}
Rubric Considerations: {rubric}

Your Objective:
1. Listen carefully to the candidate's spoken explanation.
2. Evaluate their verbal reasoning (clarity, intuition, complexity awareness, edge cases).
3. If their explanation is incomplete, vague, or contains flaws, provide an encouraging yet probing follow-up question.
4. If their explanation is strong, challenge them on an edge case, optimization, or invite them to write code.
5. Speak concisely like a real interviewer in an interview room.

Return your response strictly as valid JSON matching this schema:
{{
  "stage": "clarification | approach | complexity | edge_cases | ready_to_code",
  "reasoning_critique": "A 1-2 sentence assessment of what they articulated well and what was missing",
  "followup_question": "The direct question the interviewer asks the candidate next",
  "edge_case_addressed": true or false,
  "complexity_mentioned": true or false,
  "suggested_action": "continue_speaking | ask_clarification | start_coding"
}}
"""

async def generate_followup(
    question_id: str,
    transcript: str,
    code: Optional[str] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Analyzes spoken transcript and produces interviewer feedback and follow-up question.
    """
    question = get_question_by_id(question_id)
    if not question:
        question = {
            "title": "Technical Coding Problem",
            "difficulty": "Medium",
            "description": "Solve the problem efficiently.",
            "constraints": [],
            "expectedComplexity": {"time": "O(N)", "space": "O(N)"},
            "rubric": {},
        }

    llm = get_anthropic_model()

    # Fallback simulation if no API key is provided
    if not llm:
        logger.info("Using mock interviewer follow-up generator (no Anthropic API key configured).")
        return _generate_mock_followup(question, transcript)

    system_content = INTERVIEWER_SYSTEM_PROMPT.format(
        title=question.get("title", ""),
        difficulty=question.get("difficulty", ""),
        description=question.get("description", ""),
        constraints="\n".join(question.get("constraints", [])),
        expected_time=question.get("expectedComplexity", {}).get("time", "O(N)"),
        expected_space=question.get("expectedComplexity", {}).get("space", "O(N)"),
        rubric=json.dumps(question.get("rubric", {})),
    )

    history_str = ""
    if chat_history:
        for turn in chat_history[-4:]:
            role = turn.get("role", "user")
            text = turn.get("text", "")
            history_str += f"\n[{role.upper()}]: {text}"

    user_prompt = f"""Candidate's Spoken Transcript:
\"\"\"{transcript}\"\"\"

Current Code in Editor (if any):
```
{code or "# No code written yet"}
```

Recent Interview Dialog:
{history_str or "No previous dialogue"}

Analyze the candidate's spoken thought process and return the JSON response:"""

    try:
        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=user_prompt),
        ]
        response = await llm.ainvoke(messages)
        content = response.content.strip()

        # Extract JSON if wrapped in markdown blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(content)
        return parsed
    except Exception as e:
        logger.error(f"Claude invocation failed for follow-up: {e}")
        return _generate_mock_followup(question, transcript)

def _generate_mock_followup(question: Dict[str, Any], transcript: str) -> Dict[str, Any]:
    """Provides dynamic heuristic feedback when running in offline/testing mode."""
    t_lower = transcript.lower()

    if "hash" in t_lower or "map" in t_lower:
        return {
            "stage": "complexity",
            "reasoning_critique": "Great instinct to use a hash map for O(1) lookups. You communicated the core data structure clearly.",
            "followup_question": "What is the space complexity overhead of that hash map in the worst-case scenario, and can you walk through what happens if there are duplicate keys?",
            "edge_case_addressed": False,
            "complexity_mentioned": "o(" in t_lower or "time" in t_lower,
            "suggested_action": "continue_speaking",
        }
    elif "brute" in t_lower or "nested" in t_lower:
        return {
            "stage": "approach",
            "reasoning_critique": "Starting with the brute-force approach shows thoroughness, but we should optimize before writing code.",
            "followup_question": "A brute-force comparison takes O(N^2) time. Can you think of an auxiliary data structure that lets us check for existing items in O(1) time?",
            "edge_case_addressed": False,
            "complexity_mentioned": True,
            "suggested_action": "continue_speaking",
        }
    elif len(transcript.strip()) > 80:
        return {
            "stage": "ready_to_code",
            "reasoning_critique": "You've outlined the logic and main progression clearly. Your thought process is well structured.",
            "followup_question": "Your approach sounds solid. Would you like to go ahead and start translating this into code in the editor, and keep talking through your implementation as you type?",
            "edge_case_addressed": True,
            "complexity_mentioned": True,
            "suggested_action": "start_coding",
        }
    else:
        return {
            "stage": "approach",
            "reasoning_critique": "Good start. Remember to state the brute-force solution or high-level intuition before diving into code details.",
            "followup_question": f"How are you thinking about approaching {question.get('title', 'this problem')}? What data structure comes to mind first?",
            "edge_case_addressed": False,
            "complexity_mentioned": False,
            "suggested_action": "continue_speaking",
        }

# ============================================================================
# 2. Code Review & Verbal Alignment Reviewer
# ============================================================================

REVIEW_SYSTEM_PROMPT = """You are a Principal Software Engineer evaluating a candidate's final technical interview submission.
You are reviewing BOTH their submitted code AND their spoken explanation transcript to assess their overall performance.

Problem Details:
Title: {title}
Expected Time: {expected_time}
Expected Space: {expected_space}
Rubric: {rubric}

Evaluation Criteria:
1. Correctness: Does the code work for all cases and constraints?
2. Code Quality: Cleanliness, readability, modern idioms.
3. Verbal Alignment: Did they implement the solution they verbally explained? Did they justify design choices?
4. Communication & Complexity: Did they accurately evaluate time and space complexity?

Return your evaluation strictly as valid JSON matching this schema:
{{
  "overall_score": 85,
  "passed": true,
  "summary": "Concise 2-3 sentence overview of candidate performance",
  "scores": {{
    "problem_solving": 90,
    "verbal_communication": 85,
    "code_correctness": 90,
    "code_quality": 80,
    "complexity_analysis": 85
  }},
  "strengths": [
    "Strength 1...",
    "Strength 2..."
  ],
  "areas_for_improvement": [
    "Area 1...",
    "Area 2..."
  ],
  "time_complexity_evaluation": {{
    "expected": "{expected_time}",
    "candidate_stated": "Extracted or inferred from transcript",
    "actual_code": "Actual Big-O of code",
    "verdict": "optimal | sub-optimal | incorrect"
  }},
  "space_complexity_evaluation": {{
    "expected": "{expected_space}",
    "candidate_stated": "Extracted or inferred from transcript",
    "actual_code": "Actual Big-O of code",
    "verdict": "optimal | sub-optimal | incorrect"
  }},
  "verbal_code_alignment": "Assessment of how faithfully the code matched the spoken reasoning."
}}
"""

async def evaluate_submission(
    question_id: str,
    transcript: str,
    code: str,
    language: str = "python",
) -> Dict[str, Any]:
    """
    Evaluates candidate's written code and verbal explanation together.
    """
    question = get_question_by_id(question_id)
    if not question:
        question = {
            "title": "Technical Problem",
            "expectedComplexity": {"time": "O(N)", "space": "O(N)"},
            "rubric": {},
        }

    llm = get_anthropic_model()

    if not llm:
        logger.info("Using mock submission evaluation (no Anthropic API key configured).")
        return _generate_mock_review(question, transcript, code)

    system_content = REVIEW_SYSTEM_PROMPT.format(
        title=question.get("title", ""),
        expected_time=question.get("expectedComplexity", {}).get("time", "O(N)"),
        expected_space=question.get("expectedComplexity", {}).get("space", "O(N)"),
        rubric=json.dumps(question.get("rubric", {})),
    )

    user_content = f"""Candidate's Spoken Explanation:
\"\"\"{transcript}\"\"\"

Submitted Code ({language}):
```{language}
{code}
```

Perform the complete evaluation and return the JSON report:"""

    try:
        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=user_content),
        ]
        response = await llm.ainvoke(messages)
        content = response.content.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(content)
        return parsed
    except Exception as e:
        logger.error(f"Claude invocation failed for submission review: {e}")
        return _generate_mock_review(question, transcript, code)

def _generate_mock_review(question: Dict[str, Any], transcript: str, code: str) -> Dict[str, Any]:
    """Generates realistic mock evaluation report for testing."""
    has_code = len(code.strip()) > 30
    has_transcript = len(transcript.strip()) > 40

    score = 88 if (has_code and has_transcript) else (70 if has_code else 55)

    return {
        "overall_score": score,
        "passed": score >= 70,
        "summary": "The candidate articulated a clear intuition using the optimal data structure and translated it smoothly into working code.",
        "scores": {
            "problem_solving": 90,
            "verbal_communication": 85 if has_transcript else 60,
            "code_correctness": 90 if has_code else 40,
            "code_quality": 85 if has_code else 50,
            "complexity_analysis": 85,
        },
        "strengths": [
            "Proactively verbalized the time-space tradeoff before writing code.",
            "Good variable naming and concise implementation.",
            "Effectively walked through test examples step-by-step.",
        ],
        "areas_for_improvement": [
            "Could explicitly mention edge cases such as empty inputs or negative values earlier.",
            "Add comments or type hints in the code for better maintainability.",
        ],
        "time_complexity_evaluation": {
            "expected": question.get("expectedComplexity", {}).get("time", "O(N)"),
            "candidate_stated": "O(N)",
            "actual_code": "O(N)",
            "verdict": "optimal",
        },
        "space_complexity_evaluation": {
            "expected": question.get("expectedComplexity", {}).get("space", "O(N)"),
            "candidate_stated": "O(N)",
            "actual_code": "O(N)",
            "verdict": "optimal",
        },
        "verbal_code_alignment": "Strong alignment: The candidate's spoken algorithm directly corresponded to the final implementation.",
    }
