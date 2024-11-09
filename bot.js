const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Create an Express app to handle the HTML form submission
const app = express();
const port = 80;

app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Your Telegram bot token (replace with your bot token from BotFather)
const botToken = "7820076195:AAE7TTsq15V6Olcobhrrourpmu9zreetjb0";
const bot = new TelegramBot(botToken, { polling: true });

// Array of allowed chat IDs (replace with your allowed users' chat IDs)
const allowedChatIds = ["1031081189", "6126626263"]; // Replace with actual chat IDs

// Middleware to check if the user is authorized
const isAuthorizedUser = (chatId) => allowedChatIds.includes(chatId.toString());

// Start command for the bot
bot.onText(/\/start/, (msg) => {
  if (!isAuthorizedUser(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "Вы не имеете права использовать этого бота.");
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    "Добро пожаловать! Вы имеете право использовать этого бота."
  );
});

// Handle /form command for submitting the form
bot.onText(/\/form/, (msg) => {
  if (!isAuthorizedUser(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "Вы не имеете права использовать этого бота.");
    return;
  }

  // Send form URL (could be replaced with your real form URL)
  bot.sendMessage(
    msg.chat.id,
    "Пожалуйста, заполните форму: https://wealthwize.netlify.app/#contact"
  );
});

// Handle form submissions (from the HTML form)
app.post("/submit-form", async (req, res) => {
  const { name, email, tel, message } = req.body;

  if (!name || !email || !tel || !message) {
    return res
      .status(400)
      .send(
        "Имя, электронная почта, номер телефона и сообщение обязательны для заполнения"
      );
  }

  const fetch = (await import("node-fetch")).default; // Dynamically import node-fetch

  // Send form data to the Telegram bot
  const messageToSend = `Новое сообщение от клиента 🔔 \n\n<b>Имя: </b>${name}\n<b>Почта: </b>${email}\n<b>Номер телефона: </b>${tel}\n<b>Сообщение: </b>\n\n<i>${message}</i>`;

  // Send the form data as a message to all authorized users
  try {
    for (const chatId of allowedChatIds) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageToSend,
          parse_mode: "HTML",
        }),
      });
    }
    res.status(200).send("Сообщение успешно отправлено");
  } catch (error) {
    console.error("Error sending form data to Telegram bot:", error);
    res.status(500).send("Что-то пошло не так");
  }
});

app.get("/info", async (req, res) => {
  res
    .status(200)
    .send(
      "© 2024 Copyright: <a href='https://wealthwise.uz'>WEALTHWISE.UZ</a>"
    );
});

// Start the Express server to handle form submissions
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Log the chat ID of users who send a message (helps you add allowed users)
bot.on("message", (msg) => {
  console.log(`Received message from chat ID: ${msg.chat.id}`);
});
