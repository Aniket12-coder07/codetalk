"""
Standalone Verification Script for Step 3:
Tests the LangChain + Claude Interviewer module independently with plain text input.
Verifies reasoning evaluation, follow-up question generation, and code review.
"""

import sys
import os
import json
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.interviewer import generate_followup, evaluate_submission

async def run_interviewer_test():
    print("\n🧠 Testing CodeTalk LangChain + Claude Interviewer Module")
    print("=" * 65)

    question_id = "two-sum"
    sample_transcript = (
        "So for Two Sum, the brute-force approach would be using two nested loops to check every pair, "
        "which would take O(N squared) time. To optimize this, I can use a hash map where the key is the "
        "number and the value is its index. As I iterate through the array once, I calculate the complement "
        "as target minus the current number. If the complement is already in the hash map, I return both indices. "
        "This brings down the time complexity to O(N) with O(N) space complexity."
    )

    sample_code = """def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
"""

    print(f"📋 Question ID: {question_id}")
    print("\n🎙️ Sample Verbal Reasoning Transcript:")
    print(f"\"{sample_transcript}\"")

    # Part A: Test Follow-up Question Generation
    print("\n" + "-" * 60)
    print("🤖 (1) Testing Verbal Reasoning Critique & Follow-up Generation...")
    followup = await generate_followup(
        question_id=question_id,
        transcript=sample_transcript,
        code=None,
    )

    print("\n Received Follow-up Output:")
    print(json.dumps(followup, indent=2))

    assert "followup_question" in followup, "Missing followup_question in response"
    assert "stage" in followup, "Missing stage in response"
    print(" Verbal Reasoning & Follow-up verification PASSED!")

    # Part B: Test Final Code & Verbal Alignment Review
    print("\n" + "-" * 60)
    print("📝 (2) Testing Code Submission & Verbal Alignment Evaluation...")
    review = await evaluate_submission(
        question_id=question_id,
        transcript=sample_transcript,
        code=sample_code,
        language="python",
    )

    print("\n Received Evaluation Report:")
    print(json.dumps(review, indent=2))

    assert "overall_score" in review, "Missing overall_score in response"
    assert "scores" in review, "Missing scores in response"
    assert "time_complexity_evaluation" in review, "Missing time_complexity_evaluation"
    print(" Final Review & Verbal Alignment verification PASSED!")

    print("\n" + "=" * 65)
    print(" All Step 3 Interviewer Tests Passed Successfully!")
    return True

if __name__ == "__main__":
    success = asyncio.run(run_interviewer_test())
    sys.exit(0 if success else 1)
