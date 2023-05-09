const { Category } = require("../models");

/* Category create */
const createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      name: req.body.name,
    });

    return res.status(200).json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Category can not be created");
  }
};

module.exports = {
  createCategory,
};
