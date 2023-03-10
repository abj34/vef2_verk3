import { readFile } from 'fs/promises';
import pg from 'pg';
import { Course } from '../routes/courses';
import { Department } from '../routes/departments';

const { DATABASE_URL: connectionString } = process.env;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err: Error) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

type QueryInput = string | number | null | undefined;

export async function query(q: string, values: Array<QueryInput> = []) {
    let client;
    try {
      client = await pool.connect();
    } catch (e) {
      console.error('unable to get client from pool', e);
      return null;
    }
  
    try {
      const result = await client.query(q, values);
      return result;
    } catch (e) {
      console.error('unable to query', e);
      console.info(q, values);
      return null;
    } finally {
      client.release();
    }
}

// CREATE SCHEMA

// DROP SCHEMA

// CREATE DEPARTMENT
export async function addDepartment(department: Omit<Department, "id">, silent?: boolean): Promise<Department | null> {
  const q = `
    INSERT INTO departments (title, slug, description)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [department.title, department.slug, department.description];
  const result = await query(q, values);

  if (!result) {
    return null;
  }

  return result.rows[0];
}

// UPDATE DEPARTMENT
export async function updateDepartment(
  table: 'departments' | 'courses',
  id: number,
  fields: Array<string | null>,
  values: Array<string | number | null>,
) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i): i is string | number => typeof i === 'string' || typeof i === 'number',
    );

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  if (filteredFields.length === 0) {
    return false;
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE id = $1
      RETURNING *
  `;
  console.log(q);
  const queryValues: Array<string | number> = (
    [id] as Array<string | number>
  ).concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}

// DELETE DEPARTMENT
export async function removeDepartment(slug: string): Promise<boolean> {
  const q = `
    DELETE FROM departments
    WHERE slug = $1
  `;
  const values = [slug];
  const result = await query(q, values);

  if (!result) {
    return false;
  }

  return true;
}

// CREATE COURSE
export async function addCourse(course: Omit<Course, "id">, silent?: boolean): Promise<Course | null> {
  const q = `
    INSERT INTO courses (courseId, title, units, semester, level, url, departmentId)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [course.courseid, course.title, course.units, course.semester, course.level, course.url, course.departmentid];
  const result = await query(q, values);

  if (!result) {
    return null;
  }

  return result.rows[0];
}

// UPDATE COURSE

// DELETE COURSE
export async function removeCourse(courseId: string): Promise<boolean> {
  const q = `
    DELETE FROM courses
    WHERE courseId = $1
  `;
  const values = [courseId];
  const result = await query(q, values);

  if (!result) {
    return false;
  }

  return true;
}

// GET DEPARTMENT BY SLUG
export async function getDepartmentsBySlug(slug: string): Promise<Department | null> {
  const q = `
    SELECT * FROM departments
    WHERE slug = $1
  `;
  const values = [slug];
  const result = await query(q, values);

  if (!result) {
    return null;
  }

  return result.rows[0];
}

// GET COURSES BY DEPARTMENT SLUG
export async function getDepartmentIdByDepartmentSlug(slug: string): Promise<Array<Course> | null> {
  const q = `
    SELECT id FROM department
    WHERE slug = $1
  `;
  const values = [slug];
  const result = await query(q, values);

  if (!result) {
    return null;
  }

  return result.rows;
}



export async function end() {
  await pool.end();
}
