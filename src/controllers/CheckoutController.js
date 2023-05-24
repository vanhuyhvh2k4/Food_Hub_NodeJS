import db from "../config/db.config.js";

class CheckoutController {

    //[POST] baseUrl/checkout/cart
    addCart (req, res) {
        try {
            const userId = req.user.id;
            const foodId = req.body.foodId;
            const quantity = req.body.quantity;

            db.query('INSERT INTO cart(userId, foodId, quantity) VALUES (?, ?, ?)', ([userId, foodId, quantity]), (err, result) => {
                if (err) throw err;

                if (result) {
                    res.status(200).json({
                        code: 'checkout/addCart.success',
                        message: 'added to cart'
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/addCart.error',
                message: 'something went wrong',
                error: error.message
            })
        }
    }

    //[GET] baseUrl/checkout/number
    getNumber (req, res) {
        try {
            const userId = req.user.id;

            db.query('SELECT COUNT(cart.id) AS num FROM cart WHERE cart.userId = ?', [userId], (err, result) => {
                if (err) throw err;
                if (result) {
                    res.status(200).json({
                        data: {
                            code: 'checkout/getNumber.success',
                            message: 'successful',
                            num: result[0].num
                        }
                    });
                } else {
                    res.status(404).json({
                        code: 'checkout/getNumber.notFound',
                        message: 'not found userId'
                    })
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/getNumber.error',
                message: 'something went wrong',
                error: error.message
            });
        }
    }

    //[GET] baseUrl/checkout/cart
    getCart (req, res) {
        try {
            const userId = req.user.id;

            db.query('SELECT cart.id, food_item.name, food_item.image, food_item.price, cart.quantity, shop.name AS shopName FROM cart JOIN user ON user.id = cart.userId JOIN food_item ON food_item.id = cart.foodId JOIN shop ON food_item.shopId = shop.id WHERE user.id = ?', [userId], (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        data: {
                            code: 'checkout/getCart.success',
                            message: 'successful',
                            listCart: result
                        }
                    })
                } else {
                    res.status(404).json({
                        data: {
                            code: 'checkout/getCart.notFound',
                            message: 'not found userId'
                        }
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/getCart.error',
                message: 'something went wrong',
                error: error.message
            })
        }
    }

    //[DELETE] baseUrl/checkout/cart/:cartId
    deleteCart (req, res) {
        try {
            const userId = req.user.id;
            const cartId = req.params.cartId;

            db.query('DELETE FROM cart WHERE id = ? AND userId = ?', ([cartId, userId]), (err, result) => {
                if (err) throw err;
                if (result) {
                    res.status(200).json({
                        data: {
                            code: 'checkout/deleteCart.success',
                            message: 'successful',
                        }
                    });
                } else {
                    res.status(404).json({
                        code: 'checkout/deleteCart.notFound',
                        message: 'not found userId or cartId'
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/deleteCart.error',
                message: 'something went wrong',
                error: error.message
            });
        }
    }

    //[GET] baseUrl/checkout/bill
    getBill (req, res) {
        try {
            const cartId = req.query.cartId;
            db.query('SELECT cart.id, food_item.id AS foodId, food_item.name, food_item.image, food_item.price, cart.quantity, shop.shipFee FROM cart JOIN food_item ON food_item.id = cart.foodId JOIN shop ON shop.id = food_item.shopId WHERE cart.id = ?', [cartId], (err, result) => {
                if (err) throw err;
                if (result.length) {
                    const totalOfFood = result[0].price * result[0].quantity;
                    const total = (result[0].price * result[0].quantity) + result[0].shipFee;

                    res.status(200).json({
                        data: {
                            code: 'checkout/getBill.success',
                            message: 'successful',
                            bill: {
                                ...result[0],
                                totalOfFood,
                                total
                            }
                        }
                    });
                } else {
                    res.status(404).json({
                        data: {
                            code: 'checkout/getBill.notFound',
                            message: 'not found cartId',
                        }
                    });
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/getBill.error',
                message: 'something went wrong',
                error: error.message
            });
        }
    }

    //[POST] baseUrl/checkout/order
    async order (req, res) {
        try {
            const cartId = req.body.cartId;
            const userId = req.user.id;
            const foodId = req.body.foodId;
            const quantity = req.body.quantity;

            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const time = hours + '/' + minutes + '/' + seconds + '/' + day + '/' + month + '/' + year;

            await db.promise().query('DELETE FROM cart WHERE id = ? AND userId = ?', ([cartId, userId]));

            db.query('INSERT INTO food_order(userId, foodId, quantity, timestamp) VALUES (?, ?, ?, ?)', ([userId, foodId, quantity, time]), (err, result) => {
                if (err) throw err;
                if (result) {
                    res.status(200).json({
                        data: {
                            code: 'checkout/order.success',
                            message: 'order successfully'
                        }
                    })
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/order.error',
                message: 'something went wrong',
                error: error.message
            })
        }
    }

    //[GET] baseUrl/checkout/order
    myOrder (req, res) {
        try {
            const userId = req.user.id;

            db.query('SELECT food_order.id, food_item.name, food_item.image, food_item.price, shop.name AS shopName, shop.isTick, food_order.status, food_order.quantity FROM food_order JOIN food_item ON food_item.id = food_order.foodId JOIN shop ON shop.id = food_item.shopId WHERE food_order.userId = ?', ([userId]), (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        data: {
                            code: 'checkout/myOrder.success',
                            message: 'successfully',
                            list: result
                        }
                    })
                } else {
                    res.status(404).json({
                        code: 'checkout/myOrder.notFound',
                        message: 'not found userId or user is not order'
                    })
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'checkout/myOrder.error',
                message: 'something went wrong',
                error: error.message
            })
        }
    }
}

export default new CheckoutController;