import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      set: tags => tags
        .map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '')
        .filter(tag => tag !== ''),
      index: true // Добавляем индекс
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0, // По умолчанию 0 лайков
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    content: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
    imageUrl: String,
    
  },
  {
    timestamps: true,
  },
);


export default mongoose.model('Post', PostSchema);