import { getClassById, updateClass, deleteClass } from '../../repo/class';

export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const aclass = await getClassById(id);
    if (!aclass) {
      return Response.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }
    return Response.json(aclass);
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
    const aclass = await updateClass(id, body);
    return Response.json(aclass);
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
    await deleteClass(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}