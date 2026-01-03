const multer = require("multer");
const cloudinary = require("./cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "products",
  allowedFormats: ["jpg", "jpeg", "png"],
});

const upload = multer({ storage });

module.exports = upload;
