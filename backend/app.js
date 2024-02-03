require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notFoundError');

const { DB_ADRES } = process.env;
const { PORT } = process.env;
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { loginValidation, createUserValidation } = require('./middlewares/validation');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', loginValidation, login);
app.post('/signup', createUserValidation, createUser);
app.use(auth);
app.use(userRouter);
app.use(cardRouter);
app.use(errorLogger);
app.use(errors());
app.use('*', (req, res, next) => {
  next(new NotFoundError('Такой страницы не существует'));
});
app.use((error, req, res, next) => {
  const { statusCode = 500, message } = error;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'Ошибка по умолчанию'
        : message,
    });

  next();
});
mongoose.connect(DB_ADRES);
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
