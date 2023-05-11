const { Server } = require("socket.io");
const { User, Chat, User_Chat, Message } = require("./models");
const jwt = require("jsonwebtoken");

async function initializeWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "https://client-production-ab49.up.railway.app",
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
      } else {
        // dont allow connection to namespace without token
        console.log("No token");
        // socket.disconnect();
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
          sender_uuid: message.user_uuid,
          chat_uuid: chatUUID,
          content: message.message,
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

// console.log("initializeWebSocket");

// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on("disconnect", () => {
//     console.log("User Disconnected", socket.id);
//   });
// });

// return io;
// }

// function handleJoinChat(socket, io) {
//   socket.on("joinChat", async (uuid) => {
//     // get all user chats
//     const userChats = await User_Chat.findAll({
//       attributes: ["chat_uuid"], // Specify the attribute(s) you want to retrieve
//       where: {
//         user_uuid: uuid,
//       },
//     });

//     console.log(`User ${socket.id} joining chat ${uuid}`);
//     const chatUuids = userChats.map((userChat) => userChat.chat_uuid);
//     console.log(chatUuids);

//     // create namespace for each chat
//     chatUuids.forEach((chatUuid) => {
//       const chatNamespace = io.of(`/chat/${chatUuid}`);

//       chatNamespace.on("connection", (socket) => {
//         console.log(
//           `User Connected : ${socket.id} to namespace /chat/${chatUuid}`
//         );

//         socket.on("chatMessage", (message) => {
//           // Emit the message to all clients in the chat namespace
//           console.log(`Message received: ${message}`);
//           socket.broadcast.emit("receive_message", message);
//         });

//         socket.on("disconnect", () => {
//           console.log("User Disconnected", socket.id);
//         });
//       });
//     });
//   });
// }

// function handleNewChat(socket, io) {
//   console.log("NEW CHAT HANDLE FUNCTION");

//   socket.on("newChat", (chatUuid) => {
//     console.log("NEW CHAT SOCKET");
//     const chatNamespace = io.of(`/chat/${chatUuid}`);

//     chatNamespace.on("connection", (socket) => {
//       console.log(
//         `NEW CHAT User Connected : ${socket.id} to namespace /chat/${chatUuid}`
//       );

//       socket.on("chatMessage", (message) => {
//         // Emit the message to all clients in the chat namespace
//         console.log(`NEW CHAT Message received: ${message}`);
//         socket.broadcast.emit("receive_message", message);
//       });

//       socket.on("disconnect", () => {
//         console.log("User Disconnected", socket.id);
//       });
//     });
//   });
// }

module.exports = {
  initializeWebSocket,
  // handleJoinChat, handleNewChat
};
