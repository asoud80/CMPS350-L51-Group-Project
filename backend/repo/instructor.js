export async function getAllInstructors(filters = {}, sortBy = {}, page = 1, limit = 10) {

    const skip = (page - 1) * limit;
    
    
    const where = {};
    if (filters.name) where.name = { contains: filters.name };
    if (filters.year) where.year = filters.year;
    
    
    
    const orderBy = [];
    if (sortBy.field && sortBy.direction) {
        orderBy.push({ [sortBy.field]: sortBy.direction });
    }
    
    
    const instructors = await prisma.instructor.findMany({
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
    
    
    const total = await prisma.instructor.count({ where });
    
    return {
        data: instructors,
        meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit)
        }
    };
    }

export async function getInstructorById(id) {
    return prisma.instructor.findUnique({
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

export async function createInstructor(data) {
    return prisma.instructor.create({
        data
    });
}

export async function updateInstructor(id, data) {
    return prisma.instructor.update({
        where: { id },
        data
    });
}

export async function deleteInstructor(id) {
    return prisma.instructor.delete({
        where: { id }
    });
}

export async function getInstructorsByCourse(courseId) {
    return prisma.instructor.findMany({
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