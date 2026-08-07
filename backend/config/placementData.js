// Placement preparation question bank + study tips.
//
// This is the single source of truth for the seeded practice questions. Every
// `correct` letter and `explanation` here has been verified — an educational
// feature must never teach a wrong answer.
//
// Each question: { category, topic, difficulty, question, options[A,B,C,D],
// correct: "A"|"B"|"C"|"D", explanation }.

const PLACEMENT_QUESTIONS = [
  // ---------- Quantitative Aptitude ----------
  {
    category: "Quantitative Aptitude",
    topic: "Time & Work",
    difficulty: "easy",
    question: "A can complete a task in 10 days and B in 15 days. Working together, how many days will they take?",
    optionA: "5",
    optionB: "6",
    optionC: "8",
    optionD: "12",
    correct: "B",
    explanation:
      "Combined one-day work = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. So together they finish in 6 days."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Percentages",
    difficulty: "easy",
    question: "A salary is first increased by 20% and then decreased by 20%. What is the net change?",
    optionA: "No change",
    optionB: "4% increase",
    optionC: "4% decrease",
    optionD: "2% decrease",
    correct: "C",
    explanation:
      "Net multiplier = 1.20 × 0.80 = 0.96, i.e. 96% of the original — a 4% decrease. Successive percentage changes do not cancel out."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Profit & Loss",
    difficulty: "easy",
    question: "An item bought for ₹400 is sold for ₹500. What is the profit percentage?",
    optionA: "20%",
    optionB: "25%",
    optionC: "15%",
    optionD: "100%",
    correct: "B",
    explanation:
      "Profit = 500 − 400 = ₹100. Profit % = (Profit / Cost Price) × 100 = (100 / 400) × 100 = 25%. Profit % is always taken on the cost price."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Speed, Time & Distance",
    difficulty: "medium",
    question: "A 120 m long train runs at 36 km/h. How long does it take to pass a stationary pole?",
    optionA: "10 s",
    optionB: "12 s",
    optionC: "15 s",
    optionD: "20 s",
    correct: "B",
    explanation:
      "36 km/h = 36 × 5/18 = 10 m/s. To pass a pole the train must cover its own length: 120 / 10 = 12 seconds."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Simple Interest",
    difficulty: "easy",
    question: "Find the simple interest on ₹1,000 at 5% per annum for 2 years.",
    optionA: "₹50",
    optionB: "₹100",
    optionC: "₹150",
    optionD: "₹200",
    correct: "B",
    explanation: "SI = (P × R × T) / 100 = (1000 × 5 × 2) / 100 = ₹100."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Ratio & Proportion",
    difficulty: "easy",
    question: "₹600 is divided between two people in the ratio 2 : 3. What is the larger share?",
    optionA: "₹240",
    optionB: "₹300",
    optionC: "₹360",
    optionD: "₹400",
    correct: "C",
    explanation: "Total parts = 2 + 3 = 5. Larger share = (3/5) × 600 = ₹360."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Probability",
    difficulty: "easy",
    question: "A fair six-sided die is rolled once. What is the probability of getting an even number?",
    optionA: "1/6",
    optionB: "1/3",
    optionC: "1/2",
    optionD: "2/3",
    correct: "C",
    explanation: "Even outcomes are {2, 4, 6} = 3 favourable out of 6 total → 3/6 = 1/2."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Number System",
    difficulty: "easy",
    question: "What is the HCF (greatest common divisor) of 12 and 18?",
    optionA: "2",
    optionB: "3",
    optionC: "6",
    optionD: "36",
    correct: "C",
    explanation: "12 = 2² × 3 and 18 = 2 × 3². The common factors give HCF = 2¹ × 3¹ = 6."
  },
  {
    category: "Quantitative Aptitude",
    topic: "Averages",
    difficulty: "easy",
    question: "What is the average of the first five natural numbers (1 to 5)?",
    optionA: "2.5",
    optionB: "3",
    optionC: "3.5",
    optionD: "5",
    correct: "B",
    explanation: "Sum = 1 + 2 + 3 + 4 + 5 = 15. Average = 15 / 5 = 3. (For 1..n the average is (n+1)/2.)"
  },
  {
    category: "Quantitative Aptitude",
    topic: "Permutations & Combinations",
    difficulty: "medium",
    question: "In how many distinct ways can the letters of the word 'CAT' be arranged?",
    optionA: "3",
    optionB: "6",
    optionC: "9",
    optionD: "27",
    correct: "B",
    explanation: "All three letters are distinct, so the number of arrangements = 3! = 3 × 2 × 1 = 6."
  },

  // ---------- Logical Reasoning ----------
  {
    category: "Logical Reasoning",
    topic: "Number Series",
    difficulty: "medium",
    question: "Find the next term in the series: 2, 6, 12, 20, 30, ?",
    optionA: "36",
    optionB: "40",
    optionC: "42",
    optionD: "44",
    correct: "C",
    explanation:
      "The differences are 4, 6, 8, 10 (increasing by 2). The next difference is 12, so 30 + 12 = 42. (Equivalently, the nth term is n² + n.)"
  },
  {
    category: "Logical Reasoning",
    topic: "Number Series",
    difficulty: "easy",
    question: "Find the next term in the series: 1, 4, 9, 16, 25, ?",
    optionA: "30",
    optionB: "36",
    optionC: "49",
    optionD: "35",
    correct: "B",
    explanation: "These are perfect squares: 1², 2², 3², 4², 5². The next term is 6² = 36."
  },
  {
    category: "Logical Reasoning",
    topic: "Odd One Out",
    difficulty: "easy",
    question: "Which number is the odd one out: 3, 5, 7, 9, 11?",
    optionA: "3",
    optionB: "7",
    optionC: "9",
    optionD: "11",
    correct: "C",
    explanation: "3, 5, 7 and 11 are prime numbers. 9 = 3 × 3 is composite, so it is the odd one out."
  },
  {
    category: "Logical Reasoning",
    topic: "Coding-Decoding",
    difficulty: "medium",
    question: "If 'CAT' is coded as 'DBU', how is 'DOG' coded?",
    optionA: "EPH",
    optionB: "EPG",
    optionC: "FQI",
    optionD: "CPF",
    correct: "A",
    explanation: "Each letter is shifted forward by one (C→D, A→B, T→U). Applying the same shift: D→E, O→P, G→H gives 'EPH'."
  },
  {
    category: "Logical Reasoning",
    topic: "Blood Relations",
    difficulty: "hard",
    question: "Pointing to a man, a woman said, 'He is the son of the only son of my grandfather.' How is the man related to the woman?",
    optionA: "Father",
    optionB: "Brother",
    optionC: "Uncle",
    optionD: "Cousin",
    correct: "B",
    explanation:
      "Her grandfather's only son is her own father. The son of her father is her brother, so the man is her brother."
  },
  {
    category: "Logical Reasoning",
    topic: "Direction Sense",
    difficulty: "medium",
    question: "A man walks 3 km north, then turns and walks 4 km east. How far is he from his starting point?",
    optionA: "5 km",
    optionB: "7 km",
    optionC: "1 km",
    optionD: "12 km",
    correct: "A",
    explanation: "North and east are perpendicular, so the straight-line distance = √(3² + 4²) = √25 = 5 km."
  },
  {
    category: "Logical Reasoning",
    topic: "Letter Series",
    difficulty: "easy",
    question: "Find the next term in the series: A, C, E, G, ?",
    optionA: "H",
    optionB: "I",
    optionC: "J",
    optionD: "K",
    correct: "B",
    explanation: "The pattern skips one letter each time (A → C → E → G), so the next letter is I."
  },

  // ---------- Verbal Ability ----------
  {
    category: "Verbal Ability",
    topic: "Synonyms",
    difficulty: "easy",
    question: "Choose the word most similar in meaning to 'ABUNDANT'.",
    optionA: "Scarce",
    optionB: "Plentiful",
    optionC: "Empty",
    optionD: "Tiny",
    correct: "B",
    explanation: "'Abundant' means existing in large quantity, i.e. 'plentiful'. 'Scarce' is its antonym."
  },
  {
    category: "Verbal Ability",
    topic: "Antonyms",
    difficulty: "medium",
    question: "Choose the word most opposite in meaning to 'BENEVOLENT'.",
    optionA: "Kind",
    optionB: "Generous",
    optionC: "Cruel",
    optionD: "Gentle",
    correct: "C",
    explanation: "'Benevolent' means kind and well-meaning. Its opposite is 'cruel'. The other options are near-synonyms."
  },
  {
    category: "Verbal Ability",
    topic: "Grammar",
    difficulty: "easy",
    question: "Choose the grammatically correct sentence.",
    optionA: "He don't like tea.",
    optionB: "He doesn't likes tea.",
    optionC: "He doesn't like tea.",
    optionD: "He not like tea.",
    correct: "C",
    explanation:
      "With a third-person singular subject ('He'), use 'doesn't' followed by the base verb 'like': 'He doesn't like tea.'"
  },
  {
    category: "Verbal Ability",
    topic: "Vocabulary",
    difficulty: "easy",
    question: "Choose the single word for 'a person who cannot read or write'.",
    optionA: "Illiterate",
    optionB: "Ignorant",
    optionC: "Innocent",
    optionD: "Illegible",
    correct: "A",
    explanation: "'Illiterate' means unable to read or write. 'Illegible' describes handwriting that cannot be read."
  },
  {
    category: "Verbal Ability",
    topic: "Synonyms",
    difficulty: "medium",
    question: "Choose the word most similar in meaning to 'CANDID'.",
    optionA: "Dishonest",
    optionB: "Frank",
    optionC: "Shy",
    optionD: "Rude",
    correct: "B",
    explanation: "'Candid' means open and honest in expression, i.e. 'frank'."
  },

  // ---------- Computer Science ----------
  {
    category: "Computer Science",
    topic: "Data Structures & Algorithms",
    difficulty: "easy",
    question: "What is the time complexity of binary search on a sorted array of n elements?",
    optionA: "O(n)",
    optionB: "O(log n)",
    optionC: "O(n log n)",
    optionD: "O(1)",
    correct: "B",
    explanation:
      "Binary search halves the remaining search space on each comparison, giving O(log n). It requires the array to be sorted."
  },
  {
    category: "Computer Science",
    topic: "Data Structures",
    difficulty: "easy",
    question: "Which data structure follows the Last-In-First-Out (LIFO) principle?",
    optionA: "Queue",
    optionB: "Stack",
    optionC: "Linked List",
    optionD: "Tree",
    correct: "B",
    explanation: "A stack pushes and pops from the same end (the top), so the last element added is the first removed (LIFO)."
  },
  {
    category: "Computer Science",
    topic: "Data Structures",
    difficulty: "easy",
    question: "Which data structure follows the First-In-First-Out (FIFO) principle?",
    optionA: "Stack",
    optionB: "Queue",
    optionC: "Heap",
    optionD: "Graph",
    correct: "B",
    explanation: "A queue inserts at the rear and removes from the front, so the first element added is the first removed (FIFO)."
  },
  {
    category: "Computer Science",
    topic: "DBMS",
    difficulty: "medium",
    question: "Which statement about a PRIMARY KEY is correct?",
    optionA: "It can contain NULL values",
    optionB: "A table can have many primary keys",
    optionC: "It uniquely identifies each row and cannot be NULL",
    optionD: "It must always be a single integer column",
    correct: "C",
    explanation:
      "A primary key uniquely identifies each row and cannot be NULL. A table has exactly one primary key (which may span multiple columns)."
  },
  {
    category: "Computer Science",
    topic: "Operating Systems",
    difficulty: "hard",
    question: "Which of the following is NOT one of the four necessary conditions for a deadlock?",
    optionA: "Mutual exclusion",
    optionB: "Hold and wait",
    optionC: "Preemption",
    optionD: "Circular wait",
    correct: "C",
    explanation:
      "The four Coffman conditions are mutual exclusion, hold-and-wait, NO preemption, and circular wait. Allowing preemption actually helps prevent deadlock, so 'preemption' is not a deadlock condition."
  },
  {
    category: "Computer Science",
    topic: "OOP",
    difficulty: "medium",
    question: "Which OOP feature lets a subclass provide its own implementation of a method already defined in its superclass?",
    optionA: "Encapsulation",
    optionB: "Method overriding",
    optionC: "Abstraction",
    optionD: "Method overloading",
    correct: "B",
    explanation:
      "Method overriding redefines an inherited method in the subclass (runtime polymorphism). Overloading is having multiple methods with the same name but different parameter lists."
  },
  {
    category: "Computer Science",
    topic: "Computer Networks",
    difficulty: "medium",
    question: "Which OSI layer is primarily responsible for routing packets between different networks?",
    optionA: "Data Link layer",
    optionB: "Network layer",
    optionC: "Transport layer",
    optionD: "Session layer",
    correct: "B",
    explanation:
      "Layer 3 — the Network layer (e.g. IP) — handles logical addressing and routing between networks. The Data Link layer handles delivery within a single network."
  },
  {
    category: "Computer Science",
    topic: "SQL",
    difficulty: "medium",
    question: "Which SQL command removes all rows from a table quickly while keeping the table structure intact?",
    optionA: "DELETE",
    optionB: "DROP",
    optionC: "TRUNCATE",
    optionD: "REMOVE",
    correct: "C",
    explanation:
      "TRUNCATE quickly removes all rows and keeps the table structure. DELETE logs each row removal (slower and can be filtered with WHERE), while DROP deletes the entire table."
  },

  // ---------- Programming ----------
  {
    category: "Programming",
    topic: "JavaScript",
    difficulty: "easy",
    question: "In JavaScript, which keyword declares a block-scoped variable that cannot be reassigned?",
    optionA: "var",
    optionB: "let",
    optionC: "const",
    optionD: "static",
    correct: "C",
    explanation:
      "'const' is block-scoped and cannot be reassigned. 'let' is block-scoped but reassignable, and 'var' is function-scoped."
  },
  {
    category: "Programming",
    topic: "Sorting Algorithms",
    difficulty: "hard",
    question: "What is the worst-case time complexity of QuickSort?",
    optionA: "O(n)",
    optionB: "O(n log n)",
    optionC: "O(n²)",
    optionD: "O(log n)",
    correct: "C",
    explanation:
      "With a poor pivot choice (e.g. an already-sorted input with a naive pivot) the partitions are maximally unbalanced, giving O(n²). The average case is O(n log n)."
  },
  {
    category: "Programming",
    topic: "Web Fundamentals",
    difficulty: "easy",
    question: "What does 'HTML' stand for?",
    optionA: "HyperText Markup Language",
    optionB: "HighText Machine Language",
    optionC: "HyperText Markdown Language",
    optionD: "Home Tool Markup Language",
    correct: "A",
    explanation: "HTML stands for HyperText Markup Language, the standard markup language used to structure web pages."
  },
  {
    category: "Programming",
    topic: "Databases",
    difficulty: "easy",
    question: "Which of the following is a NoSQL (document) database?",
    optionA: "MySQL",
    optionB: "PostgreSQL",
    optionC: "MongoDB",
    optionD: "Oracle",
    correct: "C",
    explanation: "MongoDB stores JSON-like documents and is a NoSQL database. MySQL, PostgreSQL and Oracle are relational (SQL) databases."
  }
];

