const { Chat, User_Chat, Event, Offer, Message, User } = require("../models");

/* Chat create */
const createChat = async (req, res) => {
  // try {
  //   const chat = await Chat.create({
  //     type: req.body.type,
  //     action_uuid: req.body.action_uuid,
  //   });

  //   return res.status(200).json(chat);
  // } catch (error) {
  //   console.log(error);
  //   return res.status(400).send("User can not be created");
  // }
  console.log("createChat message - code is commented out");
};

/*get all chats by user*/
const getAllChatsByUser = async (req, res) => {
  try {
    //user uuid from url
    const user_uuid = req.params.uuid;

    //get all chat_uuid from user_chat table where user_uuid = user_uuid from url
    const chats = await User_Chat.findAll({
      attributes: ["chat_uuid"],
      where: {
        user_uuid: user_uuid,
      },
    });

    const chatUuids = chats.map((chat) => chat.chat_uuid);

    //get all chats from chat table where chat_uuid = chat_uuid from user_chat table
    const allChats = await Chat.findAll({
      where: {
        uuid: chatUuids,
      },
      include: [
        { model: Event, attributes: ["title", "date", "time"] },
        { model: Offer, attributes: ["title"] },
      ],
    });

    return res.status(200).json(allChats);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Chats can not be found");
  }
};

// get all messages by chat
const getAllMessagesByChat = async (req, res) => {
  try {
    //chat uuid from url
    const chat_uuid = req.params.uuid;

    //get all messages from chat table where chat_uuid = chat_uuid from url
    const messages = await Message.findAll({
      where: {
        chat_uuid: chat_uuid,
      },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    console.log("messages are: ", messages);

    return res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Messages can not be found");
  }
};

/* Export */
module.exports = {
  createChat,
  getAllChatsByUser,
  getAllMessagesByChat,
};
