import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Поле обязательно
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true // Поле обязательно
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
);
export default mongoose.model("Comment", CommentSchema);