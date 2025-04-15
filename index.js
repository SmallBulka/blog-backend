import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import PostModal from "./models/Post.js";
import UserModal from "./models/User.js";
import CommentModal from "./models/Comment.js";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from "./validation.js";
import { UserController, PostController, CommentController } from "./controllers/index.js";
import { handleValidationError, checkAuth } from "./utils/index.js";

mongoose
  .connect(
    process.env.MONGODB_URL
  )
  
  .then(() => console.log("BD ok"))
  .catch((err) => console.log("BD error", err));
 
const app = express();

app.use(express.json()); // Парсинг JSON

app.use(cors()); // Разрешение CORS
app.use("/uploads", express.static("uploads")); // Статические файлы

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Функция для получения ID пользователя из токена
app.getPosts = async (req, res) => {
  try {
    const posts = await PostModal.aggregate([
      {
        $project: {
          title: 1,
          formattedDate: {
            $dateToString: { format: "%d.%m.%Y", date: "$createdAt" }
          }
        }
      }
    ]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post(
  "/auth/login",
  loginValidation,
  handleValidationError,
  UserController.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationError,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.getMe);
// Роуты для загрузки файлов
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
app.get("/tags", PostController.getLastTags);

app.get("/posts", PostController.getAll);
app.get("/posts/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post("/posts", checkAuth, postCreateValidation, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, postCreateValidation, PostController.update);

//   try {
//     const { sort = 'new', tag, page = 1, limit = 10 } = req.query;
    
//     // Настройки сортировки
//     const sortOptions = {
//       'new': { createdAt: -1 },
//       'popular': { viewsCount: -1 }
//     };
    
//     // Базовый запрос
//     const query = {};
//     if (tag) query.tags = decodeURIComponent(tag);
    
//     // Выполняем запрос
//     const posts = await PostModal.find(query)
//       .sort(sortOptions[sort] || sortOptions.new)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .populate('user', 'username avatar');
    
//     const total = await PostModal.countDocuments(query);
    
//     res.json({
//       posts,
//       total,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       sortType: sort
//     });
    
//   } catch (err) {
//     console.error('Ошибка получения постов:', err);
//     res.status(500).json({ message: 'Ошибка сервера' });
//   }
// });
// app.get('/popular-tags', async (req, res) => {
//   try {
//     const tags = await PostModal.aggregate([
//       { $unwind: "$tags" },
//       { $match: { tags: { $ne: null, $ne: "" } } },
//       { $group: { 
//         _id: "$tags", 
//         count: { $sum: 1 },
//         lastUsed: { $max: "$createdAt" }
//       }},
//       { $sort: { count: -1, lastUsed: -1 } },
//       { $limit: 10 },
//       { $project: { _id: 0, name: "$_id", count: 1 } }
//     ]);
    
//     res.json(tags);
//   } catch (err) {
//     res.status(500).json({ message: 'Ошибка получения тегов' });
//   }
// });

// app.get('/tag/:tag', async (req, res) => {
//   try {
//     const tag = decodeURIComponent(req.params.tag);
//     const { sort = 'createdAt', page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;
    
//     const sortOptions = sort === 'popular' 
//       ? { viewsCount: -1 } 
//       : { createdAt: -1 };
    
//     const posts = await PostModal.find({ tags: tag })
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .populate('user', 'fullName avatarUrl');
    
//     const total = await PostModal.countDocuments({ tags: tag });
    
//     res.json({
//       posts,
//       total,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       message: 'Ошибка при получении статей по тегу',
//       error: err.message 
//     });
//   }
// });
// app.get('/posts/tags', async (req, res) => {
//   try {
//     console.log('Запрос тегов начал выполнение'); // Лог
//     const tags = await PostModal.aggregate([
//       { $unwind: "$tags" },
//       { $match: { tags: { $ne: null, $ne: "" } } },
//       { $group: { _id: "$tags" } },
//       { $project: { _id: 0, tag: "$_id" } }
//     ]);
    
//     console.log('Найдены теги:', tags); // Лог результата
//     res.json(tags.map(item => item.tag));
//   } catch (err) {
//     console.error('Ошибка в роуте /tags:', err.stack); // Детальный лог ошибки
//     res.status(500).json({ 
//       message: 'Internal Server Error',
//       details: err.message 
//     });
//   }
// });
app.get('/views', async (req, res) => {
  try {
    const { sortBy = 'createdAt' } = req.query; // Значение по умолчанию
    const sortOptions = {};

    if (sortBy === 'viewsCount') {
      sortOptions.viewsCount = -1; // Сортировка по убыванию просмотров
    } else {
      sortOptions.createdAt = -1; // Сортировка по убыванию даты
    }

    const posts = await PostModal.find()
      .sort(sortOptions)
      .populate('user', 'fullName avatarUrl') // Указываем, какие поля пользователя нужны
      .lean();
      if (posts.length > 0) {
        console.log('Пример даты первого поста:', posts[0].createdAt);
        console.log('Пример даты последнего поста:', posts[posts.length-1].createdAt);
      }
  
    res.status(200).json(posts);
  } catch (error) {
    console.error('Ошибка при получении статей:', error);
    res.status(500).json({ message: 'Ошибка при получении статей', error: error.message });
  }
});
app.get('/tag/:tag', async (req, res) => {
  try {
    // 1. Нормализация тега
    const rawTag = decodeURIComponent(req.params.tag);
    const normalizedTag = rawTag.trim().toLowerCase();
    console.log(`Поиск по тегу: "${rawTag}" (нормализовано: "${normalizedTag}")`);

    // 2. Проверка существования тега
    const tagExists = await PostModal.exists({ 
      tags: { $regex: new RegExp(`^${normalizedTag}$`, 'i') }
    });
    
    if (!tagExists) {
      // 3. Поиск похожих тегов
      const similarTags = await PostModal.aggregate([
        { $unwind: "$tags" },
        { 
          $match: { 
            tags: { 
              $regex: normalizedTag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 
              $options: 'i' 
            } 
          } 
        },
        { $group: { _id: "$tags" } },
        { $limit: 5 }
      ]);
      
      return res.status(404).json({
        message: `Тег "${rawTag}" не найден`,
        suggestions: similarTags.map(t => t._id)
      });
    }

    // 4. Поиск постов
    const sort = req.query.sort === 'popular' ? 
      { viewsCount: -1 } : { createdAt: -1 };
    
      const posts = await PostModal.find({ tags: req.params.tag })
      .populate({
        path: 'user',
            select: '_id username avatar fullName',
    model: 'User'
      })
      .lean();
      

    console.log(`Найдено ${posts.length} постов с тегом "${rawTag}"`);
    
    // 5. Отправка результата
    res.json({
      success: true,
      tag: rawTag,
      count: posts.length,
      posts
    });

  } catch (err) {
    console.error('Ошибка поиска по тегу:', {
      tag: req.params.tag,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/posts/:postId/comments', checkAuth,  async (req, res) => {
  try {
    const { text, userId } = req.body; // Получаем userId из тела запроса
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        error: 'Неверный ID поста',
        details: {
          received: postId,
          expected: '24-символьный hex-идентификатор (например: 507f191e810c19729de860ea)'
        }
      });
    }

    // 2. Проверяем существование поста
    const postExists = await PostModal.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    // 3. Проверяем userId (если нужно)
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ error: 'Неверный ID пользователя' });
    // }

    // 4. Создаем комментарий
    const comment = new CommentModal({
      text: req.body.text,
      user: req.userId, // Берём из middleware
      post: req.params.postId
    });

    await comment.save();
     // Увеличиваем счётчик комментариев
     await PostModal.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    res.status(201).json(comment);

  } catch (error) {
    console.error('Ошибка создания комментария:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  });

// Получение всех комментариев
app.get('/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await CommentModal.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('user', 'username'); // Добавляем данные пользователя

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Получение количества комментариев для поста
app.get('/posts/:postId/comments/count', async (req, res) => {
  try {
    const count = await CommentModal.countDocuments({ post: req.params.postId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/:id/like', async (req, res) => {
  try {
    const { id: postId } = req.params;

    // Находим пост
    const post = await PostModal.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Увеличиваем счетчик лайков
    post.likeCount += 1;
    await post.save();

    res.status(200).json({ message: 'Лайк успешно добавлен', likeCount: post.likeCount });
  } catch (error) {
    console.error('Ошибка при добавлении лайка:', error);
    res.status(500).json({ message: 'Ошибка при добавлении лайка', error: error.message });
  }
});
app.delete('/:id/like', async (req, res) => {
  try {
    const { id: postId } = req.params;

    // Находим пост
    const post = await PostModal.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' });
    }

    // Уменьшаем счетчик лайков (но не ниже 0)
    if (post.likeCount > 0) {
      post.likeCount -= 1;
      await post.save();
    }

    res.status(200).json({ message: 'Лайк успешно удален', likeCount: post.likeCount });
  } catch (error) {
    console.error('Ошибка при удалении лайка:', error);
    res.status(500).json({ message: 'Ошибка при удалении лайка', error: error.message });
  }
});
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Пустой запрос" });
    }

    // Ищем посты по названию (регистронезависимый поиск)
    const results = await PostModal.find({
      title: { $regex: query, $options: "i" },
    });

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Ничего не найдено" });
    }
  } catch (error) {
    console.error("Ошибка при поиске:", error);
    res.status(500).json({ message: "Ошибка при поиске" });
  }
});


app.listen(process.env.PORT||4444, (err) => {
  if (err) {
    return console.log("err");
  }
  console.log("okkkk");
});
