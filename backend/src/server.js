require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { sequelize } = require('../models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Passport
app.use(passport.initialize());
require('../config/passport')(passport);

// API Versioning
app.use('/api/v1', require('../routes'));

// Error Handling Middleware
app.use(require('../middlewares/errorHandler'));

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
