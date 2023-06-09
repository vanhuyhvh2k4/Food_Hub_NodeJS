import express from 'express';
import multer from 'multer';
const router = express.Router();
import FoodController from '../controllers/FoodController.js';
import verifyToken from '../middlewares/VerifyToken.middlewares.js';
import multerErrorMiddleware from '../middlewares/MulterError.middleware.js';

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        const error = new Error('Only JPG, PNG, and WebP files are allowed');
        error.status = 400; // Set the error status code
        cb(error)
    }
}

const upload = multer({storage: multer.memoryStorage(), fileFilter});

router.get('/info', FoodController.getFood);

router.patch('/like/:foodId', verifyToken.verifyTokenJWT, FoodController.changeLike);

router.post('/food', verifyToken.verifyTokenJWT, upload.single('image'), multerErrorMiddleware, FoodController.newFood);

router.get('/favorite', verifyToken.verifyTokenJWT, FoodController.getFavoriteFood);

export default router;

