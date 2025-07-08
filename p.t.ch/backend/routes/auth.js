const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) return res.status(400).json({ message: 'אנא מלא את כל השדות' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'שם משתמש קיים' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ username, passwordHash });
    await newUser.save();

    res.status(201).json({ message: 'נרשמת בהצלחה' });
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) return res.status(400).json({ message: 'אנא מלא את כל השדות' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'שם משתמש או סיסמה לא נכונים' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'שם משתמש או סיסמה לא נכונים' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { _id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

module.exports = router;
