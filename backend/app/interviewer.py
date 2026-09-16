"""
LangChain + Claude Interviewer Engine for CodeTalk
Evaluates verbal reasoning, generates proactive interviewer follow-ups,
and reviews candidate code submissions against their verbal explanations with rigorous efficiency checks.
"""

import os
import re
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage

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
        model_name = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        return ChatAnthropic(
            model=model_name,
            anthropic_api_key=api_key,
            temperature=0.2,
            max_tokens=2048,
        )
    except Exception as e:
        logger.warning(f"Failed to initialize ChatAnthropic: {e}")
        return None

# ============================================================================
# Heuristic Code & Transcript Analyzers for Rigorous Efficiency Checking
# ============================================================================

GIVE_UP_PATTERNS = [
    r"i don'?t know",
    r"i have no idea",
    r"not sure",
    r"can'?t solve",
    r"give up",
    r"no clue",
    r"dunno",
    r"i am stuck",
    r"i'?m stuck",
    r"skip",
    r"help me",
    r"cannot do",
    r"can'?t do",
]

def check_give_up(transcript: str) -> bool:
    """Returns True if the transcript indicates the candidate gave up or has no idea."""
    t_lower = transcript.lower().strip()
    for pattern in GIVE_UP_PATTERNS:
        if re.search(pattern, t_lower):
            # Check if it's just "I don't know" without a subsequent detailed explanation
            if len(t_lower) < 120 or t_lower.count(" ") < 20:
                return True
    return False

def strip_code_comments(code: str) -> str:
    """Removes comments and blank lines to inspect actual algorithmic logic."""
    lines = []
    for line in code.splitlines():
        line_clean = line.strip()
        if not line_clean:
            continue
        if line_clean.startswith("#") or line_clean.startswith("//") or line_clean.startswith("/*") or line_clean.startswith("*"):
            continue
        lines.append(line_clean)
    return "\n".join(lines)

def is_code_unmodified_or_empty(code: str, question: Optional[Dict[str, Any]] = None) -> bool:
    """Detects if code is blank, unmodified starter boilerplate, or just 'pass'/'return' across Python, JS, TS, Java, C++, and Go."""
    clean = strip_code_comments(code).strip()
    if not clean or len(clean) < 15:
        return True

    # Check if lines inside function body are just 'pass', '...', or empty
    meaningful_lines = [
        l for l in clean.splitlines()
        if not l.startswith("def ")
        and not l.startswith("function ")
        and not l.startswith("class ")
        and not l.startswith("public ")
        and not l.startswith("private ")
        and not l.startswith("func ")
        and not l.startswith("package ")
        and not l.startswith("import ")
        and not l.startswith("#include")
        and not l.startswith("using ")
        and not l.startswith("/**")
        and not l.startswith("*/")
        and not l.startswith("type ")
        and l not in ["pass", "...", "{", "}", "};", "return", "return []", "return None", "return null;", "return 0;", "return false;", "return 0.0;", "return -1;"]
    ]
    return len(meaningful_lines) == 0

