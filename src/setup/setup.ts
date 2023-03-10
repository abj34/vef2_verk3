import dotenv from 'dotenv';
import { readFile} from 'fs/promises';
import { join } from 'path';

import { query, poolEnd, addDepartment, getDepartmentIdByDepartmentSlug, addCourse } from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import { Course } from '../routes/courses.js';
import { Department } from '../routes/departments.js';
import { parseCsv, parseJson } from './file.js';

dotenv.config();

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const DATA_DIR = './data';

export const inserting = {currentDepartmentId: 0, failedCourseCreations: 0};

export async function createSchema(schemaFile = SCHEMA_FILE) {
    const data = await readFile(schemaFile);

    return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
    const data = await readFile(dropFile);

    return query(data.toString('utf-8'));
}

async function setup() {
    const drop = await dropSchema();

    if (drop) {
        console.log('Dropped schema');
    } else {
        console.log('No schema to drop');
        poolEnd();
        return process.exit(-1);
    }

    const schema = await createSchema();

    if (schema) {
        console.log('Created schema');
    } else {
        console.log('No schema to create');
        poolEnd();
        return process.exit(-1);
    }

    const indexFile = await readFile(join(DATA_DIR, 'index.json'));
    const indexData = parseJson(indexFile.toString('utf-8'));

    for (const item of indexData) {
        const csvFile = await readFile(join(DATA_DIR, item.csv),{ encoding: 'latin1',});
        const departmentSlug = slugify(item.title).toLowerCase();
        //console.info('parsing', item.csv);

        const courses = parseCsv(csvFile);
        //console.log(courses);

        const department: Omit<Department, 'id'> = {
            title: item.title,
            slug: departmentSlug,
            description: item.description,
        }

        const insertedDepartment = await addDepartment(department,false);

        inserting.currentDepartmentId++;

        if (!insertedDepartment) {
            console.error('Failed to add department');
            continue;
        }

        for (const course of courses) {

            const eachCourse: Omit<Course, 'id'> = {
                courseid: course.courseid,
                title: course.title,
                units: course.units,
                semester: course.semester,
                level: course.level,
                url: course.url,
                departmentid: inserting.currentDepartmentId,
            }

            const insertedDepartment = await addCourse(eachCourse,false);

            if (!insertedDepartment) {
                inserting.failedCourseCreations++;
                continue;
            }
        }

        console.log(`Department ${item.title} added, with ${courses.length - inserting.failedCourseCreations} courses added and ${inserting.failedCourseCreations} failed.`);
        inserting.failedCourseCreations = 0;
    }
}

setup();