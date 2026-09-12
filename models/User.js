const mongoose = require('mongoose');

/**
 * User Schema
 *
 * Stores user profile information.
 * Each user is linked to a Firebase account via `firebaseUid`.
 * The `firebaseUid` field is unique — one Firebase account = one profile.
 */
const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true, // Ensures one profile per Firebase account
      index: true,  // Makes lookups by Firebase UID fast
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
      maxlength: [200, 'College name cannot exceed 200 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [200, 'Department name cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Transform the document when converting to JSON.
 * This renames `_id` to `id` and removes internal fields from API responses.
 */
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.firebaseUid; // Don't expose Firebase UID in API responses
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);