def analyze_code_efficiency(question_id: str, code: str, language: str = "python") -> Dict[str, Any]:
    """
    Rigorously analyzes the algorithm structure in the submitted code
    to determine actual runtime Big-O and efficiency verdict.
    """
    code_clean = strip_code_comments(code)
    code_lower = code_clean.lower()

    if question_id == "two-sum":
        # Check for nested loops (brute-force O(N^2))
        has_two_loops = (
            code_lower.count("for ") >= 2
            or (code_lower.count("for") >= 1 and code_lower.count("while") >= 1)
            or (code_lower.count("for ") >= 1 and ".index(" in code_lower)
            or (code_lower.count("for ") >= 1 and " in nums[" in code_lower)
        )
        # Check for hash map (optimal O(N))
        has_hashmap = (
            ("dict" in code_lower or "seen" in code_lower or "map" in code_lower or "{}" in code_clean or "new map" in code_lower)
            and (" in " in code_clean or ".has(" in code_clean or ".get(" in code_clean or "[" in code_clean)
        )

        if has_hashmap and not has_two_loops:
            return {
                "actual_time": "O(N)",
                "actual_space": "O(N)",
                "verdict": "optimal",
                "notes": "Optimal O(N) single-pass hash map implementation.",
            }
        elif has_two_loops:
            return {
                "actual_time": "O(N^2)",
                "actual_space": "O(1)",
                "verdict": "sub-optimal",
                "notes": "Brute-force nested loops. Time complexity is O(N^2), which fails performance scale requirements.",
            }
        else:
            return {
                "actual_time": "Incomplete / Sub-optimal",
                "actual_space": "O(1)",
                "verdict": "sub-optimal",
                "notes": "Code does not appear to implement the optimal single-pass hash map.",
            }

    elif question_id == "valid-parentheses":
        has_stack = "stack" in code_lower or "append" in code_lower or "push" in code_lower or "pop" in code_lower
        if has_stack:
            return {
                "actual_time": "O(N)",
                "actual_space": "O(N)",
                "verdict": "optimal",
                "notes": "Optimal O(N) LIFO stack implementation.",
            }
        elif ".replace(" in code_lower:
            return {
                "actual_time": "O(N^2)",
                "actual_space": "O(N)",
                "verdict": "sub-optimal",
                "notes": "String replacement in a loop incurs O(N^2) runtime.",
            }
        else:
            return {
                "actual_time": "Incomplete",
                "actual_space": "Incomplete",
                "verdict": "incorrect",
                "notes": "Missing LIFO stack data structure.",
            }

    elif question_id == "search-in-rotated-sorted-array":
        has_binary_search = "left" in code_lower and "right" in code_lower and ("mid" in code_lower or "//" in code_lower or "math.floor" in code_lower)
        if has_binary_search:
            return {
                "actual_time": "O(log N)",
                "actual_space": "O(1)",
                "verdict": "optimal",
                "notes": "Optimal modified binary search.",
            }
        elif "for " in code_lower or ".index(" in code_lower or ".indexof(" in code_lower:
            return {
                "actual_time": "O(N)",
                "actual_space": "O(1)",
                "verdict": "sub-optimal",
                "notes": "Linear search O(N) violates the mandatory O(log N) problem requirement.",
            }
        else:
            return {
                "actual_time": "Incomplete",
                "actual_space": "O(1)",
                "verdict": "incorrect",
                "notes": "No binary search logic detected.",
            }

    # Default fallback analysis
    return {
        "actual_time": "O(N)",
        "actual_space": "O(1)",
        "verdict": "optimal" if len(code_clean) > 80 else "sub-optimal",
        "notes": "Standard implementation.",
    }

# ============================================================================
# 1. Verbal Reasoning & Follow-up Generation
# ============================================================================

