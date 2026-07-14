import Poll from '../models/poll.js';
import Recommendation from '../models/recommendation.js';
import Notification from '../models/notification.js';

// Pre-seeded local arrays for jokes and truth/dare for reliability and offline speed.
const jokes = [
  "Why do programmers wear glasses? Because they can't C#!",
  "There are 10 kinds of people in this world: Those who understand binary, and those who don't.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
  "Why did the developer go broke? Because he used up all his cache.",
  "['hip', 'hip'] (hip hip array!)",
  "What is a developer's favorite hangout spot? Foo Bar.",
  "Why did the database administrator leave his wife? She had one-to-many relationships.",
  "To understand what recursion is, you must first understand what recursion is.",
  "An optimist says: 'The glass is half full.' A pessimist says: 'The glass is half empty.' A programmer says: 'The glass is twice as large as it needs to be.'"
];

const truths = [
  "What is the most embarrassing thing you have ever done in front of a crush?",
  "What is a secret you have never told anyone in this friend group?",
  "Who in this room would you survive with the longest in a zombie apocalypse?",
  "What is the worst lie you have ever told your parents?",
  "What is your biggest fear about the future?",
  "Have you ever stalked an ex on social media? Be honest!",
  "What is the weirdest dream you have ever had?",
  "If you had to change your name, what would you change it to?",
  "What is the most childish thing you still do?",
  "What is the biggest misconception people have about you?"
];

const dares = [
  "Send a message to your crush right now and send a screenshot to the group chat.",
  "Do 20 pushups right now while counting out loud.",
  "Post the most embarrassing selfie on your phone to your story or group chat.",
  "Call a random contact on your phone and sing them 'Happy Birthday'.",
  "Text your mom 'I got arrested' and don't reply for 2 minutes.",
  "Do a dramatic reading of the last text message you received.",
  "Talk in a foreign accent (e.g. British, French, Russian) for the next 10 minutes.",
  "Try to touch your nose with your tongue.",
  "Let the group chat dictate a message and send it to your boss/teacher.",
  "Dance like a crazy person without music for 1 full minute."
];

// --- POLLS ---

export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({}).populate('creator', 'username avatar').sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPoll = async (req, res) => {
  const { question, options, expiresDays } = req.body;

  try {
    const formattedOptions = options.map((opt) => ({ text: opt, votes: [] }));
    const expiresAt = expiresDays ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000) : null;

    const poll = await Poll.create({
      question,
      options: formattedOptions,
      creator: req.user._id,
      expiresAt,
    });

    const populated = await Poll.findById(poll._id).populate('creator', 'username avatar');

    // Notification broadcast
    const notification = await Notification.create({
      sender: req.user._id,
      type: 'poll_created',
      title: 'New Group Poll Created',
      message: `${req.user.username} started a new poll: "${question}"`,
      relatedId: poll._id,
    });

    if (req.io) {
      req.io.emit('notification', {
        ...notification.toJSON(),
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const votePoll = async (req, res) => {
  const { optionId } = req.body;
  const userId = req.user._id;

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check expiration
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      poll.isActive = false;
      await poll.save();
      return res.status(400).json({ message: 'Poll has expired' });
    }

    // Remove user's vote from all other options (single-choice voting)
    poll.options.forEach((option) => {
      option.votes = option.votes.filter((id) => id.toString() !== userId.toString());
    });

    // Add user's vote to the selected option
    const selectedOption = poll.options.id(optionId);
    if (selectedOption) {
      selectedOption.votes.push(userId);
    } else {
      return res.status(400).json({ message: 'Invalid option selected' });
    }

    await poll.save();
    const populated = await Poll.findById(poll._id).populate('creator', 'username avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.creator.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }

    await poll.deleteOne();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- TRIVIAL GENERATORS ---

export const getRandomJoke = (req, res) => {
  const randomIndex = Math.floor(Math.random() * jokes.length);
  res.json({ joke: jokes[randomIndex] });
};

export const getRandomTruthOrDare = (req, res) => {
  const { type } = req.query; // 'truth' or 'dare'
  
  if (type === 'truth') {
    const idx = Math.floor(Math.random() * truths.length);
    return res.json({ type: 'truth', prompt: truths[idx] });
  } else if (type === 'dare') {
    const idx = Math.floor(Math.random() * dares.length);
    return res.json({ type: 'dare', prompt: dares[idx] });
  }

  // Random selection
  const randType = Math.random() > 0.5 ? 'truth' : 'dare';
  const pool = randType === 'truth' ? truths : dares;
  const idx = Math.floor(Math.random() * pool.length);
  res.json({ type: randType, prompt: pool[idx] });
};

// --- RECOMMENDATIONS ---

export const getRecommendations = async (req, res) => {
  try {
    const { type } = req.query; // 'movie' or 'song'
    const query = {};
    if (type) query.type = type;

    const recs = await Recommendation.find(query)
      .populate('recommendedBy', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(recs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRecommendation = async (req, res) => {
  const { title, description, type, link } = req.body;

  try {
    const rec = await Recommendation.create({
      title,
      description: description || '',
      type,
      link: link || '',
      recommendedBy: req.user._id,
    });

    const populated = await Recommendation.findById(rec._id)
      .populate('recommendedBy', 'username avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLikeRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.findById(req.params.id);
    if (!rec) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const userId = req.user._id;
    const idx = rec.likes.indexOf(userId);

    if (idx > -1) {
      rec.likes.splice(idx, 1);
    } else {
      rec.likes.push(userId);
    }

    await rec.save();
    const populated = await Recommendation.findById(rec._id)
      .populate('recommendedBy', 'username avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.findById(req.params.id);
    if (!rec) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (rec.recommendedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    await rec.deleteOne();
    res.json({ message: 'Recommendation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
