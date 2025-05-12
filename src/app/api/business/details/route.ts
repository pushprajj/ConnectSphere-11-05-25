import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Import authOptions for correct session handling
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // Corrected import to default export as per lint suggestion

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions); // Use authOptions with getServerSession
    console.log('Session in API:', session); // Added logging for session debug
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { businessId, updates } = await req.json();
    console.log('Received PUT request for businessId:', businessId, 'with updates:', updates); // Logging remains
    if (!businessId || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'businessId and updates object are required' }, { status: 400 });
    }
    const setClauses = [];
    const values = [];
    let index = 1;
    for (const [field, value] of Object.entries(updates)) {
      const validFields = ['business_street', 'business_city', 'business_state', 'business_zip_code', 'business_country', 'contact_phone', 'contact_email', 'website', 'contact_person'];
      if (!validFields.includes(field)) {
        return NextResponse.json({ error: `Invalid field: ${field}` }, { status: 400 });
      }
      setClauses.push(`${field} = COALESCE($${index}, ${field})`);
      values.push(value);
      index++;
    }
    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    values.push(businessId); // Parameter for business ID
    values.push(session.user.id); // Parameter for owner ID
    const query = `UPDATE businesses SET ${setClauses.join(', ')} WHERE id = $${index} AND owner_id = $${index + 1} RETURNING *`;
    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'No business found or no changes made' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/business/details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}