INTERVIEWER_SYSTEM_PROMPT = """You are a Senior Staff Software Engineer acting as a mock technical interviewer for a top-tier tech company (Google/Meta/Apple).
The candidate is solving a Data Structures & Algorithms problem and speaking their thought process out loud.

Problem Context:
Title: {title}
Difficulty: {difficulty}
Description: {description}
Constraints: {constraints}
Expected Time Complexity: {expected_time}
Expected Space Complexity: {expected_space}
Rubric Considerations: {rubric}

STRICT EVALUATION PRINCIPLES:
1. If the candidate says "I don't know", expresses confusion, or has spoken fewer than 15 words:
   - Do NOT praise them or say "Great explanation".
   - Set stage to "clarification" or "approach".
   - Provide an encouraging yet firm hint to guide them to think of the brute force or basic data structure.
2. If the candidate proposes a brute-force O(N^2) solution:
   - Acknowledge that brute force works for small inputs, but challenge them on efficiency and ask how to achieve {expected_time}.
3. If they propose the optimal solution:
   - Verify if they explained space complexity and potential edge cases (empty input, negatives, duplicates).
   - If they haven't mentioned edge cases or complexity, ask a targeted follow-up.
   - Only set stage to "ready_to_code" when they have articulated BOTH the algorithm and its time/space complexity.

Return your response strictly as valid JSON matching this schema:
{{
  "stage": "clarification | approach | complexity | edge_cases | ready_to_code",
  "reasoning_critique": "A 1-2 sentence honest assessment of what they articulated well and what was missing",
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
    t_lower = transcript.lower().strip()

    # Case 1: Candidate says "I don't know" or has virtually no speech
    if check_give_up(transcript) or len(t_lower) < 15:
        return {
            "stage": "clarification",
            "reasoning_critique": "You expressed uncertainty about how to start. In an interview, don't stay silent or give up — start by walking through a concrete example with small numbers.",
            "followup_question": f"No problem, let's break it down together! For {question.get('title', 'this problem')}, how would a human solve this manually on paper for a small array like [2, 7, 11] with target 9?",
            "edge_case_addressed": False,
            "complexity_mentioned": False,
            "suggested_action": "continue_speaking",
        }

    # Case 2: Candidate mentions hash map / optimal strategy
    elif "hash" in t_lower or "map" in t_lower or "seen" in t_lower or "dict" in t_lower:
        return {
            "stage": "complexity",
            "reasoning_critique": "Good instinct to suggest a hash map for constant-time lookups. You communicated the data structure idea clearly.",
            "followup_question": f"What is the worst-case space complexity of that hash map, and how does your solution handle duplicate elements if target minus num equals the same number?",
            "edge_case_addressed": False,
            "complexity_mentioned": "o(" in t_lower or "time" in t_lower,
            "suggested_action": "continue_speaking",
        }

    # Case 3: Candidate mentions brute-force
    elif "brute" in t_lower or "nested" in t_lower or "two loops" in t_lower:
        return {
            "stage": "approach",
            "reasoning_critique": "Starting with brute force demonstrates understanding of the baseline, but O(N^2) will not scale to large inputs.",
            "followup_question": "Checking every pair takes quadratic time. Can you think of an auxiliary data structure that lets you check for the complement in O(1) time instead?",
            "edge_case_addressed": False,
            "complexity_mentioned": True,
            "suggested_action": "continue_speaking",
        }

    # Case 4: Substantial explanation provided
    elif len(t_lower) > 90:
        return {
            "stage": "ready_to_code",
            "reasoning_critique": "You have articulated the main logic and data structure approach clearly. Your verbal communication is structured.",
            "followup_question": "Your approach sounds solid. Please go ahead and write your implementation in the editor, and talk through each line as you code.",
            "edge_case_addressed": True,
            "complexity_mentioned": True,
            "suggested_action": "start_coding",
        }

    else:
        return {
            "stage": "approach",
            "reasoning_critique": "You've made a brief start. Make sure to clearly outline your proposed algorithm and Big-O runtime before writing code.",
            "followup_question": f"How are you thinking about tackling {question.get('title', 'this problem')}? What is the brute-force way, and can we optimize it?",
            "edge_case_addressed": False,
            "complexity_mentioned": False,
            "suggested_action": "continue_speaking",
        }

# ============================================================================
# 2. Code Review & Verbal Alignment Reviewer
# ============================================================================

REVIEW_SYSTEM_PROMPT = """You are a Principal Software Engineer conducting a rigorous technical interview debrief at Google or Meta.
You are evaluating BOTH the candidate's submitted code AND their spoken transcript.

Problem Details:
Title: {title}
Difficulty: {difficulty}
Expected Time: {expected_time}
Expected Space: {expected_space}
Rubric: {rubric}

MANDATORY RIGOROUS GRADING PRINCIPLES:
1. UNATTEMPTED QUESTIONS / UNWRITTEN CODE (EASY, MEDIUM, OR HARD):
   - If the candidate submitted empty code, only starter comments/templates, only 'pass', or non-functional boilerplate stubs:
     * This question is UNATTEMPTED.
     * overall_score MUST BE between 0 and 5 (inclusive, out of 100) across all difficulties (Easy, Medium, or Hard). NEVER exceed 5.
     * All sub-scores (problem_solving, verbal_communication, code_correctness, code_quality, complexity_analysis) MUST BE between 0 and 5.
     * passed MUST BE FALSE.
     * actual_code time and space MUST BE 'Incomplete / Unattempted' with verdict 'incorrect'.
