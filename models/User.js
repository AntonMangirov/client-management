const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String, // ФИО пользователя
  login: String, // Логин
  password: String, // Пароль
});

module.exports = mongoose.model("User", userSchema);
