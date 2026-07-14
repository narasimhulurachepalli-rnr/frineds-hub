import GameScore from '../models/gameScore.js';
import Message from '../models/message.js';
import File from '../models/file.js';
import Note from '../models/note.js';
import User from '../models/user.js';

// Pre-seeded quizzes
const dailyQuiz = {
  id: 'daily_quiz_1',
  title: 'Daily Trivia Challenge',
  type: 'daily',
  timeLimit: 60, // seconds
  questions: [
    {
      id: 'q1',
      question: 'Which programming language is commonly used as the style sheet for web pages?',
      options: ['HTML', 'Python', 'CSS', 'JavaScript'],
      correctAnswer: 2 // CSS
    },
    {
      id: 'q2',
      question: 'What does API stand for?',
      options: [
        'Application Programming Interface',
        'Automated Process Integration',
        'Algorithm Protocol Identifier',
        'Advanced Peripheral Link'
      ],
      correctAnswer: 0 // API
    },
    {
      id: 'q3',
      question: 'Which company developed JavaScript?',
      options: ['Netscape', 'Microsoft', 'Oracle', 'Sun Microsystems'],
      correctAnswer: 0
    }
  ]
};

const weeklyQuiz = {
  id: 'weekly_quiz_1',
  title: 'Weekly Tech & Pop Culture Quiz',
  type: 'weekly',
  timeLimit: 120, // seconds
  questions: [
    {
      id: 'wq1',
      question: 'In Git, what command downloads changes from a remote repository without merging them?',
      options: ['git pull', 'git fetch', 'git clone', 'git push'],
      correctAnswer: 1
    },
    {
      id: 'wq2',
      question: 'What is the speed of light in a vacuum?',
      options: ['~300,000 km/s', '3,000,000 m/s', '150,000 miles/s', '3,000 km/s'],
      correctAnswer: 0
    },
    {
      id: 'wq3',
      question: 'Which CSS property controls the spacing between grid items?',
      options: ['grid-gap', 'margin', 'padding', 'spacing'],
      correctAnswer: 0
    },
    {
      id: 'wq4',
      question: 'Which design pattern is used to restrict a class to only one instance?',
      options: ['Observer', 'Factory', 'Singleton', 'Prototype'],
      correctAnswer: 2
    }
  ]
};

// @desc    Submit a game score
// @route   POST /api/games/score
// @access  Private
export const saveGameScore = async (req, res) => {
  const { gameName, score, won } = req.body;

  try {
    const gameScore = await GameScore.create({
      user: req.user._id,
      gameName,
      score: parseInt(score),
      won: !!won,
    });

    // Check achievement for game playing
    if (won) {
      const winsCount = await GameScore.countDocuments({ user: req.user._id, won: true });
      if (winsCount === 5) {
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { achievements: 'Arcade King' }
        });
      }
    }

    res.status(201).json(gameScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active quizzes (Daily / Weekly)
// @route   GET /api/games/quizzes
// @access  Private
export const getQuizzes = (req, res) => {
  res.json({ daily: dailyQuiz, weekly: weeklyQuiz });
};

// @desc    Submit quiz answers and score points
// @route   POST /api/games/quiz/submit
// @access  Private
export const submitQuizAnswers = async (req, res) => {
  const { quizType, answers } = req.body; // answers: { questionId: selectedIndex }

  try {
    const quiz = quizType === 'weekly' ? weeklyQuiz : dailyQuiz;
    let correctCount = 0;
    
    quiz.questions.forEach((q) => {
      if (answers[q.id] !== undefined && answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const score = correctCount * 10; // 10 points per correct answer

    // Record quiz score
    const gameScore = await GameScore.create({
      user: req.user._id,
      gameName: 'Quiz',
      score: score,
      won: correctCount === quiz.questions.length,
    });

    // Award badge if score is perfect
    if (correctCount === quiz.questions.length) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { achievements: 'Brainiac' }
      });
    }

    res.json({
      correct: correctCount,
      total: quiz.questions.length,
      score: score,
      perfect: correctCount === quiz.questions.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get global leaderboard showing points breakdowns
// @route   GET /api/games/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select('username avatar loginStreak');
    
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        // 1. Quiz Score total
        const quizScores = await GameScore.find({ user: user._id, gameName: 'Quiz' });
        const quizTotal = quizScores.reduce((sum, item) => sum + item.score, 0);

        // 2. Chat messages count
        const chatCount = await Message.countDocuments({ sender: user._id });

        // 3. Upload count (Files + Notes)
        const fileCount = await File.countDocuments({ uploader: user._id });
        const noteCount = await Note.countDocuments({ author: user._id });
        const uploadsTotal = fileCount + noteCount;

        // 4. Games won count
        const gamesWon = await GameScore.countDocuments({ user: user._id, won: true });

        // Score formula: quizScore + streak*10 + chat*2 + uploads*15 + gamesWon*20
        const totalPoints = quizTotal + (user.loginStreak * 10) + (chatCount * 2) + (uploadsTotal * 15) + (gamesWon * 20);

        return {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          loginStreak: user.loginStreak,
          quizTotal,
          chatCount,
          uploadsTotal,
          gamesWon,
          totalPoints,
        };
      })
    );

    // Sort leaderboard by points descending
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    // Award "Friend of the Month" badge to rank 1 (if they have > 0 points)
    if (leaderboardData.length > 0 && leaderboardData[0].totalPoints > 0) {
      const topUserId = leaderboardData[0]._id;
      // Note: we can add badge dynamically on query
      await User.findByIdAndUpdate(topUserId, {
        $addToSet: { achievements: 'Friend of the Month' }
      });
    }

    res.json(leaderboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
