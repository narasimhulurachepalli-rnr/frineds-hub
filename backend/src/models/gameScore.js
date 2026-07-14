import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameName: {
      type: String,
      required: true,
      enum: ['TicTacToe', 'Snake', 'RockPaperScissors', 'MemoryCard', 'NumberGuess', 'Quiz', 'TypingSpeed'],
    },
    score: {
      type: Number,
      required: true,
    },
    won: {
      type: Boolean,
      default: false,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GameScore = mongoose.model('GameScore', gameScoreSchema);
export default GameScore;
