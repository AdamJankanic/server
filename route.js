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
} = require("./controllers/eventController");

const {
  createOffer,
  updateOffer,
  getAllOffers,
  getAllOffersByUser,
  contactSeller,
} = require("./controllers/offerController");

const { createCategory } = require("./controllers/categoryController");

const { checkEmailDupe, checkDomain, checkToken } = require("./middlewares");

// router.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

/* HTTP requests */

/*user*/
router.post("/user/create", checkDomain, checkEmailDupe, createUser);
router.post("/user/signup", signup);
router.post("/user/verify", verify);
router.post("/user/login", login);
router.get("/user/logout/:uuid", logout);
router.get("/user/refresh", refreshToken);

/*chat*/
// router.post("/chat/create", createChat);
router.get("/chat/mychats/:uuid", checkToken, getAllChatsByUser);
router.get("/chat/messages/:uuid", getAllMessagesByChat);
// router.get("/chat/mychats/:uuid", getAllChatsByUser);

/*event*/
router.post("/event/create", checkToken, createEvent);
router.put("/event/update", checkToken, updateEvent);
router.get("/event/all", checkToken, getAllEvents);
// get all events by user in url
router.get("/event/myevents/:uuid", checkToken, getAllEventsByUser);
// router.get("/event/myevents", getAllEventsByUser);
router.post("/event/join", checkToken, joinEvent);

/*offer*/
router.get("/offer/all", checkToken, getAllOffers);
router.put("/offer/update", checkToken, updateOffer);
router.post("/offer/create", checkToken, createOffer);
router.get("/offer/myoffers/:uuid", checkToken, getAllOffersByUser);
router.post("/offer/contact", checkToken, contactSeller);

/*category*/
router.post("/category/create", createCategory);

module.exports = router;
