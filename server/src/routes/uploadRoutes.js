import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
const router = Router(); const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_request, file, done) => done(null, file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') });
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
router.post('/', upload.single('file'), (request, response, next) => {
  if (!request.file) return response.status(400).json({ message: 'Upload an image or PDF file.' });
  if (!process.env.CLOUDINARY_CLOUD_NAME) return response.status(503).json({ message: 'Cloudinary is not configured.' });
  const isPdf = request.file.mimetype === 'application/pdf';
  const filename = request.file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'resume';
  const stream = cloudinary.uploader.upload_stream({ resource_type: isPdf ? 'raw' : 'image', folder: 'adnan-portfolio', ...(isPdf && { public_id: `${filename}-${Date.now()}.pdf` }) }, (error, result) => error ? next(error) : response.status(201).json({ url: isPdf ? result.secure_url.replace('/upload/', `/upload/fl_attachment:${filename}.pdf/`) : result.secure_url, publicId: result.public_id }));
  stream.end(request.file.buffer);
});
export default router;
