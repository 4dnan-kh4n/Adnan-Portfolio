import { Router } from 'express';
import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import About from '../models/About.js';
import Achievement from '../models/Achievement.js';
import Contact from '../models/Contact.js';
import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import Hero from '../models/Hero.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';

const router = Router();
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

router.get('/resume', async (_request, response, next) => {
  try {
    const hero = await Hero.findOne().lean();
    const path = hero?.resumeUrl && new URL(hero.resumeUrl).pathname.split('/upload/')[1];
    const publicId = path?.replace(/^fl_attachment:[^/]+\//, '').replace(/^v\d+\//, '');
    if (!publicId) return response.status(404).json({ message: 'Resume not found.' });
    const file = await fetch(cloudinary.utils.private_download_url(publicId, 'pdf', { resource_type: 'raw', type: 'upload', attachment: true }));
    if (!file.ok || !file.body) return response.status(502).json({ message: 'Resume could not be downloaded.' });
    response.set({ 'Content-Type': file.headers.get('content-type') || 'application/pdf', 'Content-Disposition': 'attachment; filename="Adnan-Khan-Resume.pdf"' });
    Readable.fromWeb(file.body).pipe(response);
  } catch (error) { next(error); }
});

router.get('/portfolio', async (_request, response, next) => {
  try {
    const [hero, about, skills, experience, education, projects, achievements, contact] = await Promise.all([
      Hero.findOne().lean(), About.findOne().lean(), Skill.find().sort({ createdAt: 1 }).lean(), Experience.find().sort({ startDate: -1 }).lean(), Education.find().sort({ startYear: -1 }).lean(), Project.find().lean(), Achievement.find().lean(), Contact.findOne().lean()
    ]);
    response.json({ hero, about, skills, experience, education, projects, achievements, contact });
  } catch (error) { next(error); }
});

export default router;
