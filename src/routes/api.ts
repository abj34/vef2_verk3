import express, { Request, Response } from 'express';
import { createCourse, deleteCourse, getCourse, listCourses, patchCourse } from './courses.js';
import { 
  listDepartments, 
  getDepartment, 
  createDepartment, 
  patchDepartment, 
  deleteDepartment
 } from './departments.js';

export const router = express.Router();

export async function index(req: Request, res: Response) {
  return res.json([
    {
      href: '/departments',
      methods: ['GET',]
    },
    {
      href: '/departments/:slug',
      methods: ['GET',]
    },
    {
      href: '/departments/:slug/courses',
      methods: []
    },
    {
      href: '/departments/:slug/courses/:courseId',
      methods: []
    },
  ])
}

router.get('/', index);

// Departments
router.get('/departments', listDepartments);
router.post('/departments', createDepartment);
router.get('/departments/:slug', getDepartment);
router.patch('/departments/:slug', patchDepartment);
router.delete('/departments/:slug', deleteDepartment);

// Courses 
router.get('/departments/:slug/courses', listCourses);
router.post('/departments/:slug/courses', createCourse);
router.get('/departments/:slug/courses/:courseId', getCourse);
router.post('/departments/:slug/courses/:courseId', patchCourse);
router.delete('/departments/:slug/courses/:courseId', deleteCourse);
