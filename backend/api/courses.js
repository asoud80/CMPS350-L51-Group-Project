// api/courses.js
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all courses
router.get('/', async (req, res) => {
  try {
    const coursesPath = join(__dirname, '..', 'json-files', 'courses.json');
    const coursesData = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(coursesData);
    
    // Apply filters if provided
    let filteredCourses = [...courses];
    const { search, category } = req.query;
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course => 
        course.name.toLowerCase().includes(searchTerm) || 
        course.id.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category) {
      filteredCourses = filteredCourses.filter(course => 
        course.category === category
      );
    }
    
    res.json({
      data: filteredCourses,
      meta: {
        total: filteredCourses.length,
        page: 1,
        limit: filteredCourses.length
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const coursesPath = join(__dirname, '..', 'json-files', 'courses.json');
    const coursesData = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(coursesData);
    
    const course = courses.find(c => c.id === req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;