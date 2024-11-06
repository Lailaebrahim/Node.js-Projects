const multer  = require('multer');
const path = require('path');
const appError = require('./error');


const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/userAvatar'));
    },
    filename: function (req, file, cb) {
        const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const avatarFilter = (req, file, cb) =>{
    const mimetype = file.mimetype.split('/')[0];
    if(mimetype === 'image'){
        return cb(null, true);
    }
    else{
        return cb(new appError().createError(400, "Avatar must be an image file"), false);
    }
}

const uploadAvatar = multer({ storage: avatarStorage, fileFilter: avatarFilter });

module.exports = { uploadAvatar };
