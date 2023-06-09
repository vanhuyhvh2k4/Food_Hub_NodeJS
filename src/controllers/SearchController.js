import db from '../config/db.config.js';

class SearchController {

    //[POST]baseURL/search/
    search(req, res) {
        try {
            const foodName = req.query.foodName;
            if (foodName.length) {
                db.query('SELECT id, name, image FROM food_item WHERE name LIKE ? GROUP BY name', [`%${foodName}%`], (err, result) => {
                    if (err) throw err;

                    if (!result.length) {
                        res.status(404).json({
                            code: 'home/search.notFound',
                            message: 'No results found'
                        })
                    } else {
                        res.status(200).json({
                            code: 'home/search.success',
                            message: 'Success',
                            data: result
                        })
                    }
                });
            }
        } catch (error) {
            res.status(500).json({
                code: 'home/search.error',

                error: error.message
            })
        }
    }

    //[GET] baseUrl/search/result
    result(req, res) {
        try {
            const userId = req.user.id;
            const keyword = req.query.keyword;

            db.query('SELECT food_item.id, shop.name AS shopName, shop.place, food_item.name, food_item.image, food_item.description, food_item.price, IF (food_like.id IS null, 0, 1) as liked FROM food_item JOIN shop ON shop.id = food_item.shopId LEFT JOIN food_like ON food_like.foodId = food_item.id AND food_like.userId = ? WHERE food_item.name LIKE ?', ([userId, `%${keyword}%`]), (err, result) => {
                if (err) throw err;
                if (result.length) {
                    res.status(200).json({
                        code: 'food/searchResult.success',
                        message: 'search result successfully',
                        data: result
                    })
                } else {
                    res.status(404).json({
                        code: 'food/searchResult.notFound',
                        message: 'search result not found'
                    })
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'food/searchResult.error',

                error: error.message
            });
        }
    }
}

export default new SearchController;