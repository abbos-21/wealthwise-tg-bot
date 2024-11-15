const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.json());

const botToken = "7820076195:AAE7TTsq15V6Olcobhrrourpmu9zreetjb0";
const bot = new TelegramBot(botToken, { polling: true });

const allowedChatIds = ["1031081189", "6126626263", "5751827734", "1372474769"];

const isAuthorizedUser = (chatId) => allowedChatIds.includes(chatId.toString());

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

bot.onText(/\/form/, (msg) => {
  if (!isAuthorizedUser(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "Вы не имеете права использовать этого бота.");
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    "Пожалуйста, заполните форму: https://wealthwise.uz/#contact"
  );
});

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

  const messageToSend = `Новое сообщение от клиента 🔔 \n\n<b>Имя: </b>${name}\n<b>Почта: </b>${email}\n<b>Номер телефона: </b>${tel}\n<b>Сообщение: </b>\n\n<i>${message}</i>`;

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

bot.on("message", (msg) => {
  console.log(`Received message from chat ID: ${msg.chat.id}`);
});
