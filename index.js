const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const { json } = require("stream/consumers");
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);



//fetch currentUser
app.get("/getCurrentUserInfo/:id", (req, res) => {
  const data = fs.readFileSync("./database/users.json", {
    encoding: "utf8",
    flag: "r",
  });
  const userData = JSON.parse(data);

  const currentUser = userData.find((ele) => {
    return ele.id == req.params.id;
  });

  res.send(currentUser);
});

//fetch details for teamMates
app.get("/getUserTeamMates/:id", (req, res) => {
  const data = fs.readFileSync("./database/users.json", {
    encoding: "utf8",
    flag: "r",
  });
  const userData = JSON.parse(data);

  const user = userData.find((user) => {
    return user.id == req.params.id;
  });

  const teamMates = userData.filter((u) => {
    return user["chatRoomId"].includes(u.id);
  });

  res.send(teamMates);
});

//fetch details for chatroom
app.get("/getChatRoom/:userId/:teamMateId", (req, res) => {
  const data = fs.readFileSync("./database/chatroom.json", {
    encoding: "utf8",
    flag: "r",
  });
  const chatRoomData = JSON.parse(data);
  const arr1 = [+req.params.userId, +req.params.teamMateId];

  //finding the chatroom based on user and teamMate
  const chatRoom = chatRoomData.find((room) => {
    const arr2 = room["userIds"];

    arr1.sort();
    arr2.sort();

    if (arr2.length == 1) {
      if (arr2[0] == arr1[0] && arr2[0] == arr1[1]) return 1;
      else return 0;
    } else {
      if (arr1[0] == arr2[0] && arr1[1] == arr2[1]) return 1;
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
  res.send(chatRoom);
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
