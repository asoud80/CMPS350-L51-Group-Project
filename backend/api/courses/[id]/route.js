import { getCourseById, updateCourse, deleteCourse } from '../../repo/course';

export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const course = await getCourseById(id);
    if (!course) {
      return Response.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    return Response.json(course);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  
  try {
    const body = await request.json();
    const course = await updateCourse(id, body);
    return Response.json(course);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  
  try {
    await deleteCourse(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}