import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get statistics data
    const [
      studentsCount,
      coursesCount,
      classesCount,
      enrollmentsCount,
      courseEnrollments,
      categoryDistribution,
      gradeCounts
    ] = await Promise.all([
      // Total number of students
      prisma.user.count({
        where: { userType: 'student' }
      }),
      
      // Total number of courses
      prisma.course.count(),
      
      // Total number of classes
      prisma.class.count(),
      
      // Total number of enrollments
      prisma.classEnrollment.count(),
      
      // Enrollments by course
      prisma.classEnrollment.groupBy({
        by: ['classId'],
        _count: true,
        orderBy: {
          _count: {
            classId: 'desc'
          }
        },
        take: 10,
      }),
      
      // Course distribution by category
      prisma.course.groupBy({
        by: ['category'],
        _count: true,
      }),
      
      // Grade distribution
      prisma.userCompletedCourse.groupBy({
        by: ['grade'],
        _count: true,
      })
    ]);

    // Calculate average class size
    const avgClassSize = classesCount > 0 ? enrollmentsCount / classesCount : 0;

    // Get instructor class counts
    const instructorClasses = await prisma.class.groupBy({
      by: ['instructorId'],
      _count: true
    });

    // Map instructor IDs to names
    const instructorInfo = await Promise.all(
      instructorClasses.map(async (item) => {
        const instructor = await prisma.user.findUnique({
          where: { id: item.instructorId },
          select: { name: true }
        });
        return {
          instructorId: item.instructorId,
          name: instructor?.name || 'Unknown',
          classCount: item._count
        };
      })
    );

    // Handle course enrollments mapping
    const mappedCourseEnrollments = await Promise.all(
      courseEnrollments.map(async (item) => {
        const cls = await prisma.class.findUnique({
          where: { id: item.classId },
          select: { courseId: true }
        });
        const course = cls ? await prisma.course.findUnique({
          where: { id: cls.courseId },
          select: { id: true, name: true }
        }) : null;
        
        return {
          courseId: course?.id || 'Unknown',
          courseName: course?.name || 'Unknown',
          enrollmentCount: item._count
        };
      })
    );

    // Return compiled statistics
    return Response.json({
      basicStats: {
        studentsCount,
        coursesCount,
        classesCount,
        avgClassSize: parseFloat(avgClassSize.toFixed(1))
      },
      courseEnrollments: mappedCourseEnrollments,
      categoryDistribution,
      gradeCounts,
      instructorClasses: instructorInfo
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}