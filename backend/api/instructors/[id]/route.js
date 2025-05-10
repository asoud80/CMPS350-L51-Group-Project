import { getInstructorById, updateInstructor, deleteInstructor } from '../../repo/instructor';

export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const instructor = await getInstructorById(id);
    if (!instructor) {
      return Response.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }
    return Response.json(instructor);
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
    const instructor = await updateInstructor(id, body);
    return Response.json(instructor);
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
    await deleteInstructor(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}