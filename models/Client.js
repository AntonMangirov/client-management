const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  accountNumber: String, // Номер счета
  lastName: String, // Фамилия
  firstName: String, // Имя
  middleName: String, // Отчество
  birthDate: Date, // Дата рождения
  inn: String, // ИНН
  responsibleFIO: String, // ФИО ответственного
  status: { type: String, default: "Не в работе" }, // Статус, по умолчанию "Не в работе"
});

module.exports = mongoose.model("Client", clientSchema);
