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

    # Part C: Test Blank Code + "I don't know" Transcript (Easy, Medium, Hard)
    print("\n" + "-" * 60)
    print("❌ (3) Testing Strict 0-5 Scoring for Unattempted / 'I don't know' across Difficulties...")
    
    # Test C1: Easy problem (two-sum) with blank starter code and "I don't know"
    starter_code = "def twoSum(nums: list[int], target: int) -> list[int]:\n    # TODO: Speak your approach out loud first\n    pass\n"
    giveup_transcript = "I don't know how to do this. I'm totally stuck."
    giveup_review = await evaluate_submission(
        question_id="two-sum",
        transcript=giveup_transcript,
        code=starter_code,
        language="python",
    )
    print("\n[Easy Problem Review - Unattempted & 'I don't know']:")
    print(f"Overall Score: {giveup_review['overall_score']}, Passed: {giveup_review['passed']}, Subscores: {giveup_review['scores']}")
    assert 0 <= giveup_review["overall_score"] <= 5, f"Easy unattempted score must be 0-5, got {giveup_review['overall_score']}"
    assert giveup_review["passed"] == False, "Candidate should NOT pass with blank code and give up"
    for cat, sc in giveup_review["scores"].items():
        assert 0 <= sc <= 5, f"Subscore {cat} must be 0-5, got {sc}"

    # Test C2: Medium problem (lru-cache) with blank code
    med_starter = "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n"
    med_review = await evaluate_submission(
        question_id="lru-cache",
        transcript="I am thinking about using something but I am not sure.",
        code=med_starter,
        language="python",
    )
    print("\n[Medium Problem Review - Unattempted Code]:")
    print(f"Overall Score: {med_review['overall_score']}, Passed: {med_review['passed']}, Subscores: {med_review['scores']}")
    assert 0 <= med_review["overall_score"] <= 5, f"Medium unattempted score must be 0-5, got {med_review['overall_score']}"
    assert med_review["passed"] == False, "Medium unattempted should fail"
    for cat, sc in med_review["scores"].items():
        assert 0 <= sc <= 5, f"Subscore {cat} must be 0-5, got {sc}"

    # Test C3: Hard problem (trapping-rain-water) with 'I don't know' speech
    hard_starter = "def trap(height: list[int]) -> int:\n    pass\n"
    hard_review = await evaluate_submission(
        question_id="trapping-rain-water",
        transcript="I have no idea how to solve trapping rain water. I don't know.",
        code=hard_starter,
        language="python",
    )
    print("\n[Hard Problem Review - 'I don't know' Answer]:")
    print(f"Overall Score: {hard_review['overall_score']}, Passed: {hard_review['passed']}, Subscores: {hard_review['scores']}")
    assert 0 <= hard_review["overall_score"] <= 5, f"Hard unattempted/'I don't know' score must be 0-5, got {hard_review['overall_score']}"
    assert hard_review["passed"] == False, "Hard give-up should fail"
    for cat, sc in hard_review["scores"].items():
        assert 0 <= sc <= 5, f"Subscore {cat} must be 0-5, got {sc}"

    print("✅ Strict 0-5 penalty for unattempted / 'I don't know' across Easy, Mid, Hard PASSED!")

    # Part D: Test Sub-optimal Brute Force Efficiency (O(N^2) nested loops)
    print("\n" + "-" * 60)
    print("⚠️ (4) Testing Sub-optimal Brute Force Code (O(N^2) Nested Loops)...")
    bruteforce_code = """def twoSum(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
"""
    brute_review = await evaluate_submission(
        question_id=question_id,
        transcript="I can check every pair using two nested loops.",
        code=bruteforce_code,
        language="python",
    )
    print("\n Received Evaluation for Brute Force Code:")
    print(json.dumps(brute_review, indent=2))
    assert brute_review["time_complexity_evaluation"]["verdict"] == "sub-optimal", "Nested loops should be flagged sub-optimal"
    assert brute_review["passed"] == False, "Brute force should not pass linear time requirement"
    print("✅ Efficiency penalty for sub-optimal code verification PASSED!")

    print("\n" + "=" * 65)
    print("🎉 All Interviewer & 0-5 Strict Scoring Tests Passed Successfully!")
    return True

if __name__ == "__main__":
    success = asyncio.run(run_interviewer_test())
    sys.exit(0 if success else 1)
