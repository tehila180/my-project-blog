const express = require('express');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// --- הגדרת multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// --- אימות טוקן ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'טוקן לא תקין או פג תוקף' });
    req.user = user;
    next();
  });
}

// --- קבלת כל הפוסטים ---
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username')
      .populate('comments.author', 'username');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// --- קבלת פוסט בודד לפי ID ---
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.author', 'username');

    if (!post) return res.status(404).json({ message: 'פוסט לא נמצא' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בקבלת הפוסט' });
  }
});

// --- יצירת פוסט חדש עם תמונה ---
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = new Post({
      title,
      content,
      author: req.user.id,
      createdAt: new Date(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newPost.save();
    await newPost.populate('author', 'username');
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// --- עדכון פוסט כולל עדכון תמונה ---
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'פוסט לא נמצא' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'אין הרשאה לערוך את הפוסט' });
    }

    post.title = req.body.title;
    post.content = req.body.content;
    if (req.file) {
      post.imageUrl = `/uploads/${req.file.filename}`;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בעת עריכה' });
  }
});

// --- מחיקת פוסט ---
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

// --- הוספת תגובה ---
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

    const populatedPost = await Post.findById(post._id).populate('comments.author', 'username');
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בשרת בהוספת תגובה' });
  }
});

module.exports = router;
