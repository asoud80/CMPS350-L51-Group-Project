export async function getAllClasses(filters = {}, sortBy = {}, page = 1, limit = 10) {

    const skip = (page - 1) * limit;
    
    
    const where = {};
    if (filters.name) where.name = { contains: filters.name };
    if (filters.year) where.year = filters.year;
    
    
    
    const orderBy = [];
    if (sortBy.field && sortBy.direction) {
        orderBy.push({ [sortBy.field]: sortBy.direction });
    }
    
    
    const classes = await prisma.class.findMany({
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

const total = await prisma.class.count({ where });
    
    return {
        data: classes,
        meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit)
        }
    };
    }

export async function getClassById(id) {
    return prisma.class.findUnique({
        where: { id },
        include: {
        course: true,
        instructor: true,
        students: true
        }
    });
}

export async function createClass(classData) {
    return prisma.class.create({
        data: classData
    });
}

export async function updateClass(id, classData) {
    return prisma.class.update({
        where: { id },
        data: classData
    });
}

export async function deleteClass(id) {
    return prisma.class.delete({
        where: { id }
    });
}

