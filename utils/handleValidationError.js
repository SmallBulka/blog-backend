import { validationResult } from "express-validator";

export default (req, res, next) => {
  // Получаем ошибки валидации
  const errors = validationResult(req);

  // Если есть ошибки, возвращаем их клиенту
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Ошибка валидации",
      errors: errors.array(), // Детали ошибок
    });
  }

  // Если ошибок нет, передаем управление следующему middleware
  next();
};