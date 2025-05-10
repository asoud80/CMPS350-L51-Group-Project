import { createClass, getAllClasses } from '../../repo/class';

export async function GET(request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const searchTerm = url.searchParams.get('search');
  const sortField = url.searchParams.get('sortField') || 'id';
  const sortOrder = url.searchParams.get('sortOrder') || 'asc';
  
  try {
    
    const filters = {};
    if (searchTerm) filters.name = { contains: searchTerm };
    
    const result = await getAllClasses(
      filters,
      { field: sortField, direction: sortOrder },
      page,
      limit
    );
    
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const classes = await createClass(body);
    return Response.json(classes, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}