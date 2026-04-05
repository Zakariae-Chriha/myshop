const express    = require('express');
const router     = express.Router();
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});
console.log('[Cloudinary] cloud_name:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
});

router.post('/image', protect, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const b64     = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'myshop',
    });

    res.json({
      message: 'Image uploaded successfully',
      url:     result.secure_url,
    });
  } catch (error) {
    console.log('Cloudinary error:', JSON.stringify(error));
    const msg = error.message || error?.error?.message || 'Cloudinary upload failed';
    res.status(500).json({ message: msg });
  }
});

module.exports = router;