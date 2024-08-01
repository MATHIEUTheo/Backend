const express = require('express');
const router = express.Router();
const multer = require('multer');
const Book = require('../models/book');
const auth = require('../middleware/auth');
const path = require('path');
const mongoose = require('mongoose');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
	  destination: function (req, file, cb) {
		      cb(null, 'uploads/');
		    },
	  filename: function (req, file, cb) {
		      cb(null, Date.now() + '-' + file.originalname);
		    }
});

const upload = multer({ storage: storage });

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';

router.get('/bestrating', async (req, res) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 }) // Trier par note moyenne décroissante
      .limit(3); // Limiter à 3 résultats

    res.status(200).json(bestRatedBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
	  try {
		  //console.log("Utilisateur connecté :", req.user)
		      const bookData = JSON.parse(req.body.book);
			  console.log (bookData);
  
	//let imageUrl = null;
    //if (req.file) {
      // Redimensionner l'image avec sharp
      //const resizedImageBuffer = await sharp(req.file.path)
      //  .resize({ width: 300, height: 300, fit: sharp.fit.contain, background: { r: 255, g: 255, b: 255, alpha: 0.5 } }) // Définir la largeur et la hauteur souhaitées
      //  .toBuffer();

      // Remplacer l'image originale par l'image redimensionnée
      //fs.writeFileSync(req.file.path, resizedImageBuffer);

     // imageUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
    //}

	  const imageUrl = req.file ? `${SERVER_URL}/uploads/${req.file.filename}` : null;

		      const newBook = new Book({
			            ...bookData,
			            imageUrl: imageUrl,
			      userId: req.user._id
			          });
			try {
		      const savedBook = await newBook.save();
		      res.status(201).json(savedBook);
			} catch (err) {
				console.error(err);
				res.status(400).json({ message: err.message, error: err });
			  }
		    } catch (err) {
			        res.status(400).json({ message: err.message });
			      }


});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
	 console.log("ID du livre:", req.params.id);
	  try {
		      const book = await Book.findById(req.params.id);
		      if (!book) {
			            return res.status(404).json({ message: 'Book not found' });
			          }
		      if (book.userId !== req.user._id) {
			            return res.status(403).json({ message: 'Access denied' });
			          }
					  // supprimer l'image anterieur

			  const imageUrl = req.file ? `${SERVER_URL}/uploads/${req.file.filename}` : book.imageUrl;
			  if (imageUrl && imageUrl!=book.imageUrl) {
				const imagePath = path.join(__dirname, '..', book.imageUrl.replace(SERVER_URL, ''));
				fs.unlink(imagePath, (err) => {
				  if (err) {
					console.error('Erreur lors de la suppression de l\'image :', err);
				  } else {
					console.log('Image supprimée avec succès :', imagePath);
				  }
				});
			  }
		      let bookData;
		      if (req.body.book) {
			            bookData = JSON.parse(req.body.book)
						bookData.imageUrl = imageUrl
			  } else {
				bookData = req.body
				bookData.imageUrl = imageUrl
			}
			 console.log (bookData);

// let imageUrl = null;
//   if (req.file) {
//       // Redimensionner l'image avec sharp
//       const resizedImageBuffer = await sharp(req.file.path)
//         .resize({ width: 300, height: 300, fit: sharp.fit.contain, background: { r: 255, g: 255, b: 255, alpha: 0.5 }}) // Définir la largeur et la hauteur souhaitées
//         .toBuffer();

//       // Remplacer l'image originale par l'image redimensionnée
//       fs.writeFileSync(req.file.path, resizedImageBuffer);

//       bookData.imageUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
//     }

	
	//console.log(imageUrl)

		      const updatedBook = await Book.findByIdAndUpdate(req.params.id, bookData, { new: true });
		      res.status(200).json(updatedBook);
		    } catch (err) {
			        res.status(400).json({ message: err.message });
			      }
});

router.delete('/:id', auth, async (req, res) => {
	 console.log("ID du livre:", req.params.id);
	  try {
		      const book = await Book.findById(req.params.id);
		      if (!book) {
			            return res.status(404).json({ message: 'Book not found' });
			          }
		      if (book.userId !== req.user._id) {
			            return res.status(403).json({ message: 'Access denied' });
			          }
    if (book.imageUrl) {
      const imagePath = path.join(__dirname, '..', book.imageUrl.replace(SERVER_URL, '')); // Construire le chemin absolu vers l'image
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'image :', err);
          // Gérer l'erreur ici si nécessaire, par exemple, en renvoyant une erreur au client
        } else {
          console.log('Image supprimée avec succès :', imagePath);
        }
      });
    }

		  	      if (book.imageUrl) {
			              const imagePath = path.join(__dirname, '..', book.imageUrl);
			              fs.unlink(imagePath, (err) => {
					                if (err) {
								            console.error('Error deleting image file:', err);
								          }
					              });
			            }
		      await book.deleteOne();
		      res.status(200).json({ message: 'Book deleted successfully' });
		    } catch (err) {
			        res.status(500).json({ message: err.message });
			      }
});

router.get('/', async (req, res) => {
	  try {
		      const books = await Book.find();
		      res.status(200).json(books);
		    } catch (err) {
			        res.status(500).json({ message: err.message });
			      }
});

router.get('/:id', async (req, res) => {
	  try {
		      const book = await Book.findById(req.params.id);
		      if (!book) {
			            return res.status(404).json({ message: 'Book not found' });
			          }
			  console.log (book)
		      res.status(200).json(book)
			  
		    } catch (err) {
			        res.status(500).json({ message: err.message });
			      }
				  
});

router.post('/:id/rating', auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("bookId:", bookId);
    const userId = req.user._id;
    console.log("userId:", userId);
	  const { rating } = req.body;
	  console.log("vote:", rating);

  if (!mongoose.Types.ObjectId.isValid(bookId)) { // <-- Vérification ici
	      return res.status(400).json({ message: "ID de livre invalide." });
	    }

    // Trouver le livre
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà voté pour ce livre
    const existingRatingIndex = book.ratings.findIndex(rating =>
	 new mongoose.Types.ObjectId(rating.userId).equals(new mongoose.Types.ObjectId(userId))     
    );

    if (existingRatingIndex !== -1) {
      return res.status(400).json({ message: 'Vous avez déjà voté pour ce livre' });
    }
  if (!rating) {
	      return res.status(400).json({ message: "La note ('rating') est obligatoire." });
	    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId: userId.toString(), grade: rating });

    // Mettre à jour la note moyenne
    const totalRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
    book.averageRating = totalRating / book.ratings.length;

    // Sauvegarder le livre mis à jour
    const updatedBook = await book.save(); // Sauvegarder et récupérer le livre mis à jour
    res.status(201).json(updatedBook);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function calculateAverageRating(ratings) {
  if (ratings.length === 0) {
    return 0;
  }
  const totalRating = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return totalRating / ratings.length;
}

module.exports = router;

