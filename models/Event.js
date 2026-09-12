const mongoose = require('mongoose');

/**
 * Event Schema
 *
 * Stores college event information.
 * `createdBy` references the User who created the event.
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Create indexes for frequently queried fields.
 * This makes filtering by college, category, and date faster.
 */
eventSchema.index({ college: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ title: 'text', description: 'text' }); // Text index for search

/**
 * Transform JSON output: rename _id to id, remove internal fields.
 */
eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model('Event', eventSchema);