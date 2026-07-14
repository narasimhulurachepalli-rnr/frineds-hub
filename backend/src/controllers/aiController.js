// Simulated Premium AI Advisor (FriendBot)
// Easily upgradeable to a real LLM API (e.g. Gemini, OpenAI) by dropping in an API client.

const generateAIResponse = (prompt, type) => {
  const query = prompt.toLowerCase();
  
  if (type === 'resume' || query.includes('resume') || query.includes('cv')) {
    return `### 📄 FriendHub Resume Reviewer Analysis
    
Thank you for uploading your resume outline! Here is my detailed critique:

1. **Header & Contact Info**: Ensure your GitHub, LinkedIn, and FriendHub portfolios are clickable and professional.
2. **Professional Summary**: Add a 3-sentence elevator pitch emphasizing *business impact* rather than just list of tasks.
3. **Experience Bullet Points (CRITICAL)**: Use the **XYZ formula** ("Accomplished [X] as measured by [Y], by doing [Z]"). For example: 
   * *Before*: "Helped build a React chat app."
   * *After*: "Spearheaded React group-chat migration, boosting message delivery speeds by **40%** and handling **1,000+** concurrent socket actions."
4. **Key Recommendations**:
   * Group your tech skills logically: Languages, Frameworks, Developer Tools, Databases.
   * Remove fluff skills like "Hardworking" or "Punctual"; let your projects prove those traits.
   
*Verdict: 7.5/10. Implement these items to hit a solid 9.5!*`;
  }

  if (type === 'grammar' || query.includes('grammar') || query.includes('correct') || query.includes('spell')) {
    return `### ✍️ FriendHub Grammar Checker
    
I scanned your text. Here is the suggested rewrite:

**Original**:
*"me and my friend is building a social platform because we wanted to share notes and playing games."*

**Recommended Polish**:
*"My friends and I are building a social platform because we want to share notes and play games."*

**Breakdown of Corrections**:
1. Changed *"me and my friend"* to *"My friends and I"* (polite subject order).
2. Changed *"is building"* to *"are building"* (plural subject-verb agreement).
3. Changed *"wanted"* to *"want"* (aligned tense).
4. Changed *"playing"* to *"play"* (parallel structure matching *to share*).`;
  }

  if (type === 'code-explain' || query.includes('explain') || query.includes('how does') || query.includes('code snippet')) {
    return `### 💻 FriendHub Code Explainer

Let's demystify how **JavaScript Closures** work in a premium private app setting:

A closure is a function that remembers its outer variables even after the outer function has finished executing.

\`\`\`javascript
function createLoginTracker(username) {
  let loginCount = 0; // Private variable!
  
  return function() {
    loginCount++;
    return \`User \${username} has logged in \${loginCount} times today!\`;
  };
}

const trackSiva = createLoginTracker('Siva');
console.log(trackSiva()); // "User Siva has logged in 1 times today!"
console.log(trackSiva()); // "User Siva has logged in 2 times today!"
\`\`\`

#### Key Takeaways:
1. **Encapsulation**: The variable \`loginCount\` is protected from outside manipulation.
2. **Persistent State**: The inner function maintains reference to the scope chain of \`createLoginTracker\`.`;
  }

  if (type === 'interview' || query.includes('interview') || query.includes('question') || query.includes('placement')) {
    return `### 💡 Technical Interview Simulator

Here are 3 high-probability interview questions for companies like Amazon, Microsoft, and tech startups:

1. **Frontend (React)**: *"How does the virtual DOM reconciliation algorithm differ between React 17 and React 18 Concurrent Features?"*
   * *Hint*: React 18 uses fiber trees to enable yielding execution, separating urgent updates from non-urgent transitions.
   
2. **Backend (System Design)**: *"How would you design a scalable seen-receipts database model for 10 million active group chats?"*
   * *Hint*: Do not update DB writes on every scroll. Keep a Redis cache of last-read offsets per user, and batch persist to MongoDB lazily.
   
3. **Data Structures (Algorithms)**: *"Given an array of login logs, find the longest consecutive streak of daily logins in O(N) time and O(N) space."*
   * *Hint*: Put all dates in a Hash Set and look for sequence starters (\`date - 1 day\` not present).`;
  }

  // Default chatbot query responder
  return `### 👋 Hello Friend! I'm FriendBot, your AI Assistant

I am connected to the FriendHub workspace. How can I help you today?

**I can assist with**:
* 📄 **Resume Review**: type *"review my resume..."*
* ✍️ **Grammar Checker**: type *"check this grammar..."*
* 💻 **Code Explainer**: type *"explain this code snippet..."*
* 💡 **Interview Prep**: type *"interview questions for placement..."*

Tell me what you are working on, and let's get it done!`;
};

// @desc    Post prompt to AI Corner
// @route   POST /api/ai/ask
// @access  Private
export const askAI = async (req, res) => {
  const { prompt, type } = req.body; // type can be 'general', 'resume', 'grammar', 'code-explain', 'interview'

  try {
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Artificial delay to simulate thinking for premium user experience
    setTimeout(() => {
      const responseText = generateAIResponse(prompt, type);
      res.json({ response: responseText });
    }, 800);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
