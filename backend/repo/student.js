export async function getAllStudents(filters = {}, sortBy = {}, page = 1, limit = 10) {

const skip = (page - 1) * limit;


const where = {};
if (filters.name) where.name = { contains: filters.name };
if (filters.year) where.year = filters.year;



const orderBy = [];
if (sortBy.field && sortBy.direction) {
    orderBy.push({ [sortBy.field]: sortBy.direction });
}


const students = await prisma.student.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    select: {
    id: true,
    name: true,
    year: true,

    }
});


const total = await prisma.student.count({ where });

return {
    data: students,
    meta: {
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit)
    }
};
}

export async function getStudentById(id) {
    return prisma.student.findUnique({
        where: { id },
        include: {
        enrollments: {
            include: {
            class: {
                include: {
                course: true,
                instructor: true
                }
            }
            }
        }
        }
    });
}

export async function createStudent(data) {
    return prisma.student.create({ data });
}

export async function updateStudent(id, data) {
    return prisma.student.update({
        where: { id },
        data
    });
}

export async function deleteStudent(id) {
    return prisma.student.delete({
        where: { id }
    });
}


export async function getStudentsByCourse(courseId) {
    return prisma.student.findMany({
        where: {
        enrollments: {
            some: {
            class: {
                courseId
            }
            }
        }
        }
    });
}