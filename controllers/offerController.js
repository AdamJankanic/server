const { Offer, Category } = require("../models");
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

    fs.writeFile("./images/image.png", decodedImageData, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Image saved successfully as "image.png".');
      }
    });

    const offer = await Offer.create({
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

      const updatedOffer = await Offer.update({
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
    const offers = await Offer.findAll();
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
    });
    return res.status(200).json(offers);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Offers can not be found");
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
};
