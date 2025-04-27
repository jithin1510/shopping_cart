const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       required:
 *         - userId
 *         - sessionId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user
 *         userName:
 *           type: string
 *           description: Name of the user
 *         sessionId:
 *           type: string
 *           description: Unique session identifier
 *         createdAt:
 *           type: date
 *           description: Session creation timestamp
 *         expiresAt:
 *           type: date
 *           description: Session expiration timestamp
 */
const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Index to automatically expire sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', SessionSchema);