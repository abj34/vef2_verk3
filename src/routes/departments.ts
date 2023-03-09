import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db.js';
import { QueryResult } from 'pg';

export type Department = {
    id: number,
    title: string;
    slug: string;
    description?: string;
    created: Date;
    updated: Date;
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
export async function createDepartment(req: Request, res: Response, next: NextFunction) {
    const { title, slug, description } = req.body;
  
    res.json({ title, slug, description });
}

// Uppfærir eina deild
export async function updateDepartment(req: Request, res: Response, next: NextFunction) {

}

// Fjarlægir eina deild
export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {

}