const mongoose = require('mongoose');

/**
 * Registration Schema
 *
 * Records which user registered for which event.
 * The compound index on (eventId + userId) prevents duplicate registrations.
 */
const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event', // References the Event model
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  }
);

/**
 * Compound unique index: same user cannot register for the same event twice.
 * This is the DATABASE-LEVEL guarantee against duplicates.
 */
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

/**
 * Transform JSON output.
 */
registrationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Registration', registrationSchema);