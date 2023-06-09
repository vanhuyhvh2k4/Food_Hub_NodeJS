import db from '../config/db.config.js';

class HomeController {

    //[GET] baseURL/home/user
    getUser(req, res) {
        try {
            const userId = req.user.id;
            db.query('SELECT id, fullName, avatar, email, phone, address from user WHERE id = ?', [userId], (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        code: 'home/getUser.success',
                        message: 'Success',
                        data: {
                            currentUser: result[0]
                        }
                    })
                } else {
                    res.status(404).json({
                        code: 'home/getUser.notFound',
                        message: 'User is not exists'
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'home/getUser.error',

                error: error.message
            })
        }
    }

    //[GET] baseURL/home/shop
    getShop(req, res) {
        try {
            const userId = req.user.id;
            const foodType = req.query.foodType;

            db.query('SELECT shop.id, shop.name, shop.image, shop.isTick, shop.shipFee, shop.timeShipping, IF(shop_like.id IS NULL, 0, 1) as liked FROM shop INNER JOIN food_item ON shop.id = food_item.shopId INNER JOIN food_category ON food_item.foodCategoryId = food_category.id LEFT JOIN shop_like ON shop.id = shop_like.shopId AND shop_like.userId = ? WHERE food_category.name = ? GROUP BY shop.name', ([userId, foodType]), (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        code: 'home/getShop.success',
                        message: 'Success',
                        data: {
                            shopList: result
                        }
                    });
                } else {
                    res.status(404).json({
                        code: 'home/getShop.notFound',
                        message: 'Dont found the shop',
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'home/getUser.error',

                error: error.message
            })
        }
    }

    //[GET] baseURL/home/food
    getFood(req, res) {
        try {
            const userId = req.user.id;
            const foodType = req.query.foodType;

            db.query('SELECT shop.name AS shopName, food_item.id, food_item.name, food_item.image, food_item.description, food_item.price, shop.place, IF (food_like.id IS null, 0, 1) as liked FROM food_item JOIN food_category ON food_item.foodCategoryId = food_category.id JOIN shop ON food_item.shopId = shop.id LEFT JOIN food_like ON food_like.foodId = food_item.id AND food_like.userId = ? WHERE food_category.name = ? GROUP BY food_item.name', ([userId, foodType]), (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        code: 'home/getFood.success',
                        message: 'Success',
                        data: {
                            foodList: result
                        }
                    });
                } else {
                    res.status(404).json({
                        code: 'home/getFood.notFound',
                        message: 'Dont found the food',
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'home/getUser.error',

                error: error.message
            })
        }
    }
}

export default new HomeController;