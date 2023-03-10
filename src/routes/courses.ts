import { Request, Response, NextFunction } from 'express';
import { QueryResult } from 'pg';
import { stringValidator, xssSanitizer } from '../lib/validator.js';
import { addCourse, query, removeCourse } from '../lib/db.js';


export type Course = {
    id: number,
    courseid: string;
    title: string;
    units: number;
    semester: string;
    level?: string;
    url?: string;
    departmentid: string;
    created?: Date;
    updated?: Date;
}

// Mapper til að setja niður í type course það sem lesið er úr gagnabanka
export function courseMapper(
    input: unknown
): Course | null {
    const potentialCourse = input as Partial<Course> | null;

    if (
        !potentialCourse ||
        !potentialCourse.id ||
        !potentialCourse.courseid ||
        !potentialCourse.title ||
        !potentialCourse.units ||
        !potentialCourse.semester ||
        !potentialCourse.level ||
        !potentialCourse.url ||
        !potentialCourse.departmentid ||
        !potentialCourse.created || !potentialCourse.updated
    ) { 
        return null; 
    }

    const course: Course = {
        id: potentialCourse.id,
        courseid: potentialCourse.courseid,
        title: potentialCourse.title,
        units: potentialCourse.units,
        semester: potentialCourse.semester,
        level: potentialCourse.level,
        url: potentialCourse.url,
        departmentid: potentialCourse.departmentid,
        created: new Date(potentialCourse.created),
        updated: new Date(potentialCourse.updated),
    }

    return course;
}

// Leitað eftir einum kennslutíma
export function mapDbCourseToCourse(
    input: QueryResult<any> | null,
): Course | null {
    if (!input) {
        return null;
    }

    return courseMapper(input.rows[0]);
}

// Leitað eftir öllum kennslutímum
export function mapDbCoursesToCourses(
    input: QueryResult<any> | null,
): Array<Course> {
    if (!input) {
        return [];
    }
    const mappedCourses = input?.rows.map(courseMapper);

    return mappedCourses.filter((i): i is Course => Boolean(i));
}

// Sýnir alla kennslutíma
export async function listCourses(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const departmentResult = await query(`SELECT * FROM departments WHERE slug = $1;`, [slug]);

    if (!departmentResult) {
        return res.status(404).json({ message: 'Department not found' });
    }
    const { id } = departmentResult.rows[0];

    const coursesResult = await query('SELECT * FROM courses WHERE departmentId = $1;', [id]);
  
    const courses = mapDbCoursesToCourses(coursesResult);
    
    res.json(courses);
}

// Sýnir einn kennslutima
export async function getCourse(req: Request, res: Response, next: NextFunction) {
    const { courseId } = req.params;
    const courseResult = await query('SELECT * FROM courses WHERE courseId = $1;', [courseId]);
  
    const course = mapDbCourseToCourse(courseResult);
  
    if (!course) {
      return next();
    }
  
    res.json(course);
}

// Býr til nýja kennslutíma
export async function createCourseHandler(req: Request, res: Response, next: NextFunction) {
    const { courseid, title, units, semester, level, url, departmentid } = req.body;

    const CourseToCreate: Omit<Course, "id"> = {
        courseid,
        title,
        units,
        semester,
        level,
        url,
        departmentid
    };

    const createdCourse = await addCourse(CourseToCreate);

    if (!createdCourse) {
        return next(new Error('Unable to create course'));
    }  

    return res.json(createdCourse);
}

// Uppfææra einn kennslutíma
export async function updateCourseHandler(req: Request, res: Response, next: NextFunction) {
    
}

// Fjarlægja eina kennslutíma
export async function deleteCourseHandler(req: Request, res: Response, next: NextFunction) {
    const { courseId } = req.params;
    
    const deletedCourse = await removeCourse(courseId);

    if (!deletedCourse) {
        return next(new Error('Unable to delete department'));
    }

    return res.status(204).json();
}


export const createCourse = [
    createCourseHandler,
];

export const patchCourse = [
    
];

export const deleteCourse = [
    deleteCourseHandler,
];