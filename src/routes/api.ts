import express, { Request, Response } from 'express';
import { 
  listDepartments, 
  getDepartment, 
  createDepartment, 
  updateDepartment, 
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
router.get('/departments', listDepartments);
router.post('/departments', createDepartment);
router.get('/departments/:slug', getDepartment);
router.patch('/departments/:slug', updateDepartment);
router.delete('/departments/:slug', deleteDepartment);
