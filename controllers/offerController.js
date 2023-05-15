const { handleNewChat } = require("../websocket");
const { Offer, Category, User_Chat, Chat } = require("../models");
const fs = require("fs");

/* Event offer */
const createOffer = async (req, res) => {
  try {
    //get category
    const category = await Category.findOne({
      where: {
        name: req.body.category,
      },
    });

    // console.log(req.body["image"]);
    const decodedImageData = Buffer.from(
      req.body["image"].replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const base64Header = /^data:(.+);base64,/;
    // Extract the header from the base64 data
    const headerMatch = req.body["image"].match(base64Header);
    const imageType = headerMatch[1].split("/")[1];

    //generate random name for image
    const imageName =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    fs.writeFile(
      `./public/images/${imageName}.${imageType}`,
      decodedImageData,
      (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Image saved successfully");
        }
      }
    );

    const offer = await Offer.create({
      title: req.body.title,
      category: category.uuid,
      creator_uuid: req.body.creator_uuid,
      description: req.body.description,
      state: req.body.state,
      price: req.body.price,
      location: req.body.location,
      delivery: req.body.delivery,
      image: `https://client-production-ab49.up.railway.app/images/${imageName}.${imageType}`,
    });

    return res.status(200).json(offer);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Offer can not be created");
  }
};

/* Offer update */
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({
      where: {
        uuid: req.body.uuid,
      },
    });

    if (offer) {
      const category = await Category.findOne({
        where: {
          name: req.body.category,
        },
      });

      if (req.body["image"]) {
        const decodedImageData = Buffer.from(
          req.body["image"].replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );

        const base64Header = /^data:(.+);base64,/;
        // Extract the header from the base64 data
        const headerMatch = req.body["image"].match(base64Header);
        const imageType = headerMatch[1].split("/")[1];

        //generate random name for image
        const imageName =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        fs.writeFile(
          `./public/images/${imageName}.${imageType}`,
          decodedImageData,
          (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Image saved successfully");
            }
          }
        );
      }

      const updatedOffer = await offer.update({
        title: req.body.title,
        category: category.uuid,
        description: req.body.description,
        state: req.body.state,
        price: req.body.price,
        location: req.body.location,
        delivery: req.body.delivery,
        image: offer.image,
      });

      return res.status(200).json(updatedOffer);
    } else {
      return res.status(400).send("Offer not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Offer can not be updated");
  }
};

/* Get all events */
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Offers can not be found");
  }
};

//get all events created by user
const getAllOffersByUser = async (req, res) => {
  try {
    //user uuid from url
    const user_uuid = req.params.uuid;

    const offers = await Offer.findAll({
      where: {
        creator_uuid: user_uuid,
      },
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Offers can not be found");
  }
};

//get offer details
const getOfferDetails = async (req, res) => {
  try {
    const offer = await Offer.findOne({
      where: {
        uuid: req.params.uuid,
      },
      include: [{ model: Category, attributes: ["name"] }],
    });
    return res.status(200).json(offer);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Offer can not be found");
  }
};

/*contact seller*/
const contactSeller = async (req, res) => {
  try {
    const offer = await Offer.findOne({
      where: {
        uuid: req.body.offer_uuid,
      },
    });

    if (offer) {
      const chats = await Chat.findAll({
        where: {
          offer_uuid: offer.uuid,
        },
      });

      const userChatExist = await User_Chat.findOne({
        where: {
          user_uuid: req.body.user_uuid,
          chat_uuid: chats.map((chat) => chat.uuid),
        },
      });

      if (userChatExist) {
        return res.status(400).send("Chat already exists");
      }

      const chat = await Chat.create({
        offer_uuid: offer.uuid,
      });

      const userChat = await User_Chat.create({
        user_uuid: req.body.user_uuid,
        chat_uuid: chat.uuid,
      });

      const sellerChat = await User_Chat.create({
        user_uuid: offer.creator_uuid,
        chat_uuid: chat.uuid,
      });

      const ioPromise = req.app.get("websocketIO");
      const io = await ioPromise;
      console.log("io", io);
      handleNewChat(io, chat.uuid);

      return res.status(200).json(chat);
    } else {
      return res.status(400).send("Offer not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Chat can not be created");
  }
};

/* export */
module.exports = {
  createOffer,
  updateOffer,
  getAllOffers,
  getAllOffersByUser,
  contactSeller,
  getOfferDetails,
};
