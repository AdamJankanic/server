const { Server } = require("socket.io");
const { User, Chat, User_Chat, Message } = require("./models");
const jwt = require("jsonwebtoken");

async function initializeWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://client-production-ab49.up.railway.app",
        "http://127.0.0.1:3000",
      ],
      // origin: "http://127.0.0.1:3000",
    },
  });

  //create namespace for each chat from chat table
  const chats = await Chat.findAll();
  if (!chats) {
    console.log("No chats found");
    return;
  }
  const chatUuids = chats.map((chat) => chat.uuid);
  console.log(chatUuids);

  chatUuids.forEach((chatUuid) => {
    const chatNamespace = io.of(`/chat/${chatUuid}`);

    chatNamespace.on("connection", (socket) => {
      const { authorization } = socket.handshake.headers;

      if (authorization) {
        try {
          // Token is present, handle it
          const token = authorization.split(" ")[1];
          console.log(
            `User Connected : ${socket.id} to namespace /chat/${chatUuid}`
          );

          //decode token
          const decoded = jwt.verify(
            token.replace(/['"]+/g, ""),
            process.env.MY_SECRET
          );
          console.log(decoded);
        } catch (error) {
          console.log(error);
          if (error.name === "TokenExpiredError") {
            // Token is expired
            console.log("Token expired");
          }
          socket.disconnect();
        }
      } else {
        // dont allow connection to namespace without token
        console.log("No token");
        socket.disconnect();
      }

      socket.on("chatMessage", (message) => {
        const { authorization } = socket.handshake.headers;
        console.log("auth: ", authorization);
        console.log("Message received:", message);
        // console log namespaced socket id

        const namespace = socket.nsp.name;
        const chatUUID = namespace.split("/")[2];

        console.log("namespace: ", chatUUID);

        // save message to database
        Message.create({
          sender_uuid: message.sender_uuid,
          chat_uuid: chatUUID,
          content: message.content,
        });

        socket.broadcast.emit("receive_message", message);
      });

      socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
      });
    });
  });

  return io;
}

function handleNewChat(io, chat_uuid) {
  console.log("NEW CHAT HANDLE FUNCTION");
  const chatNamespace = io.of(`/chat/${chat_uuid}`);

  chatNamespace.on("connection", (socket) => {
    const { authorization } = socket.handshake.headers;

    if (authorization) {
      try {
        // Token is present, handle it
        const token = authorization.split(" ")[1];
        console.log(
          `User Connected : ${socket.id} to namespace /chat/${chat_uuid}`
        );

        //decode token
        const decoded = jwt.verify(
          token.replace(/['"]+/g, ""),
          process.env.MY_SECRET
        );
        console.log(decoded);
      } catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError") {
          // Token is expired
          console.log("Token expired");
        }
        socket.disconnect();
      }
    } else {
      // dont allow connection to namespace without token
      console.log("No token");
      socket.disconnect();
    }

    socket.on("chatMessage", (message) => {
      const { authorization } = socket.handshake.headers;
      console.log("auth: ", authorization);
      console.log("Message received:", message);
      // console log namespaced socket id

      const namespace = socket.nsp.name;
      const chatUUID = namespace.split("/")[2];

      console.log("namespace: ", chatUUID);

      // save message to database
      Message.create({
        sender_uuid: message.sender_uuid,
        chat_uuid: chatUUID,
        content: message.content,
      });

      socket.broadcast.emit("receive_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
}

module.exports = {
  initializeWebSocket,
  handleNewChat,
};
