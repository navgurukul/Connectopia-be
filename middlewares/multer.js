const multer = require('multer');
const storage = multer.memoryStorage();


module.exports = {
    upload: (type) => {
        switch (type) {
            case 'mind':
                return multer({
                    storage: storage,
                    limits: { fileSize: 10 * 1024 * 1024 }, // 30MB for .mind files
                    // fileFilter: function (req, file, cb) {
                    //     if (file.mimetype === "application/x-mind") {
                    //         cb(null, true);
                    //     } else {
                    //         cb(new Error("Only .mind files are allowed"), false);
                    //     }
                    // }
                });

            case 'image':
                return multer({
                    storage: storage,
                    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for images
                    fileFilter: function (req, file, cb) {
                        const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml", "image/gif"];
                        if (allowedMimes.includes(file.mimetype)) {
                            cb(null, true);
                        } else {
                            cb(new Error("Only jpeg, jpg, png, svg, and gif files are allowed"), false);
                        }
                    }
                });

            // case 'gif':
            //     return multer({
            //         storage: storage,
            //         limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for gifs
            //         fileFilter: function (req, file, cb) {
            //             if (file.mimetype === "image/gif") {
            //                 cb(null, true);
            //             } else {
            //                 cb(new Error("Only gif files are allowed"), false);
            //             }
            //         }
            //     });

            default:
                throw new Error("Invalid type");
        }
    }
};