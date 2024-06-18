const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("./models/User");
const Client = require("./models/Client");

const app = express();
app.use(bodyParser.json());

mongoose
  .connect("mongodb://localhost:27017/yourDatabaseName", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(express.static(path.join(__dirname, "public")));

app.post("/register", async (req, res) => {
  const { fullName, login, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName, login, password: hashedPassword });
  await user.save();
  res.status(201).send("User registered");
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  const user = await User.findOne({ login });
  if (!user) {
    return res.status(400).send("Invalid login");
  }
  const isPasswordValid = password === user.password;
  if (!isPasswordValid) {
    return res.status(400).send("Invalid password");
  }
  const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
  res.send({ token });
});

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Access denied");
  }
  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(400).send("Invalid token");
  }
};

app.get("/clients", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  const clients = await Client.find({ responsibleFIO: user.fullName });
  if (clients.length === 0) {
    res.send({ message: "Клиенты не найдены" });
  } else {
    res.send(clients);
  }
});

app.put("/clients/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;
  await Client.findByIdAndUpdate(req.params.id, { status });
  res.send("Status updated");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
