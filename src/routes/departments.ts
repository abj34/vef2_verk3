import { Request, Response, NextFunction } from 'express';
import { addDepartment, getDepartmentsBySlug, query, removeDepartment, updateDepartment } from '../lib/db.js';
import { QueryResult } from 'pg';
import { stringValidator, xssSanitizer } from '../lib/validator.js';
import { slugify } from '../lib/slugify.js';

export type Department = {
    id: number,
    title: string;
    slug: string;
    description?: string;
    created?: Date;
    updated?: Date;
}

// Mapper til að setja niður í type Department það sem lesið er úr gagnabanka
export function departmentMapper(
    input: unknown
): Department | null {
    const potentialDepartment = input as Partial<Department> | null;

    if (
        !potentialDepartment ||
        !potentialDepartment.id ||
        !potentialDepartment.title ||
        !potentialDepartment.slug ||
        !potentialDepartment.description ||
        !potentialDepartment.created || !potentialDepartment.updated
    ) { 
        return null; 
    }

    const department: Department = {
        id: potentialDepartment.id,
        title: potentialDepartment.title,
        slug: potentialDepartment.slug,
        description: potentialDepartment.description,
        created: new Date(potentialDepartment.created),
        updated: new Date(potentialDepartment.updated),
    }

    return department;
}

// Leitað eftir eini deild
export function mapDbDepartmentToDepartment(
    input: QueryResult<any> | null,
): Department | null {
    if (!input) {
        return null;
    }

    return departmentMapper(input.rows[0]);
}

// Leitað eftir öllum deildum
export function mapDbDepartmentsToDepartments(
    input: QueryResult<any> | null,
): Array<Department> {
    if (!input) {
        return [];
    }
    const mappedDepartments = input?.rows.map(departmentMapper);

    return mappedDepartments.filter((i): i is Department => Boolean(i));
}

// Sýnir allar deildir
export async function listDepartments(req: Request, res: Response, next: NextFunction) {
    const departmentsResult = await query('SELECT * FROM departments;');
  
    const departments = mapDbDepartmentsToDepartments(departmentsResult);
    
    res.json(departments);
}

// Sýnir eina deild
export async function getDepartment(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const departmentResult = await query('SELECT * FROM departments WHERE slug = $1;', [
      slug,
    ]);
  
    const department = mapDbDepartmentToDepartment(departmentResult);
  
    if (!department) {
      return next();
    }
  
    res.json(department);
}

// Býr til nýja deild
export async function createDepartmentHandler(req: Request, res: Response, next: NextFunction) {
    const { title, description } = req.body;

    const departmentToCreate: Omit<Department, "id"> = {
        title,
        slug: slugify(title),
        description,
    };

    const createdDepartment = await addDepartment(departmentToCreate);

    if (!createdDepartment) {
        return next(new Error('Unable to create department'));
    }  

    return res.json(createdDepartment);
}

// Uppfærir eina deild
export async function updateDepartmentHandler(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const department = await getDepartmentsBySlug(slug);

    if (!department) {
        return next();
    }

    const { title, description } = req.body;

    const fields = [
        typeof title === 'string' && title ? 'title' : null,
        typeof title === 'string' && title ? 'slug' : null,
        typeof description === 'string' && description ? 'description' : null,
    ];

    const values = [
        typeof title === 'string' && title ? title : null,
        typeof title === 'string' && title ? slugify(title).toLowerCase() : null,
        typeof description === 'string' && description ? description : null,
    ];

    const updated = await updateDepartment(
        'departments',
        department.id,
        fields,
        values,
    );

    if (!updated) {
        return next(new Error('Unable to update department'));
    }

    return res.json(updated.rows[0]);
}

// Fjarlægir eina deild
export async function deleteDepartmentHandler(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    
    const deletedDepartment = await removeDepartment(slug);

    if (!deletedDepartment) {
        return next(new Error('Unable to delete department'));
    }

    return res.status(204).json();
}

export const createDepartment = [
    stringValidator({ field: 'title', maxLength: 64 }),
    stringValidator({
        field: 'description',
        valueRequired: false,
    }),
    xssSanitizer('title'),
    xssSanitizer('description'),
    createDepartmentHandler,
];

export const patchDepartment = [
    updateDepartmentHandler,
];

export const deleteDepartment = [
    deleteDepartmentHandler,
];