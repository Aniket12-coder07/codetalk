import json

existing = json.load(open('backend/data/questions.json', 'r', encoding='utf-8'))

# Add companyTags to existing 14 questions
tags_map = {
    'two-sum': ['Google', 'Meta', 'Amazon', 'Microsoft'],
    'valid-parentheses': ['Amazon', 'Meta', 'Bloomberg', 'Microsoft'],
    'reverse-linked-list': ['Microsoft', 'Apple', 'Amazon', 'Google'],
    'longest-substring-without-repeating-characters': ['Amazon', 'Google', 'Meta', 'Bloomberg'],
    'search-in-rotated-sorted-array': ['Meta', 'Microsoft', 'Google', 'Amazon'],
    'number-of-islands': ['Amazon', 'Google', 'Bloomberg', 'Meta'],
    'coin-change': ['Amazon', 'ByteDance', 'Microsoft', 'Google'],
    'merge-intervals': ['Meta', 'Google', 'Amazon', 'Microsoft'],
    'top-k-frequent-elements': ['Amazon', 'Meta', 'Netflix', 'Uber'],
    'lowest-common-ancestor-of-a-binary-tree': ['Meta', 'Microsoft', 'Amazon', 'Apple'],
    'implement-trie': ['Google', 'Twitter', 'Amazon', 'Microsoft'],
    'trapping-rain-water': ['Google', 'Amazon', 'Meta', 'Goldman Sachs'],
    'merge-k-sorted-lists': ['Meta', 'Amazon', 'Google', 'Microsoft'],
    'lru-cache': ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple']
}

for q in existing:
    q['companyTags'] = tags_map.get(q['id'], ['FAANG'])

