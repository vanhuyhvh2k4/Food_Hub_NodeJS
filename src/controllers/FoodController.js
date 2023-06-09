import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from 'firebase/storage'
import path from 'path';
import db from '../config/db.config.js';

class FoodController {
    //[GET] baseURL/food/info
    async getFood(req, res) {
        try {
            const foodName = req.query.foodName;
            const shopName = req.query.shopName;

            const numOfFood = await db.promise().query('SELECT COUNT(food_item.id) AS num FROM food_item JOIN shop ON shop.id = food_item.shopId WHERE shop.name = ?', [shopName]);

            db.query('SELECT shop.name AS shopName, shop.image AS shopImage, shop.place, shop.isTick, food_item.id, food_item.name, food_item.image, food_item.description,food_item.price FROM food_item JOIN shop ON shop.id = food_item.shopId WHERE food_item.name = ? AND shop.name = ?', ([foodName, shopName]), (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        code: 'food/getFood.success',
                        message: 'success',
                        data: {
                            ...result[0],
                            num: numOfFood[0][0].num
                        }
                    });
                } else {
                    res.status(404).json({
                        code: 'food/getFood.notFound',
                        message: 'dont found food',
                    });
                }
            })
        } catch (error) {
            res.status(500).json([{
                code: 'food/getFood.error',

                error: error.message
            }])
        }
    }

    //[PATCH] baseUrl/food/like/:foodId
    changeLike(req, res) {
        try {
            const userId = req.user.id;
            const foodId = req.params.foodId;
            const status = req.body.statusLike;

            if (status === true) {
                db.query('DELETE FROM food_like WHERE foodId = ? AND userId = ?', ([foodId, userId]), (err, result) => {
                    if (err) throw err;
                    if (result) {
                        res.status(200).json({
                            code: 'food/changeLike.success',
                            message: 'success',
                        });
                    } else {
                        res.status(404).json({
                            code: 'food/changeLike.notFound',
                            message: 'dont find food or user'
                        });
                    }
                })
            } else if (status === false) {
                db.query('INSERT INTO food_like (userId, foodId) VALUES (?, ?)', ([userId, foodId]), (err, result) => {
                    if (err) throw err;
                    if (result) {
                        res.status(200).json({
                            code: 'food/changeLike.success',
                            message: 'success',
                        });
                    } else {
                        res.status(404).json({
                            code: 'food/changeLike.notFound',
                            message: 'dont find food or user'
                        });
                    }
                })
            }
        } catch (error) {
            res.status(500).json({
                code: 'food/changeLike.error',

                error: error.message
            });
        }
    }

    //[POST] baseUrl/food/food
    async newFood(req, res) {
        try {
            const userId = req.user.id;
            const name = req.body.name;
            const categoryId = req.body.categoryId;
            const description = req.body.description;
            const price = req.body.price;
            const storage = getStorage();
            const storageRef = ref(storage, `food_image/${userId}-${name}${path.extname(req.file.originalname)}`);

            //get shop id
            const shopId = await db.promise().query('SELECT shop.id FROM shop JOIN user ON user.id = shop.userId WHERE user.id = ?', [userId])

            // //upload
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer);
            const url = await getDownloadURL(snapshot.ref);

            db.query('INSERT INTO food_item(foodCategoryId, shopId, name, image, description, price) VALUES (?, ?, ?, ?, ?, ?)', ([categoryId, shopId[0][0].id, name, url, description, price]), (err, result) => {
                if (err) throw err;
                if (result) {
                    res.status(200).json({
                        code: 'food/newFood.success',
                        message: 'add food successfully'
                    });
                } else {
                    res.status(404).json({
                        code: 'food/newFood.notFound',
                        message: 'add food not found'
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'food/newFood.error',

                error: error.message
            })
        }
    }

    //[GET] baseURL/food/favorite
    getFavoriteFood(req, res) {
        try {
            const userId = req.user.id;

            db.query('SELECT food_item.id, shop.name AS shopName, food_item.name, food_item.image, food_item.description, food_item.price FROM food_item JOIN food_like ON food_like.foodId = food_item.id JOIN user ON user.id = food_like.userId JOIN shop ON food_item.shopId = shop.id WHERE user.id = ?', ([userId]), (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        code: 'favorite/getFoodFavorite.success',
                        message: 'Success',
                        data: {
                            foodList: result
                        }
                    })
                } else {
                    res.status(404).json({
                        code: 'favorite/getFoodFavorite.notFound',
                        message: 'Not Found any food'
                    })
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'favorite/getFoodFavorite.error',

                error: error.message
            })
        }
    }
}

export default new FoodController;