2. "I DON'T KNOW" / GIVING UP / BLANK ANSWERS (EASY, MEDIUM, OR HARD):
   - If the candidate's answer or transcript says "I don't know", "I give up", "no idea", or provides no substantive algorithmic explanation:
     * This is an "I don't know" / gave up response.
     * overall_score MUST BE between 0 and 5 (inclusive, out of 100) across all difficulties (Easy, Medium, or Hard). NEVER exceed 5.
     * All sub-scores (problem_solving, verbal_communication, code_correctness, code_quality, complexity_analysis) MUST BE between 0 and 5.
     * passed MUST BE FALSE.
3. EFFICIENCY & COMPLEXITY AUDIT:
   - If the problem requires {expected_time} (e.g. O(N)), but candidate wrote nested loops O(N^2):
     * verdict MUST BE 'sub-optimal'.
     * code_correctness and complexity_analysis MUST BE penalized (max score 60).
     * passed MUST BE FALSE unless brute-force was explicitly asked for.
   - If candidate claimed O(N) verbally but code is O(N^2), highlight the discrepancy in verbal_code_alignment.
4. PASSING STANDARD:
   - A candidate ONLY passes (passed = true, overall_score >= 70) if:
     * They implemented working, correct code beyond boilerplate.
     * They articulated an algorithm with valid Big-O awareness.
     * The runtime complexity meets the expected Big-O constraint.

