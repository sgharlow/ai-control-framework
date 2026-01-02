import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch user's teams and team details
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (teamId) {
      // Fetch specific team with members
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      // Verify user is a member
      const { data: membership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (!membership && team.owner_id !== user.id) {
        return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
      }

      // Fetch all team members
      const { data: members } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      return NextResponse.json({ team, members: members || [] });
    } else {
      // Fetch all teams user is part of
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const teamIds = memberships?.map(m => m.team_id) || [];

      // Also include teams user owns
      const { data: ownedTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id);

      const allTeamIds = [...new Set([...teamIds, ...(ownedTeams?.map(t => t.id) || [])])];

      if (allTeamIds.length === 0) {
        return NextResponse.json({ teams: [] });
      }

      const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .in('id', allTeamIds);

      return NextResponse.json({ teams: teams || [] });
    }
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new team
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, plan = 'pro', seatCount = 5 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Create team
    const { data: team, error: createError } = await supabase
      .from('teams')
      .insert({
        name,
        owner_id: user.id,
        plan,
        seat_count: seatCount,
      })
      .select()
      .single();

    if (createError) {
      console.error('Team creation error:', createError);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    // Add owner as team member
    await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date().toISOString(),
      });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update team settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, name } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify user is owner
    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', teamId)
      .single();

    if (!team || team.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update team
    const { data: updated, error: updateError } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', teamId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }

    return NextResponse.json({ team: updated });
  } catch (error) {
    console.error('Team update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
