const express = require("express")
const router = express.Router()
const multer = require("multer")
const auth = require("../middleware/auth")
const bookController = require("../controllers/bookController")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get("/bestrating", bookController.getBestRatedBooks)
router.post("/", auth, upload.single("image"), bookController.createBook)
router.put("/:id", auth, upload.single("image"), bookController.updateBook)
router.delete("/:id", auth, bookController.deleteBook)
router.get("/", bookController.getBooks)
router.get("/:id", bookController.getBookById)
router.post("/:id/rating", auth, bookController.rateBook)

module.exports = router