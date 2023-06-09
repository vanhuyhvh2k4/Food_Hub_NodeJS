import db from '../config/db.config.js';

const authMiddleware = {
    checkEmail: (req, res, next) => {
        try {
            const email = req.body.email;

            db.query(`SELECT * FROM user WHERE email='${email}'`, (err, users) => {
                if (err) throw err;

                if (users.length) {
                    res.status(409).json({
                        code: 'auth/checkEmail.conflict',
                        message: 'Email already exists'
                    })
                } else {
                    next();
                }
            })
        } catch (error) {
            res.status(500).json({
                code: 'auth/checkEmail.error',

                error: error
            })
        }
    },
}

export default authMiddleware;