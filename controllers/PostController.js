import PostModal from '../models/Post.js'


export const getPosts = async (req, res) => {
  try {
    const { tag, sortBy = 'createdAt', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = tag ? { tags: tag } : {};
    const sortOptions = sortBy === 'viewsCount' ? { viewsCount: -1 } : { createdAt: -1 };

    const posts = await PostModal.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('user');

    const total = await PostModal.countDocuments(query);

    res.json({
      posts,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении постов' });
  }
};

export const getPopularTags = async (req, res) => {
  try {
    const tags = await PostModal.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json(tags.map(tag => tag._id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось получить теги' });
  }
};

export const incrementViews = async (req, res) => {
  try {
    const post = await PostModal.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось обновить просмотры' });
  }
};

export const getLastTags = async (req, res) => {
  try {
    // Получаем последние 20 постов с тегами
    const posts = await PostModal.find(
      { tags: { $exists: true, $not: { $size: 0 } } } // Только посты с тегами
    )
      .sort({ createdAt: -1 })
      .limit(20) // Берем больше постов для выборки
      .select('tags')
      .lean();

    // Извлекаем и фильтруем теги
    const tags = posts
      .flatMap(post => post.tags || []) // Безопасный flatMap
      .filter(tag => typeof tag === 'string' && tag.trim() !== '') // Фильтрация
      .map(tag => tag.trim()) // Очистка пробелов
      .filter((tag, index, arr) => arr.indexOf(tag) === index) // Уникальность
      .slice(0, 5); // Берем 5 последних

    console.log('Получены теги:', tags); // Логирование результата
    
    res.json(tags.length > 0 ? tags : ['react', 'javascript', 'node', 'mongodb', 'express']); // Fallback
  } catch (err) {
    console.error('Ошибка при получении тегов:', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      message: 'Не удалось получить теги',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
export const getAll = async (req, res) => {
    try{
        const posts= await PostModal.find().populate('user').exec();
        res.json(posts)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи',
        })
    }
}

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModal.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      }
    )
      .populate("user")
      .then((doc, err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: "Не удалось получить статью",
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }
        return res.json(doc);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: "Не удалось получить статью" 
    });
  }
};


export const remove = async (req, res) => {
    try {
      const postId = req.params.id;
      PostModal.findOneAndDelete({
        _id: postId,

      }, (err, doc) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
              message: 'Не удалось удалить статью',
            });
        }

        if (!doc) {
            return res.status(404).json({
                message: 'Статья не найдена',
              });
        }
        res.json({
            succes: true,
        })
      })
  
      
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось получить статьи',
      });
    }
};

export const create = async (req, res) => {
    try{
        const doc = new PostModal({
            title: req.body.title, 
            text: req.body.text, 
            imageUrl: req.body.imageUrl, 
            tags: req.body.tags.split(','), 
            user: req.userId,
        });

        const post = await doc.save()

        res.json(post)

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью',
    })
    }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModal.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(","),
        user: req.userId,
      },
      {
        returnDocument: "after",
      }
    ).then((doc, err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Не удалось изменить статью",
        });
      }
      if (!doc) {
        return res.status(404).json({
          message: "Статья не найдена",
        });
      }
      return res.json({ message: "" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Не удалось изменить статью" });
  }
};


