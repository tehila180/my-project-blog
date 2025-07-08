const express = require('express');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// הגדרת storage ל-multer (שמירת קבצים בתיקייה uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // יש ליצור תיקייה uploads בפרויקט
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// פונקציית אימות טוקן JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// קבלת כל הפוסטים עם פרטי מחברים ותגובות, ממוינים מהחדש לישן
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .populate('comments.author', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// קבלת פוסט בודד לפי ID כולל פרטי מחברים ותגובות עם שמות מחברים
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')              // פרטי מחבר הפוסט
      .populate('comments.author', 'username');    // פרטי מחברי התגובות

    if (!post) return res.status(404).json({ message: 'פוסט לא נמצא' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בקבלת הפוסט' });
  }
});

// יצירת פוסט חדש עם תמונה
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const newPost = new Post({
      title,
      content,
      author: req.user.id,
      imageUrl,
      createdAt: new Date(),
    });
    await newPost.save();
    await newPost.populate('author', 'username');
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// עדכון פוסט
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'פוסט לא נמצא' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'אין הרשאה לערוך את הפוסט' });
    }

    post.title = req.body.title;
    post.content = req.body.content;

    // אם רוצים לאפשר שינוי תמונה בעריכה, צריך להוסיף תמיכה ב-upload כאן גם
    // כרגע לא מטפלים בזה

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בעת עריכה' });
  }
});

// מחיקת פוסט
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'פוסט לא נמצא' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'אין הרשאה למחוק את הפוסט' });
    }

    await post.deleteOne();
    res.json({ message: 'הפוסט נמחק בהצלחה' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בעת מחיקה' });
  }
});

// הוספת תגובה לפוסט
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'תוכן התגובה חייב להיות מלא' });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'פוסט לא נמצא' });

    const comment = {
      content,
      author: req.user.id,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // אחרי שמירת התגובה - מבצעים populate על התגובה החדשה בלבד
    const newComment = post.comments[post.comments.length - 1];
    await newComment.populate('author', 'username');

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בהוספת תגובה' });
  }
});

module.exports = router;
