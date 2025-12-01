/**
 * Book Context Guard
 * Ensures AI only responds to queries related to the robotics book
 */

export function getBookSystemPrompt(): string {
  const bookName = process.env.BOOK_NAME || 'AI & Robotics Book';
  const bookTopics = process.env.BOOK_TOPICS ||
    'artificial intelligence, robotics, machine learning, computer vision, autonomous systems';

  return `You are an AI teaching assistant for the "${bookName}". Your ONLY purpose is to help students learn about topics covered in this book.

**Core Topics You Can Discuss:**
${bookTopics}

**Critical Rules:**
1. ONLY answer questions related to the book topics listed above
2. If a user asks about unrelated topics (politics, entertainment, general knowledge, coding help for non-robotics projects, etc.), politely redirect them
3. Keep responses educational, clear, and concise
4. Use analogies and examples to explain complex concepts
5. Encourage critical thinking by asking follow-up questions when appropriate

**Response Format for Off-Topic Questions:**
When users ask about topics NOT related to the book, respond with:

"I'm specifically designed to help with the AI & Robotics Book. That question falls outside the book's scope.

Here are some topics I can help you with:
• [Topic 1 from the book]
• [Topic 2 from the book]
• [Topic 3 from the book]

What would you like to learn about?"

**Your Teaching Style:**
- Be encouraging and patient
- Break down complex concepts into digestible pieces
- Use real-world robotics examples
- Ask clarifying questions if the student's question is vague
- Celebrate understanding and progress

Remember: You're a focused learning companion for THIS specific book. Stay on topic, be helpful, and guide students toward deeper understanding of AI and robotics.`;
}

/**
 * Analyzes if a user message is on-topic for the book
 * This is a simple heuristic-based approach
 * For production, you might want more sophisticated topic detection
 */
export function isOnTopic(message: string): boolean {
  const topicKeywords = [
    // AI/ML
    'artificial intelligence', 'machine learning', 'neural network', 'deep learning',
    'supervised', 'unsupervised', 'reinforcement learning', 'training', 'model',
    'algorithm', 'classification', 'regression', 'clustering',

    // Robotics
    'robot', 'robotics', 'autonomous', 'sensor', 'actuator', 'servo',
    'kinematics', 'dynamics', 'path planning', 'navigation', 'localization',
    'slam', 'odometry', 'control', 'pid', 'feedback',

    // Computer Vision
    'computer vision', 'image processing', 'opencv', 'detection', 'recognition',
    'camera', 'lidar', 'perception',

    // General technical
    'how does', 'what is', 'explain', 'difference between', 'compare',
  ];

  const lowercaseMessage = message.toLowerCase();

  // Check if message contains any relevant keywords
  const hasRelevantKeywords = topicKeywords.some(keyword =>
    lowercaseMessage.includes(keyword)
  );

  // Off-topic patterns that should trigger redirect
  const offTopicPatterns = [
    /write.*code/i,
    /build.*website/i,
    /recipe/i,
    /weather/i,
    /stock.*market/i,
    /political/i,
    /celebrity/i,
    /movie/i,
    /game/i,
  ];

  const hasOffTopicPatterns = offTopicPatterns.some(pattern =>
    pattern.test(message)
  );

  // If clearly off-topic, return false
  if (hasOffTopicPatterns && !hasRelevantKeywords) {
    return false;
  }

  // For now, be permissive - let the AI system prompt handle boundary cases
  // This prevents false negatives where legitimate questions get blocked
  return true;
}
