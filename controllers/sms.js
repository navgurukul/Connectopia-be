const request = require("request");
require("dotenv").config();

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
      return res.status(400).json({ message: "Mobile number is required" });
    }
    //10 digit mobile number will be received in the request
    const mobielWithCode = "+91" + mobile;
    const otpURL = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${mobielWithCode}`;

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
          return res.status(500).send("Failed to send OTP.");
        }

        const responseBody = JSON.parse(body);
        if (responseBody.type === "success") {
          res.status(200).json({ message: "OTP sent successfully." });
        } else {
          res.status(400).json({ message: responseBody.message });
        }
      }
    );
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
    if (!mobile || !otp) {
      return res
        .status(400)
        .json({ message: "Mobile number and OTP are required" });
    }
    if (!mobile) {
      return res.status(400).send("Mobile number is required.");
    }
    //10 digit mobile number will be received in the request
    const mobielWithCode = "+91" + mobile;
    const verifyOtpURL = `https://control.msg91.com/api/v5/otp/verify?&mobile=${mobielWithCode}&otp=${otp}`;

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
          return res.status(500).send("Failed to verify OTP.");
        }

        const responseBody = JSON.parse(body);
        if (responseBody.type === "success") {
          res.status(200).json({ message: "OTP verified successfully." });
        } else {
          res.status(400).json({ message: responseBody.message });
        }
      }
    );
  },
};
