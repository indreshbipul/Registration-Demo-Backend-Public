const authRoutes = require('express').Router()

const authControllers = require('../controllers/authControllers')

authRoutes.post('/addhar',authControllers.addharverify)
authRoutes.post('/otp',authControllers.otpValidation )
authRoutes.post('/pan',authControllers.panVerify )

module.exports = authRoutes