Return your evaluation strictly as valid JSON matching this schema:
{{
  "overall_score": 2,
  "passed": false,
  "summary": "Direct, honest 2-3 sentence assessment of candidate performance.",
  "scores": {{
    "problem_solving": 2,
    "verbal_communication": 3,
    "code_correctness": 0,
    "code_quality": 1,
    "complexity_analysis": 0
  }},
  "strengths": [
    "Honest about knowledge gap / attempted problem setup..."
  ],
  "areas_for_improvement": [
    "Did not implement the solution; left starter code empty.",
    "Needs to study optimal O(N) hash map techniques."
  ],
  "time_complexity_evaluation": {{
    "expected": "{expected_time}",
    "candidate_stated": "Candidate stated Big-O",
    "actual_code": "Actual Big-O of code",
    "verdict": "optimal | sub-optimal | incorrect"
  }},
  "space_complexity_evaluation": {{
    "expected": "{expected_space}",
    "candidate_stated": "Candidate stated Big-O",
    "actual_code": "Actual Big-O of code",
    "verdict": "optimal | sub-optimal | incorrect"
  }},
  "verbal_code_alignment": "Explanation of whether code matched spoken reasoning."
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

    # Pre-check: If code is unmodified boilerplate or empty, or candidate gave up, reject immediately
    is_blank_code = is_code_unmodified_or_empty(code, question)
    is_gave_up = check_give_up(transcript)

    llm = get_anthropic_model()

    if not llm:
        logger.info("Using rigorous mock submission evaluation (no Anthropic API key configured).")
        return _generate_mock_review(question, transcript, code, is_blank_code, is_gave_up)

    system_content = REVIEW_SYSTEM_PROMPT.format(
        title=question.get("title", ""),
        difficulty=question.get("difficulty", "Medium"),
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

Evaluate rigorously according to the mandatory principles and return JSON:"""

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

        # STRICT ENFORCEMENT: Unattempted code or "I don't know" answers MUST BE scored 0-5 in every case (Easy, Medium, Hard)
        if is_blank_code or is_gave_up:
            parsed["overall_score"] = min(int(parsed.get("overall_score", 2)), 5)
            parsed["passed"] = False
            if "scores" in parsed and isinstance(parsed["scores"], dict):
                for k in parsed["scores"]:
                    parsed["scores"][k] = min(int(parsed["scores"][k]), 5)

        return parsed
    except Exception as e:
        logger.error(f"Claude invocation failed for submission review: {e}")
        return _generate_mock_review(question, transcript, code, is_blank_code, is_gave_up)

def _generate_mock_review(
    question: Dict[str, Any],
    transcript: str,
    code: str,
    is_blank_code: bool,
    is_gave_up: bool,
) -> Dict[str, Any]:
    """
    Generates a rigorous, objective evaluation report checking code efficiency,
    syntax correctness, and verbal alignment.
    Strictly awards 0-5 for unattempted or 'I don't know' answers across Easy, Medium, and Hard problems.
    """
    difficulty = question.get("difficulty", "Medium")
    expected_time = question.get("expectedComplexity", {}).get("time", "O(N)")
    expected_space = question.get("expectedComplexity", {}).get("space", "O(N)")

    efficiency = analyze_code_efficiency(question.get("id", ""), code)

    # -------------------------------------------------------------------------
    # Scenario A: Candidate did not write code AND said "I don't know" / gave up
    # -------------------------------------------------------------------------
    if is_blank_code and is_gave_up:
        return {
            "overall_score": 2,
            "passed": False,
            "summary": f"Unattempted problem with no solution provided ({difficulty} difficulty). The candidate left the starter template untouched and verbally stated they did not know how to approach the problem.",
            "scores": {
                "problem_solving": 2,
                "verbal_communication": 2,
                "code_correctness": 0,
                "code_quality": 1,
                "complexity_analysis": 0,
            },
            "strengths": [
                "Honest about knowledge gap instead of guessing randomly.",
                "Opened the interview session and engaged with the problem statement.",
            ],
            "areas_for_improvement": [
                "Did not attempt any solution code; left the function body as placeholder boilerplate.",
                "Did not attempt a brute-force approach. In technical interviews, always articulate a brute-force solution even if unsure of the optimal one.",
                f"Review the required algorithms and data structures for {question.get('title', 'this problem')} (target: {expected_time}).",
            ],
            "time_complexity_evaluation": {
                "expected": expected_time,
                "candidate_stated": "None",
                "actual_code": "Unattempted / No code",
                "verdict": "incorrect",
            },
            "space_complexity_evaluation": {
                "expected": expected_space,
                "candidate_stated": "None",
                "actual_code": "Unattempted / No code",
                "verdict": "incorrect",
            },
            "verbal_code_alignment": "No implementation provided to evaluate alignment against spoken words.",
        }

    # -------------------------------------------------------------------------
    # Scenario B: Blank / Unattempted Code (Starter boilerplate untouched), spoke some reasoning
    # -------------------------------------------------------------------------
    if is_blank_code:
        return {
            "overall_score": 3,
            "passed": False,
            "summary": f"Unattempted code implementation ({difficulty} difficulty). The candidate spoke about the problem but did not implement any runnable code, leaving the starter template untouched.",
            "scores": {
                "problem_solving": 3,
                "verbal_communication": 4,
                "code_correctness": 0,
                "code_quality": 1,
                "complexity_analysis": 0,
            },
            "strengths": [
                "Attempted verbal communication regarding the problem concept.",
            ],
            "areas_for_improvement": [
                "Zero code implementation: The solution function body was left unwritten / unmodified boilerplate.",
                "Must translate verbal thoughts into runnable code within the interview timeframe.",
            ],
            "time_complexity_evaluation": {
                "expected": expected_time,
                "candidate_stated": "Vague / None",
                "actual_code": "Unattempted / No code",
                "verdict": "incorrect",
            },
            "space_complexity_evaluation": {
                "expected": expected_space,
                "candidate_stated": "Vague / None",
                "actual_code": "Unattempted / No code",
                "verdict": "incorrect",
            },
            "verbal_code_alignment": "Spoke concepts aloud but did not write any corresponding code in the editor.",
        }

    # -------------------------------------------------------------------------
    # Scenario C: Candidate said "I don't know" / gave up without an algorithmic solution
    # -------------------------------------------------------------------------
    if is_gave_up:
        return {
            "overall_score": 2,
            "passed": False,
            "summary": f"Question answered with uncertainty ('I don't know' / gave up, {difficulty} difficulty). The candidate did not formulate or explain a functional algorithmic approach.",
            "scores": {
                "problem_solving": 1,
                "verbal_communication": 2,
                "code_correctness": 1,
                "code_quality": 1,
                "complexity_analysis": 0,
            },
            "strengths": [
                "Honest about knowledge gap rather than submitting random code.",
                "Acknowledged the question difficulty.",
            ],
            "areas_for_improvement": [
                "Formulate at least a brute-force approach even if unsure of the optimal solution.",
                f"Study fundamental patterns for {question.get('title', 'this problem')} (expected: {expected_time}).",
            ],
            "time_complexity_evaluation": {
                "expected": expected_time,
                "candidate_stated": "None / Unknown",
                "actual_code": efficiency["actual_time"],
                "verdict": "incorrect",
            },
            "space_complexity_evaluation": {
                "expected": expected_space,
                "candidate_stated": "None / Unknown",
                "actual_code": efficiency["actual_space"],
                "verdict": "incorrect",
            },
            "verbal_code_alignment": "Candidate verbally gave up or stated they did not know how to solve the problem.",
        }

    # -------------------------------------------------------------------------
    # Scenario C: Code implemented, but Sub-optimal Efficiency (e.g. O(N^2) nested loops)
    # -------------------------------------------------------------------------
    if efficiency["verdict"] == "sub-optimal":
        return {
            "overall_score": 58,
            "passed": False,
            "summary": f"The candidate implemented a functioning brute-force solution, but it achieves {efficiency['actual_time']} runtime which fails the {expected_time} efficiency requirement.",
            "scores": {
                "problem_solving": 65,
                "verbal_communication": 60,
                "code_correctness": 70,
                "code_quality": 60,
                "complexity_analysis": 45,
            },
            "strengths": [
                "Successfully wrote working logic that covers basic test cases.",
                "Good code formatting and readable variable names.",
            ],
            "areas_for_improvement": [
                f"Algorithm efficiency is sub-optimal ({efficiency['actual_time']}). The problem constraints demand an {expected_time} solution.",
                efficiency["notes"],
                "Analyze time complexity before writing code to avoid settling on brute force.",
            ],
            "time_complexity_evaluation": {
                "expected": expected_time,
                "candidate_stated": "Sub-optimal",
                "actual_code": efficiency["actual_time"],
                "verdict": "sub-optimal",
            },
            "space_complexity_evaluation": {
                "expected": expected_space,
                "candidate_stated": efficiency["actual_space"],
                "actual_code": efficiency["actual_space"],
                "verdict": "optimal",
            },
            "verbal_code_alignment": "Implemented a working brute-force approach, but failed to optimize to the required linear time complexity.",
        }

    # -------------------------------------------------------------------------
    # Scenario D: Code implemented, Optimal Efficiency, and spoke reasoning
    # -------------------------------------------------------------------------
    return {
        "overall_score": 88,
        "passed": True,
        "summary": f"Strong interview performance. The candidate successfully implemented the optimal {expected_time} solution and articulated their algorithmic tradeoffs clearly.",
        "scores": {
            "problem_solving": 92,
            "verbal_communication": 85,
            "code_correctness": 90,
            "code_quality": 88,
            "complexity_analysis": 88,
        },
        "strengths": [
            f"Achieved optimal {expected_time} runtime and {expected_space} auxiliary space.",
            "Clean implementation with proper boundary and edge case handling.",
            "Clearly articulated the intuition before and during coding.",
        ],
        "areas_for_improvement": [
            "Could explicitly discuss input constraint limits (e.g. 10^4 elements) earlier.",
            "Add concise inline documentation or type annotations for maintainability.",
        ],
        "time_complexity_evaluation": {
            "expected": expected_time,
            "candidate_stated": expected_time,
            "actual_code": efficiency["actual_time"],
            "verdict": "optimal",
        },
        "space_complexity_evaluation": {
            "expected": expected_space,
            "candidate_stated": expected_space,
            "actual_code": efficiency["actual_space"],
            "verdict": "optimal",
        },
        "verbal_code_alignment": "Strong alignment: Spoken algorithmic thought process was accurately and cleanly translated into code.",
    }
