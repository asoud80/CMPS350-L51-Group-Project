const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // Read JSON files
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json-files/Users.json'), 'utf8'));
    const coursesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json-files/courses.json'), 'utf8'));
    const classesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../json-files/classes.json'), 'utf8'));

    // Seed Courses
    console.log('Seeding courses...');
    for (const course of coursesData) {
      await prisma.course.create({
        data: {
          id: course.id,
          name: course.name,
          category: course.category,
          credits: course.credits,
          isOpenForRegistration: course.isOpenForRegistration,
          description: course.description,
        },
      });
    }

    // Add course prerequisites
    console.log('Adding course prerequisites...');
    for (const course of coursesData) {
      if (course.prerequisites && course.prerequisites.length > 0) {
        for (const prerequisiteId of course.prerequisites) {
          await prisma.coursePrerequisite.create({
            data: {
              courseId: course.id,
              prerequisiteCourseId: prerequisiteId,
            },
          });
        }
      }
    }

    // Seed Users
    console.log('Seeding users...');
    for (const userData of usersData) {
      // Create user with user type
      let userData_clean = {
        id: userData.id,
        username: userData.username,
        password: userData.password, // In production, hash passwords!
        userType: userData.userType,
        name: userData.name,
      };
      
      // Add expertise areas for instructors
      if (userData.userType === 'instructor' && userData.expertiseAreas) {
        userData_clean.expertiseAreas = {
          create: userData.expertiseAreas.map(name => ({ name }))
        };
      }
      
      const user = await prisma.user.create({
        data: userData_clean
      });

      // Add completed courses for students
      if (userData.userType === 'student' && userData.completedCourses && userData.completedCourses.length > 0) {
        for (const completedCourse of userData.completedCourses) {
          await prisma.userCompletedCourse.create({
            data: {
              userId: user.id,
              courseId: completedCourse.courseId,
              grade: completedCourse.grade,
            },
          });
        }
      }
    }

    // Seed Classes
    console.log('Seeding classes...');
    for (const classData of classesData) {
      // Create class
      const classRecord = await prisma.class.create({
        data: {
          id: classData.classId,
          courseId: classData.courseId,
          instructorId: classData.instructorId,
          maxStudents: classData.maxStudents,
          status: classData.status,
        },
      });

      // Add enrolled students
      if (classData.students && classData.students.length > 0) {
        for (const studentId of classData.students) {
          await prisma.classEnrollment.create({
            data: {
              userId: studentId,
              classId: classRecord.id,
            },
          });
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });