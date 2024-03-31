const express = require("express");
const router = express.Router();
const Joi = require("joi");
const smsController = require("../controllers/sms");

// validate mobile number
const numberSchema = Joi.object({
  mobile: Joi.string()
    .regex(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be a 10-digit number",
    }),
});

// Middleware to validate mobile number
const mobileValidator = (req, res, next) => {
  const { error } = numberSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// /sendotp/:mobilenumber
router.post("/otp/send/:mobile", mobileValidator, smsController.sendOtp);
// /verifyOtp/:mobilenumber/:otp
router.post("/otp/verify/:mobile/:otp", smsController.verifyOtp);

module.exports = router;
