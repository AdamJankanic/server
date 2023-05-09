const signup = (req, res) => {
  const { email } = req.body;

  res.status(201).json("Signup");
};

/* Export */
module.exports = {
  signup,
};