new_questions = [
    {
        'id': 'word-break',
        'title': 'Word Break',
        'difficulty': 'Medium',
        'difficultyColor': 'orange',
        'category': 'Dynamic Programming',
        'companyTags': ['Meta', 'Amazon', 'Apple', 'Bloomberg'],
        'description': 'Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.',
        'examples': [
            {
                'input': 's = "leetcode", wordDict = ["leet","code"]',
                'output': 'true',
                'explanation': 'Return true because "leetcode" can be segmented as "leet code".'
            },
            {
                'input': 's = "applepenapple", wordDict = ["apple","pen"]',
                'output': 'true',
                'explanation': 'Return true because "applepenapple" can be segmented as "apple pen apple". Note that words can be reused.'
            },
            {
                'input': 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]',
                'output': 'false',
                'explanation': 'Cannot segment "catsandog" into valid dictionary words.'
            }
        ],
        'constraints': [
            '1 <= s.length <= 300',
            '1 <= wordDict.length <= 1000',
            '1 <= wordDict[i].length <= 20',
            's and wordDict[i] consist of only lowercase English letters.',
            'All the strings of wordDict are unique.'
        ],
        'starterCode': {
            'python': 'def wordBreak(s: str, wordDict: list[str]) -> bool:\n    # Speak your approach: DP with boolean table dp[i] indicating if s[:i] can be segmented\n    pass\n',
            'javascript': 'function wordBreak(s, wordDict) {\n    // Speak your approach: DP or Trie with memoization\n    \n}\n'
        },
        'expectedComplexity': {
            'time': 'O(N^2 * M) or O(N * L^2)',
            'space': 'O(N + total word characters)'
        },
        'followUpQuestions': [
            'How would you return all possible sentences (Word Break II) rather than just a boolean?',
            'How does converting wordDict to a hash set optimize the inner substring check?',
            'Could a Trie data structure optimize prefix matching if word lengths vary greatly?'
        ],
        'rubric': {
            'clarification': 'Did the candidate clarify if dictionary words can be reused and if characters are lowercase?',
            'complexity_awareness': 'Did the candidate analyze the DP table size (N+1) and substring slicing cost O(L)?',
            'edge_cases': 'Addressed empty prefix, words that are prefixes of other words, and unmatchable suffixes?',
            'verbal_clarity': 'Did candidate verbally define state dp[i] as "can prefix of length i be segmented"?'
        }
    },
    {
        'id': 'course-schedule',
        'title': 'Course Schedule',
        'difficulty': 'Medium',
        'difficultyColor': 'orange',
        'category': 'Graphs & Topological Sort',
        'companyTags': ['Google', 'Amazon', 'Microsoft', 'Uber'],
        'description': 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.\n\nFor example, the pair `[0, 1]` indicates that to take course `0` you have to first take course `1`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.',
        'examples': [
            {
                'input': 'numCourses = 2, prerequisites = [[1,0]]',
                'output': 'true',
                'explanation': 'There are a total of 2 courses. To take course 1 you should have finished course 0. So it is possible.'
            },
            {
                'input': 'numCourses = 2, prerequisites = [[1,0],[0,1]]',
                'output': 'false',
                'explanation': 'There is a cycle between course 0 and course 1. Impossible to complete.'
            }
        ],
        'constraints': [
            '1 <= numCourses <= 2000',
            '0 <= prerequisites.length <= 5000',
            'prerequisites[i].length == 2',
            '0 <= a_i, b_i < numCourses',
            'All the pairs prerequisites[i] are unique.'
        ],
        'starterCode': {
            'python': "def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:\n    # Speak your approach: Cycle detection in directed graph using Kahn's Algorithm (in-degree BFS) or 3-color DFS\n    pass\n",
            'javascript': "function canFinish(numCourses, prerequisites) {\n    // Speak your approach: Kahn's algorithm or DFS cycle detection\n    \n}\n"
        },
        'expectedComplexity': {
            'time': 'O(V + E)',
            'space': 'O(V + E)'
        },
        'followUpQuestions': [
            'How would you return a valid course ordering if one exists (Course Schedule II)?',
            'What is the difference between detecting cycles in an undirected graph vs directed graph?',
            "Why is Kahn's algorithm (BFS with in-degree queue) often preferred over recursive DFS in production?"
        ],
        'rubric': {
            'clarification': 'Did the candidate clarify whether courses can be disconnected or have multiple dependencies?',
            'complexity_awareness': 'Did the candidate correctly identify graph vertices V and edges E in the O(V + E) runtime?',
            'edge_cases': 'Addressed no prerequisites, self-loops, and disconnected graph components?',
            'verbal_clarity': 'Did the candidate explain cycle detection clearly using either in-degrees or recursion stack state?'
        }
    },
    {
        'id': 'median-of-two-sorted-arrays',
        'title': 'Median of Two Sorted Arrays',
        'difficulty': 'Hard',
        'difficultyColor': 'red',
        'category': 'Binary Search',
        'companyTags': ['Google', 'Amazon', 'Apple', 'Microsoft'],
        'description': 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log(m + n))`.',
        'examples': [
            {
                'input': 'nums1 = [1,3], nums2 = [2]',
                'output': '2.00000',
                'explanation': 'Merged array = [1,2,3] and median is 2.'
            },
            {
                'input': 'nums1 = [1,2], nums2 = [3,4]',
                'output': '2.50000',
                'explanation': 'Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
            }
        ],
        'constraints': [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m <= 1000',
            '0 <= n <= 1000',
            '1 <= m + n <= 2000',
            '-10^6 <= nums1[i], nums2[i] <= 10^6'
        ],
        'starterCode': {
            'python': 'def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:\n    # Speak your approach: Binary search on the partition of the smaller array to achieve O(log(min(M,N)))\n    pass\n',
            'javascript': 'function findMedianSortedArrays(nums1, nums2) {\n    // Speak your approach: Binary search partition\n    \n}\n'
        },
        'expectedComplexity': {
            'time': 'O(log(min(M, N)))',
            'space': 'O(1)'
        },
        'followUpQuestions': [
            'Why does binary searching the smaller array guarantee O(log(min(M,N))) and avoid out-of-bounds indexing?',
            'How do you handle even total length versus odd total length when calculating the median?',
            'How would you adapt this binary search partition technique to find the k-th smallest element of two sorted arrays?'
        ],
        'rubric': {
            'clarification': 'Did the candidate clarify constraints on empty arrays and negative numbers?',
            'complexity_awareness': 'Did the candidate explicitly state that O(M + N) merge violates the required O(log(M+N)) constraint?',
            'edge_cases': 'Handled one empty array, arrays of unequal lengths, and partition at index 0 or N?',
            'verbal_clarity': 'Did the candidate clearly explain partitioning both arrays such that left halves equal right halves in count?'
        }
    },
    {
        'id': 'binary-tree-maximum-path-sum',
        'title': 'Binary Tree Maximum Path Sum',
        'difficulty': 'Hard',
        'difficultyColor': 'red',
        'category': 'Trees & DFS',
        'companyTags': ['Meta', 'Google', 'Uber', 'Amazon'],
        'description': "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.\n\nThe path sum of a path is the sum of the node's values in the path.\n\nGiven the `root` of a binary tree, return the maximum path sum of any non-empty path.",
        'examples': [
            {
                'input': 'root = [1,2,3]',
                'output': '6',
                'explanation': 'The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.'
            },
            {
                'input': 'root = [-10,9,20,null,null,15,7]',
                'output': '42',
                'explanation': 'The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.'
            }
        ],
        'constraints': [
            'The number of nodes in the tree is in the range [1, 3 * 10^4].',
            '-1000 <= Node.val <= 1000'
        ],
        'starterCode': {
            'python': '# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\ndef maxPathSum(root) -> int:\n    # Speak your approach: Post-order DFS returning max single-branch gain while updating global max with left + right + node.val\n    pass\n',
            'javascript': '/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\nfunction maxPathSum(root) {\n    // Speak your approach: Post-order traversal with max gain\n    \n}\n'
        },
        'expectedComplexity': {
            'time': 'O(N)',
            'space': 'O(H) where H is tree height'
        },
        'followUpQuestions': [
            'Why do we ignore negative path gains with max(0, gain)?',
            'What is the distinction between the path sum returned to a parent vs the candidate path sum passing through the current node?',
            'What is the worst-case space complexity for a skewed tree versus a balanced binary tree?'
        ],
        'rubric': {
            'clarification': 'Did the candidate clarify if node values can be negative, and whether the path must contain at least one node?',
            'complexity_awareness': 'Did the candidate recognize that each node is visited once in post-order O(N) time with O(H) recursion stack?',
            'edge_cases': 'Handled single node with negative value, all negative values, and zig-zag shaped paths?',
            'verbal_clarity': 'Did candidate verbally differentiate "gain extending up to parent" from "full path through current node"?'
        }
    }
]

existing_ids = {q['id'] for q in existing}
full_bank = list(existing)
for nq in new_questions:
    if nq['id'] not in existing_ids:
        full_bank.append(nq)

print(f'Total questions generated: {len(full_bank)}')

with open('backend/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(full_bank, f, indent=2)

with open('frontend/src/data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(full_bank, f, indent=2)

print('Successfully written questions to backend and frontend!')
