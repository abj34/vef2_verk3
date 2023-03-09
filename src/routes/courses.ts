

export type Courses = {
    id: number,
    courseId: string;
    title: string;
    points: number;
    semester: string;
    degree: string;
    url?: string;
    department: string;
    created: Date;
    updated: Date;
}