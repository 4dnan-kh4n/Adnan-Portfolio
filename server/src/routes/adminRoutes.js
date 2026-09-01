import { Router } from 'express';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser.js';
import About from '../models/About.js'; import Achievement from '../models/Achievement.js'; import Contact from '../models/Contact.js'; import Education from '../models/Education.js'; import Experience from '../models/Experience.js'; import Hero from '../models/Hero.js'; import Project from '../models/Project.js'; import Skill from '../models/Skill.js';

const router = Router();

router.get('/me', (request, response) => response.json({ admin: request.admin }));
router.post('/password', async (request, response, next) => { try { const { currentPassword, newPassword } = request.body; if (typeof newPassword !== 'string' || newPassword.length < 12) return response.status(400).json({ message: 'New password must be at least 12 characters.' }); const admin = await AdminUser.findById(request.admin.sub); if (!admin || !(await bcrypt.compare(currentPassword || '', admin.passwordHash))) return response.status(400).json({ message: 'Current password is incorrect.' }); admin.passwordHash = await bcrypt.hash(newPassword, 12); await admin.save(); response.json({ message: 'Password updated.' }); } catch (error) { next(error); } });
const models = { hero: Hero, about: About, skills: Skill, experience: Experience, education: Education, projects: Project, achievements: Achievement, contact: Contact };
router.use('/:section', (request, response, next) => models[request.params.section] ? next() : response.status(404).json({ message: 'Unknown section.' }));
router.get('/:section', async (request, response, next) => { try { const Model = models[request.params.section]; response.json(['hero', 'about', 'contact'].includes(request.params.section) ? await Model.findOne().lean() : await Model.find().lean()); } catch (error) { next(error); } });
router.post('/:section', async (request, response, next) => { try { const Model = models[request.params.section]; const singleton = ['hero', 'about', 'contact'].includes(request.params.section); response.status(201).json(singleton ? await Model.findOneAndUpdate({}, request.body, { upsert: true, new: true, runValidators: true }) : await Model.create(request.body)); } catch (error) { next(error); } });
router.put('/:section/:id', async (request, response, next) => { try { const item = await models[request.params.section].findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true }); if (!item) return response.status(404).json({ message: 'Item not found.' }); response.json(item); } catch (error) { next(error); } });
router.delete('/:section/:id', async (request, response, next) => { try { const item = await models[request.params.section].findByIdAndDelete(request.params.id); if (!item) return response.status(404).json({ message: 'Item not found.' }); response.status(204).end(); } catch (error) { next(error); } });

export default router;
