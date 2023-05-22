const { Event, Category, User_Chat, Chat, Message } = require("../models");
const { handleNewChat } = require("../websocket");
const { Op } = require("sequelize");
/* Event create */
const createEvent = async (req, res) => {
  try {
    //get category
    const category = await Category.findOne({
      where: {
        name: req.body.category,
      },
    });

    const event = await Event.create({
      title: req.body.title,
      category: category.uuid,
      creator_uuid: req.body.creator_uuid,
      description: req.body.description,
      capacity: req.body.capacity,
      price: req.body.price,
      location: req.body.location,
      time: req.body.time,
      duration: req.body.duration,
      date: req.body.date,
    });

    //create chat
    const eventChat = await Chat.create({
      event_uuid: event.uuid,
    });

    //add user to chat
    const userChat = await User_Chat.create({
      user_uuid: req.body.creator_uuid,
      chat_uuid: eventChat.uuid,
    });

    return res.status(200).json(event);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Event can not be created");
  }
};

/* Event update */
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.body.uuid,
      },
    });

    if (event) {
      const category = await Category.findOne({
        where: {
          name: req.body.category,
        },
      });

      const updatedEvent = await event.update({
        title: req.body.title,
        category: category.uuid,
        description: req.body.description,
        capacity: req.body.capacity,
        price: req.body.price,
        location: req.body.location,
        time: req.body.time,
        duration: req.body.duration,
        date: req.body.date,
      });

      return res.status(200).json(updatedEvent);
    } else {
      return res.status(400).send("Event not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Event can not be updated");
  }
};

//get event details
const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(event);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Event can not be found");
  }
};

//get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Events can not be found");
  }
};

//get all events created by user
const getAllEventsByUser = async (req, res) => {
  try {
    //user uuid from url
    const user_uuid = req.params.uuid;

    const events = await Event.findAll({
      where: {
        creator_uuid: user_uuid,
      },
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Events can not be found");
  }
};

//get events joined by user
const getAllEventsJoinedByUser = async (req, res) => {
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
    });

    //get all events from event table where event_uuid = event_uuid from chat table and user is not creator
    const events = await Event.findAll({
      where: {
        uuid: allChats.map((chat) => chat.event_uuid),
        creator_uuid: {
          [Op.not]: user_uuid,
        },
      },
      include: [{ model: Category, attributes: ["name"] }],
    });

    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Events can not be found");
  }
};

// join event by user
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.body.event_uuid,
      },
    });

    if (event) {
      const chat = await Chat.findOne({
        where: {
          event_uuid: event.uuid,
        },
      });

      //check if user is already in chat
      const isInChat = await User_Chat.findOne({
        where: {
          user_uuid: req.body.user_uuid,
          chat_uuid: chat.uuid,
        },
      });

      if (isInChat) {
        return res.status(204).send("User already joined");
      }

      if (event.joined < event.capacity || event.capacity === 0) {
        const joinedEvent = await event.update({
          joined: event.joined + 1,
        });

        const userChat = await User_Chat.create({
          user_uuid: req.body.user_uuid,
          chat_uuid: chat.uuid,
        });

        const ioPromise = req.app.get("websocketIO");
        const io = await ioPromise;
        console.log("io", io);
        handleNewChat(io, chat.uuid);

        return res.status(200).json(joinedEvent);
      } else {
        return res.status(400).send("Event is full");
      }
    } else {
      return res.status(400).send("Event not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Event can not be joined");
  }
};

//delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (event) {
      //delete chat from chat table where event_uuid = event_uuid from url

      const chats = await Chat.findAll({
        where: {
          event_uuid: event.uuid,
        },
      });

      const chatUuids = chats.map((chat) => chat.uuid);

      const userChats = await User_Chat.destroy({
        where: {
          chat_uuid: chatUuids,
        },
      });

      const deletedChats = await Chat.destroy({
        where: {
          uuid: chatUuids,
        },
      });

      const messages = await Message.destroy({
        where: {
          chat_uuid: chatUuids,
        },
      });

      const deletedEvent = await event.destroy();
      return res.status(200).json(deletedEvent);
    } else {
      return res.status(400).send("Event not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Event can not be deleted");
  }
};

const leaveEvent = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const event = await Event.findOne({
      where: {
        uuid: req.body.event_uuid,
      },
    });

    if (event) {
      console.log("event", event);
      const chat = await Chat.findOne({
        where: {
          event_uuid: event.uuid,
        },
      });

      console.log("chat", chat);
      const userChat = await User_Chat.destroy({
        where: {
          user_uuid: req.body.user_uuid,
          chat_uuid: chat.uuid,
        },
      });

      const leftEvent = await event.update({
        joined: event.joined - 1,
      });

      return res.status(200).json(leftEvent);
    } else {
      return res.status(400).send("Event not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Event can not be left");
  }
};

/* export */
module.exports = {
  createEvent,
  updateEvent,
  getAllEvents,
  getAllEventsByUser,
  joinEvent,
  getEventDetails,
  getAllEventsJoinedByUser,
  deleteEvent,
  leaveEvent,
};
