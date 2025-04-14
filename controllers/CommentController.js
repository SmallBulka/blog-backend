import CommentModal from "../models/Comment.js"; // Импортируем модель комментария
import PostModal from "../models/Post.js";
import express from "express";
const app = express();
const router = express.Router();


// GET /posts/:postId/comments - Получение всех комментариев для поста
// app.get('/', async (req, res) => {
//   try {
//     const { postId } = req.params;
    
//     const comments = await CommentModal.find({ post: postId })
//       .populate('user', 'username avatarUrl') // Заполняем данные пользователя
//       .sort({ createdAt: -1 }); // Сортируем по дате (новые сначала)
    
//     res.json(comments);
//   } catch (error) {
//     console.error('Ошибка получения комментариев:', error);
//     res.status(500).json({ error: 'Ошибка сервера при получении комментариев' });
//   }
// });

// // POST /posts/:postId/comments - Создание нового комментария
// app.post('/',  async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const { text } = req.body; // Получаем текст из тела запроса
//     const userId = req.user.id; // Получаем ID пользователя из middleware аутентификации

//     if (!text || text.trim() === '') {
//       return res.status(400).json({ error: 'Текст комментария не может быть пустым' });
//     }

//     // Создаем новый комментарий
//     const newComment = new Comment({
//       text,
//       post: postId,
//       user: userId
//     });

//     // Сохраняем в базу данных
//     await newComment.save();
    
//     // Возвращаем созданный комментарий с данными пользователя
//     const populatedComment = await CommentModal.findById(newComment._id)
//       .populate('user', 'username avatarUrl');
    
//     res.status(201).json(populatedComment);
//   } catch (error) {
//     console.error('Ошибка создания комментария:', error);
//     res.status(500).json({ error: 'Ошибка сервера при создании комментария' });
//   }
// });

// export const getCommentsByPost = async (req, res) => {
//   try {
//     const { postId } = req.params;
//     console.log("Запрошен postId: ", postId);
// const comments = await CommentModal.find({ post: postId }).populate("user");
// console.log("Найдено комментариев:", comments.length);

//     res.status(200).json(comments);
//   } catch (error) {
//     console.error("Ошибка при получении комментариев:", error);
//     res.status(500).json({ message: "Ошибка при получении комментариев" });
//   }
// };

// import CommentModal from "../models/Comment.js";



// export const getCommentsByPost = async (req, res) => {
//   try {
//     const postId = req.params.postId;
//     const comments = await CommentModal.find({ postId }).sort({ createdAt: -1 });
//     res.json(comments);
//   } catch (error) {
//     console.error("Ошибка при получении комментариев: 111", error);
//     res.status(500).json({ message: "Ошибка при получении комментариев 111" });
//   }
// };


