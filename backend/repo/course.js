export async function getAllCourses(filters = {}, sortBy = {}, page = 1, limit = 10) {

    const skip = (page - 1) * limit;
    
    
    const where = {};
    if (filters.name) where.name = { contains: filters.name };
    if (filters.year) where.year = filters.year;
    
    
    
    const orderBy = [];
    if (sortBy.field && sortBy.direction) {
        orderBy.push({ [sortBy.field]: sortBy.direction });
    }
    
    
    const courses = await prisma.course.findMany({
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

    const total = await prisma.course.count({ where });
    
    return {
        data: courses,
        meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit)
        }
    };
    }

export async function getCourseById(id) {
    return prisma.course.findUnique({
        where: { id },
        include: {
        classes: {
            include: {
            instructor: true,
            students: true
            }
        }
        }
    });
}

export async function createCourse(courseData) {
    return prisma.course.create({
        data: courseData
    });
}

export async function updateCourse(id, courseData) {
    return prisma.course.update({
        where: { id },
        data: courseData
    });
}

export async function deleteCourse(id) {
    return prisma.course.delete({
        where: { id }
    });
}

export async function getCourseByName(name) {
    return prisma.course.findUnique({
        where: { name }
    });
}

export async function getCourseByYear(year) {
    return prisma.course.findUnique({
        where: { year }
    });
}

