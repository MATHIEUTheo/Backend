const Book = require("../models/book")
const sharp = require("sharp")
const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000"

exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(3)
    res.status(200).json(bestRatedBooks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createBook = async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book)
    let imageUrl = null
    if (req.file) {
      const filename = Date.now() + "-" + req.file.originalname
      const outputPath = path.join("images", filename)
      await sharp(req.file.buffer)
        .resize(500)
        .toFormat("jpeg", { quality: 80 })
        .toFile(outputPath)
      imageUrl = `${SERVER_URL}/images/${filename}`
    }
    const newBook = new Book({ ...bookData, imageUrl: imageUrl, userId: req.user._id })
    const savedBook = await newBook.save()
    res.status(201).json(savedBook)
  } catch (err) {
    res.status(400).json({ message: err.message, error: err })
  }
}

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: "Livre non trouvé" })
    if (book.userId !== req.user._id) return res.status(403).json({ message: "Accès refusé" })
    let imageUrl = book.imageUrl
    if (req.file) {
      const filename = Date.now() + "-" + req.file.originalname
      const outputPath = path.join("images", filename)
      await sharp(req.file.buffer)
        .resize(500)
        .toFormat("jpeg", { quality: 80 })
        .toFile(outputPath)
      imageUrl = `${SERVER_URL}/images/${filename}`
    }
    if (imageUrl && imageUrl != book.imageUrl) {
      const imagePath = path.join(__dirname, "..", book.imageUrl.replace(SERVER_URL, ""))
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Erreur lors de la suppression de l'image :", err)
        else console.log("Image supprimée avec succès :", imagePath)
      })
    }
    let bookData = req.body.book ? JSON.parse(req.body.book) : req.body
    bookData.imageUrl = imageUrl
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, bookData, { new: true })
    res.status(200).json(updatedBook)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: "Livre non trouvé" })
    if (book.userId !== req.user._id) return res.status(403).json({ message: "Accès refusé" })
    if (book.imageUrl) {
      const imagePath = path.join(__dirname, "..", book.imageUrl.replace(SERVER_URL, ""))
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Erreur lors de la suppression de l'image :", err)
        else console.log("Image supprimée avec succès :", imagePath)
      })
    }
    await book.deleteOne()
    res.status(200).json({ message: "Livre supprimée avec succès" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find()
    res.status(200).json(books)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: "Livre non trouvé" })
    res.status(200).json(book)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.rateBook = async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user._id
    const { rating } = req.body
    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ message: "Livre non trouvé" })
    const existingRatingIndex = book.ratings.findIndex((rating) =>
      new mongoose.Types.ObjectId(rating.userId).equals(new mongoose.Types.ObjectId(userId))
    )
    if (existingRatingIndex !== -1) return res.status(400).json({ message: "Vous avez déjà voté pour ce livre" })
    if (!rating) return res.status(400).json({ message: "La note est obligatoire." })
    book.ratings.push({ userId: userId.toString(), grade: rating })
    const totalRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0)
    book.averageRating = totalRating / book.ratings.length
    const updatedBook = await book.save()
    res.status(201).json(updatedBook)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}