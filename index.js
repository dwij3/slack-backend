const express = require("express");
const bodyParser = require("body-parser");
const {v4 : uuidv4} = require('uuid')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


const fs = require("fs");
require("dotenv").config();
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

//fetch currentUser
app.get("/getCurrentUserInfo/:id", (req, res) => {
  const file = fs.readFileSync("./database/users.json", {
    encoding: "utf8",
    flag: "r",
  });
  const userData = JSON.parse(file);

  const currentUser = userData.find((ele) => {
    return ele.id === req.params.id;
  });

  if (currentUser) res.send(currentUser);
  // res.send(new Error("User not found"));
});

//fetch details for teamMates
app.get("/getUserTeamMates/:id", (req, res) => {
  const file = fs.readFileSync("./database/users.json", {
    encoding: "utf8",
    flag: "r",
  });
  const userData = JSON.parse(file);

  const user = userData.find((user) => {
    return user.id === req.params.id;
  });

  const teamMates = userData.filter((u) => {
    return user["chatRoomId"].includes(u.id);
  });

  if (teamMates) res.send(teamMates);
  res.send(new Error("teamMates not found"));
});

//fetch details for chatroom
app.get("/getChatRoom/:userId/:teamMateId", (req, res) => {
  const file = fs.readFileSync("./database/chatroom.json", {
    encoding: "utf8",
    flag: "r",
  });
  const chatRoomData = JSON.parse(file);
  const reqParamas = [req.params.userId, req.params.teamMateId];

  //finding the chatroom based on user and teamMate
  const chatRoom = chatRoomData.find((room) => {
    const userIds = room["userIds"];

    userIds.sort();
    reqParamas.sort();

    if (userIds.length === 1) {
      if (userIds[0] === reqParamas[0] && userIds[0] === reqParamas[1]) return 1;
      else return 0;
    } else {
      if (reqParamas[0] === userIds[0] && reqParamas[1] === userIds[1]) return 1;
      else return 0;
    }
  });

  const chatRoomMessages = chatRoom["messageIds"];

  const messages = fs.readFileSync("./database/messages.json", {
    encoding: "utf8",
    flag: "r",
  });

  const messagesData = JSON.parse(messages);

  const messageOfChatRoom = messagesData.filter((message) => {
    return chatRoomMessages.includes(message.id);
  });

  chatRoom.messageIds = messageOfChatRoom;

  const chatRoomWithMessages = {...chatRoom};
  chatRoomWithMessages.messages = chatRoomWithMessages.messageIds;
  delete chatRoomWithMessages.messageIds;
  res.send(chatRoomWithMessages);
});

app.put("/addMessage/:chatRoomId", (req, res) => {
  const file = fs.readFileSync("./database/messages.json");

  //data of post request
  const data = req.body;
  data.id = uuidv4();
  if (file.length === 0) {
    fs.writeFileSync("./database/messages.json", JSON.stringify([data]));
  } else {
    const json = JSON.parse(file.toString());
    json.push(data);
    fs.writeFileSync("./database/messages.json", JSON.stringify(json));
  }

  const chatRoom = fs.readFileSync("./database/chatroom.json", {
    encoding: "utf8",
    flag: "r",
  });
  let chatRoomData = JSON.parse(chatRoom);

  const currentChatRoom = chatRoomData.find((room) => {
    return room.id === req.params.chatRoomId;
  });

  currentChatRoom.messageIds.push(req.body.id);

  chatRoomData = chatRoomData.map((room) => {
    if (room.id === req.params.chatRoomId) return currentChatRoom;
    return room;
  });

  fs.writeFileSync("./database/chatroom.json", JSON.stringify(chatRoomData));
  res.json(data);
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
