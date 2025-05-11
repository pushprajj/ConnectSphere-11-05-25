import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { field, value, userId } = await request.json();

    if (!field || !userId) {
      return NextResponse.json({ error: 'Field and userId are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Validate the field name to prevent SQL injection
      const validFields = ['website', 'location', 'industry', 'size', 'founded_year', 'tagline', 'description'];
      if (!validFields.includes(field)) {
        return NextResponse.json({ error: 'Invalid field name' }, { status: 400 });
      }

      // Update the business details
      await client.query(
        `UPDATE businesses SET ${field} = $1 WHERE owner_id = $2`,
        [value, userId]
      );

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating business details:', error);
    return NextResponse.json({ error: 'Failed to update business details' }, { status: 500 });
  }
} 