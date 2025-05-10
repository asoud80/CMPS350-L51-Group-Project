import { getStudentById, updateStudent, deleteStudent } from '@/lib/repo/student';

export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const student = await getStudentById(id);
    if (!student) {
      return Response.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    return Response.json(student);
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
    const student = await updateStudent(id, body);
    return Response.json(student);
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
    await deleteStudent(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}