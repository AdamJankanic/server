const router = require("express").Router();

const { signup } = require("./controllers/appController");
const {
  verify,
  login,
  createUser,
  logout,
  refreshToken,
} = require("./controllers/userController");
const {
  createChat,
  getAllChatsByUser,
  getAllMessagesByChat,
} = require("./controllers/chatController");
const {
  createEvent,
  updateEvent,
  getAllEvents,
  getAllEventsByUser,
  joinEvent,
  getEventDetails,
  getAllEventsJoinedByUser,
  deleteEvent,
  leaveEvent,
} = require("./controllers/eventController");

const {
  createOffer,
  updateOffer,
  getAllOffers,
  getAllOffersByUser,
  contactSeller,
  getOfferDetails,
  getAllOffersByUserContacted,
  deleteOffer,
  leaveOffer,
} = require("./controllers/offerController");

const { createCategory } = require("./controllers/categoryController");

const {
  checkEmailDupe,
  checkDomain,
  checkToken,
  checkVerified,
} = require("./middlewares");

/* HTTP requests */

/*user*/
router.post("/user/verify", checkToken, verify);
router.post("/user/login", login);
router.post("/user/register", checkDomain, checkEmailDupe, createUser);
router.get("/user/logout/:uuid", logout);
router.get("/user/refresh", refreshToken);

/*chat*/
// router.post("/chat/create", createChat);
router.get("/chat/mychats/:uuid", checkToken, checkVerified, getAllChatsByUser);
router.get(
  "/chat/messages/:uuid",
  checkToken,
  checkVerified,
  getAllMessagesByChat
);
// router.get("/chat/mychats/:uuid", getAllChatsByUser);

/*event*/
router.post("/event/create", checkToken, createEvent);
router.put("/event/update", checkToken, updateEvent);
router.get("/event/all", checkToken, checkVerified, getAllEvents);
router.get("/event/detail/:uuid", checkToken, checkVerified, getEventDetails);
// get all events by user in url
router.get(
  "/event/myevents/:uuid",
  checkToken,
  checkVerified,
  getAllEventsByUser
);
router.get(
  "/event/joined/:uuid",
  checkToken,
  checkVerified,
  getAllEventsJoinedByUser
);
// router.get("/event/myevents", getAllEventsByUser);
router.post("/event/join", checkToken, joinEvent);
// router.post("/event/join", joinEvent);
router.delete("/event/delete/:uuid", checkToken, deleteEvent);
router.post("/event/leave", checkToken, leaveEvent);

/*offer*/
router.get("/offer/all", checkToken, checkVerified, getAllOffers);
router.put("/offer/update", checkToken, updateOffer);
router.post("/offer/create", createOffer);
router.get(
  "/offer/myoffers/:uuid",
  checkToken,
  checkVerified,
  getAllOffersByUser
);
router.get(
  "/offer/contacted/:uuid",
  checkToken,
  checkVerified,
  getAllOffersByUserContacted
);
router.get("/offer/detail/:uuid", checkToken, checkVerified, getOfferDetails);
router.post("/offer/contact", checkToken, contactSeller);
router.delete("/offer/delete/:uuid", checkToken, deleteOffer);
router.post("/offer/leave", checkToken, leaveOffer);

// router.post("/offer/contact", contactSeller);

/*category*/
router.post("/category/create", createCategory);

module.exports = router;
