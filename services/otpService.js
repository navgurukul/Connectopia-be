// otpService.js

const request = require('request');
module.exports = {
    async sendOTP(mobilenumber, templateId, authKey) {
        return new Promise((resolve, reject) => {
            if (!mobilenumber) {
                return reject('Mobile number is required.');
            }

            const appendmobilenumber = '+91' + mobilenumber;
            const otpURL = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${appendmobilenumber}`;

            request.post(otpURL, {
                headers: {
                    'authkey': authKey
                }
            }, (error, response, body) => {
                if (error) {
                    console.error('Error sending OTP:', error);
                    return reject('Failed to send OTP.');
                }

                const responseBody = JSON.parse(body);
                if (responseBody.type === "success") {
                    resolve('OTP sent successfully.');
                } else {
                    reject(responseBody.message);
                }
            });
        });
    },


    async verifyOTP(mobilenumber, otp, authKey) {
        return new Promise((resolve, reject) => {
            if (!mobilenumber) {
                return reject('Mobile number is required.');
            }

            const appendmobilenumber = '+91' + mobilenumber;
            const verifyOtpURL = `https://control.msg91.com/api/v5/otp/verify?&mobile=${appendmobilenumber}&otp=${otp}`;

            request.post(verifyOtpURL, {
                headers: {
                    'authkey': authKey
                }
            }, (error, response, body) => {
                if (error) {
                    console.error('Error verifying OTP:', error);
                    return reject('Failed to verify OTP.');
                }

                const responseBody = JSON.parse(body);
                if (responseBody.type === "success") {
                    resolve('OTP verified successfully.');
                } else {
                    reject(responseBody.message);
                }
            });
        });
    }

};
