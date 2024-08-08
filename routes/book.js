const express = require("express")
const router = express.Router()
const multer = require("multer")
const Book = require("../models/book")
const auth = require("../middleware/auth")
const path = require("path")
const mongoose = require("mongoose")
const sharp = require("sharp")
const fs = require("fs")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000"

router.get("/bestrating", async (req, res) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 }) //ordre de tri décroisant
      .limit(3) //limite max a 3

    res.status(200).json(bestRatedBooks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book)

    let imageUrl = null
    if (req.file) {
      const filename = Date.now() + "-" + req.file.originalname
      const outputPath = path.join("uploads", filename)

      // Traiter l'image avec Sharp
      await sharp(req.file.buffer)
        .resize(500) // Redimensionner l'image à une largeur maximale de 500px
        .toFormat("jpeg", { quality: 80 }) // Convertir en JPEG avec une qualité de 80%
        .toFile(outputPath)

      imageUrl = `${SERVER_URL}/uploads/${filename}`
    }

    const newBook = new Book({
      ...bookData,
      imageUrl: imageUrl,
      userId: req.user._id,
    });
    try {
      const savedBook = await newBook.save()
      res.status(201).json(savedBook)
    } catch (err) {
      console.error(err)
      res.status(400).json({ message: err.message, error: err })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }
    if (book.userId !== req.user._id) {
      return res.status(403).json({ message: "Accès refusé" })
    }

    let imageUrl = book.imageUrl
    if (req.file) {
      const filename = Date.now() + "-" + req.file.originalname
      const outputPath = path.join("uploads", filename)

      // Traiter l'image avec Sharp
      await sharp(req.file.buffer)
        .resize(500) // Redimensionner l'image à une largeur maximale de 500px
        .toFormat("jpeg", { quality: 80 }) // Convertir en JPEG avec une qualité de 80%
        .toFile(outputPath)

      imageUrl = `${SERVER_URL}/uploads/${filename}`
    }
    if (imageUrl && imageUrl != book.imageUrl) {
      const imagePath = path.join(
        __dirname,
        "..",
        book.imageUrl.replace(SERVER_URL, "")
      )
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression de l'image :", err)
        } else {
          console.log("Image supprimée avec succès :", imagePath)
        }
      })
    }
    let bookData
    if (req.body.book) {
      bookData = JSON.parse(req.body.book)
      bookData.imageUrl = imageUrl
    } else {
      bookData = req.body;
      bookData.imageUrl = imageUrl
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, bookData, {
      new: true,
    })
    res.status(200).json(updatedBook)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete("/:id", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }
    if (book.userId !== req.user._id) {
      return res.status(403).json({ message: "Accès refusé" })
    }
    if (book.imageUrl) {
      const imagePath = path.join(
        __dirname,
        "..",
        book.imageUrl.replace(SERVER_URL, "")
      ) // Construire le chemin vers l'image
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression de l'image :", err)
        } else {
          console.log("Image supprimée avec succès :", imagePath)
        }
      })
    }

    await book.deleteOne();
    res.status(200).json({ message: "Livre supprimée avec succès" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/", async (req, res) => {
  try {
    const books = await Book.find()
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }
    res.status(200).json(book)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/:id/rating", auth, async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user._id
    const { rating } = req.body

    const book = await Book.findById(bookId)
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }

    // Vérifier si l'utilisateur a déjà voté pour ce livre
    const existingRatingIndex = book.ratings.findIndex((rating) =>
      new mongoose.Types.ObjectId(rating.userId).equals(
        new mongoose.Types.ObjectId(userId)
      )
    )

    if (existingRatingIndex !== -1) {
      return res
        .status(400)
        .json({ message: "Vous avez déjà voté pour ce livre" })
    }
    if (!rating) {
      return res
        .status(400)
        .json({ message: "La note est obligatoire." })
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId: userId.toString(), grade: rating })

    // Mettre à jour la note moyenne
    const totalRating = book.ratings.reduce(
      (sum, rating) => sum + rating.grade,
      0
    )
    book.averageRating = totalRating / book.ratings.length

    // Sauvegarder le livre mis à jour
    const updatedBook = await book.save()
    res.status(201).json(updatedBook)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router