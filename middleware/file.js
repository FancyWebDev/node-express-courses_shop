const multer = require('multer')

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'images')
  },
  filename(req, file, callback) {
    callback(null, file.originalname)
  }
})

const fileFilter = (req, file, callback) => {
  if(allowedTypes.includes(file.mimetype)) {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

module.exports = multer({
  storage, fileFilter
}) 