// Per-topic actionable study tips, surfaced in feedback when a student is weak
// in that topic. Every topic used above has an entry here.
const TOPIC_TIPS = {
  "Time & Work": "Use the rate method: combined rate = 1/a + 1/b; total time is the reciprocal of the summed rates.",
  Percentages: "Convert percentages to multipliers (×1.2, ×0.8). Successive changes multiply — they don't add.",
  "Profit & Loss": "Profit% and Loss% are always computed on the Cost Price unless the question says otherwise.",
  "Speed, Time & Distance": "Convert km/h to m/s with ×5/18. To cross a pole, distance = the object's own length.",
  "Simple Interest": "SI = P×R×T/100. Keep the rate and time in matching units (per annum with years).",
  "Ratio & Proportion": "Add the ratio parts to get the total, then take the required fraction of the whole amount.",
  Probability: "Probability = favourable outcomes / total outcomes, and the value always lies between 0 and 1.",
  "Number System": "Use prime factorisation: HCF takes the lowest powers of common primes, LCM the highest.",
  Averages: "Average = sum of values / count. The average of 1..n is (n+1)/2.",
  "Permutations & Combinations": "Arrangements of distinct items = n!; divide by factorials of repeated items.",
  "Number Series": "Check first differences, ratios, and squares/cubes to identify the underlying pattern.",
  "Odd One Out": "Find the property shared by most items (prime, square, even); the exception breaks that rule.",
  "Coding-Decoding": "Map letters to positions (A=1 … Z=26) and look for a constant forward/backward shift.",
  "Blood Relations": "Draw a small family tree and resolve the sentence from the innermost clause outward.",
  "Direction Sense": "Sketch the path; perpendicular legs form a right triangle, so use the Pythagorean theorem.",
  "Letter Series": "Track the gap between consecutive letters using their alphabet positions.",
  Synonyms: "Learn words in context and group similar-meaning words together; read widely.",
  Antonyms: "Study words in opposite pairs and watch prefixes such as 'bene-', 'mal-', 'in-', 'un-'.",
  Grammar: "Match subject and verb: a third-person singular subject takes 'does/doesn't' + the base verb.",
  Vocabulary: "Maintain a one-word-substitution list and separate look-alike words (illegible vs illiterate).",
  "Data Structures & Algorithms": "Memorise the time and space complexity of common search, sort, and traversal operations.",
  "Data Structures": "Match the structure to the access pattern: LIFO → stack, FIFO → queue.",
  DBMS: "Master keys, normalisation (1NF–3NF), and the differences between DELETE, TRUNCATE and DROP.",
  "Operating Systems": "Revise the four Coffman deadlock conditions and the common CPU scheduling algorithms.",
  OOP: "Be able to explain the four pillars with examples: abstraction, encapsulation, inheritance, polymorphism.",
  "Computer Networks": "Memorise the OSI layers and which protocol or responsibility lives at each layer.",
  SQL: "Practise JOINs, GROUP BY, and the DELETE vs TRUNCATE vs DROP distinction.",
  JavaScript: "Understand var/let/const scoping, hoisting, and the difference between == and ===.",
  "Sorting Algorithms": "Compare the best/average/worst-case complexity and stability of each sorting algorithm.",
  "Web Fundamentals": "Know the roles of HTML, CSS and JavaScript and the basic request–response cycle.",
  Databases: "Know when to choose SQL vs NoSQL based on the data's schema and scaling needs."
};

module.exports = { PLACEMENT_QUESTIONS, TOPIC_TIPS };
