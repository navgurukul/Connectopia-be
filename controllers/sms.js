const request = require("request");
require("dotenv").config();
const responseWrapper = require("../helpers/responseWrapper");

//-----------MSG91 configyration----------
const templateId = process.env.TEMPLATE_ID;
const authKey = process.env.AUTH_KEY;

module.exports = {
  // send otp
  sendOtp: async (req, res) => {
    /* 
      #swagger.tags = ['SMS/OTP']
      #swagger.summary = ' - Send OTP to mobile number'
      #swagger.parameters['mobile'] = {in: 'path', description: '10 digit mobile number', required: true, type: 'string', pattern: '^[0-9]{10}$'}
  */
    const { mobile } = req.params;
    if (!mobile) {
      const resp = responseWrapper(null, "Mobile number is required", 400);
      return res.status(400).json(resp);
    }
    //10 digit mobile number will be received in the request
    const mobielWithCode = "+91" + mobile;
    const otpURL = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${mobielWithCode}`;

    try {
      // sending otp
      request.post(
        otpURL,
        {
          headers: {
            authkey: authKey,
          },
        },
        (error, response, body) => {
          if (error) {
            console.error("Error sending OTP:", error);
            const resp = responseWrapper(null, "Failed to send OTP.", 500);
            return res.status(500).json(resp);
          }

          const responseBody = JSON.parse(body);
          if (responseBody.type === "success") {
            const resp = responseWrapper(null, "OTP send successfully", 200);
            return res.status(200).json(resp);
          } else {
            const resp = responseWrapper(null, responseBody.message, 400);
            return res.status(400).json({ message: responseBody.message });
          }
        }
      );
    } catch (error) {
      const resp = responseWrapper(null, "Failed to send OTP.", 500);
      return res.status(500).json(resp);
    }
  },

  // verify otp
  verifyOtp: async (req, res) => {
    /* 
      #swagger.tags = ['SMS/OTP']
      #swagger.summary = ' - verify OTP to mobile number'
      #swagger.parameters['mobile'] = {in: 'path', description: '10 digit mobile number', required: true, type: 'string', pattern: '^[0-9]{10}$'}
      #swagger.parameters['otp'] = {in: 'path', required: true, type: 'string', pattern: '^[0-9]{4}$'}
  */
    const { mobile, otp } = req.params;
    if (!mobile && !otp) {
      const resp = responseWrapper(null, "Mobile number and OTP are required", 400);
      return res.status(400).json(resp);
    }
    //10 digit mobile number will be received in the request
    const mobielWithCode = "+91" + mobile;
    const verifyOtpURL = `https://control.msg91.com/api/v5/otp/verify?&mobile=${mobielWithCode}&otp=${otp}`;

    try {
      // verification of otp
      request.post(
        verifyOtpURL,
        {
          headers: {
            authkey: authKey,
          },
        },
        (error, response, body) => {
          if (error) {
            console.error("Error verifying OTP:", error);
            const resp = responseWrapper(null, "Failed to verify OTP.", 500);
            return res.status(500).json(resp);
          }

          const responseBody = JSON.parse(body);
          if (responseBody.type === "success") {
            const resp = responseWrapper(null, "OTP verified successfully.", 200);
            return res.status(200).json(resp);
          } else {
            const resp = responseWrapper(null, responseBody.message, 400);
            return res.status(400).json(resp);
          }
        }
      );
    } catch (error) {
      const resp = responseWrapper(null, "Failed to verify OTP.", 500);
      return res.status(500).json(resp);
    }
  },
};
