import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET organization settings
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get organization data
    const { data: orgData, error: orgError } = await supabase
      .from('organization')
      .select('id, name, email, phone, address')
      .single();

    if (orgError) {
      // If the error is that no rows were found, return a specific status code
      if (orgError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Organization details not found', isDetailsRequired: true }, { status: 404 });
      }

      console.error('Error fetching organization:', orgError);
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    if (!orgData) {
      return NextResponse.json({ error: 'Organization details not found', isDetailsRequired: true }, { status: 404 });
    }

    // Get departments for this organization
    const { data: departmentsData, error: deptError } = await supabase
      .from('departments')
      .select('name')
      .eq('organization_id', orgData.id);

    if (deptError) {
      console.error('Error fetching departments:', deptError);
      return NextResponse.json({ error: deptError.message }, { status: 500 });
    }

    // Combine organization data with departments
    const responseData = {
      ...orgData,
      departments: departmentsData.map((dept) => dept.name) ?? []
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    );
  }
}

// PUT to update organization settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    // Get the current organization to check if it exists
    const { data: existingOrg, error: fetchError } = await supabase
      .from('organization')
      .select('id')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching organization:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Use all fields from the body for update
    const { ...updateData } = body;
    let result;

    if (!existingOrg) {
      // Get the current user's ID
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting user:', userError);
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
      }

      if (!userData?.user) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
      }

      // If no organization exists, create a new one with the user_id
      const { data: newOrg, error: insertError } = await supabase
        .from('organization')
        .insert({
          ...updateData,
          user_id: userData.user.id
        })
        .select('id, name, email, phone, address')
        .single();

      if (insertError) {
        console.error('Error creating organization:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      result = newOrg;
      return NextResponse.json({
        ...result,
        message: 'Organization details created successfully'
      }, { status: 201 });
    } else {
      // Update existing organization
      const { data: updatedOrg, error: updateError } = await supabase
        .from('organization')
        .update(updateData)
        .eq('id', existingOrg.id)
        .select('id, name, email, phone, address')
        .single();

      if (updateError) {
        console.error('Error updating organization:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      result = updatedOrg;
    }

    return NextResponse.json({
      ...result,
      message: 'Organization details updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to update organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
} 