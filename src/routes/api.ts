import express, { Request, Response } from 'express';
import { createCourse, deleteCourse, getCourse, listAllCourses, listCourses, patchCourse } from './courses.js';
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
      description: 'Every single department in table departments',
      href: '/departments',
      methods: ['GET','POST']
    },
    {
      description: 'Specific department',
      href: '/departments/:slug',
      methods: ['GET','PATCH','DELETE']
    },
    {
      description: 'Every single course in table courses',
      href: '/courses',
      methods: ['GET']
    },
    {
      description: 'All courses in specific department',
      href: '/departments/:slug/courses',
      methods: ['GET','POST']
    },
    {
      description: 'Specific course',
      href: '/departments/:slug/courses/:courseId',
      methods: ['GET','PATCH','DELETE']
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
router.get('/courses', listAllCourses);
router.get('/departments/:slug/courses', listCourses);
router.post('/departments/:slug/courses', createCourse);
router.get('/departments/:slug/courses/:courseId', getCourse);
router.patch('/departments/:slug/courses/:courseId', patchCourse);
router.delete('/departments/:slug/courses/:courseId', deleteCourse);
