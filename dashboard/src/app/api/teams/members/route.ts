import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Invite a new team member
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
    const { teamId, email, role = 'member' } = body;

    if (!teamId || !email) {
      return NextResponse.json({ error: 'Team ID and email are required' }, { status: 400 });
    }

    // Verify user is admin or owner
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    const { data: team } = await supabase
      .from('teams')
      .select('owner_id, seat_count')
      .eq('id', teamId)
      .single();

    const isOwner = team?.owner_id === user.id;
    const isAdmin = membership?.role === 'admin' || isOwner;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized to invite members' }, { status: 403 });
    }

    // Check seat count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .not('joined_at', 'is', null);

    if (memberCount && team && memberCount >= team.seat_count) {
      return NextResponse.json({ error: 'All seats are used. Please upgrade.' }, { status: 400 });
    }

    // Check if user with email exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const invitedUser = existingUsers.users.find(u => u.email === email);

    // Check if already a member
    if (invitedUser) {
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', invitedUser.id)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      }
    }

    // Create invite record
    const { data: member, error: inviteError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: invitedUser?.id || null,
        role: role === 'admin' ? 'admin' : 'member',
        invited_at: new Date().toISOString(),
        joined_at: invitedUser ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invite error:', inviteError);
      return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
    }

    // TODO: Send invitation email using a service like Resend
    // For now, just return success

    return NextResponse.json({
      member,
      message: invitedUser ? 'Member added' : 'Invitation sent'
    }, { status: 201 });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update member role
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
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json({ error: 'Member ID and role are required' }, { status: 400 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get member's team
    const { data: member } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('id', memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot change owner role
    if (member.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 });
    }

    // Verify requester is admin/owner
    const { data: requesterMembership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', member.team_id)
      .eq('user_id', user.id)
      .single();

    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', member.team_id)
      .single();

    const isOwner = team?.owner_id === user.id;
    const isAdmin = requesterMembership?.role === 'admin' || isOwner;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update role
    const { data: updated, error: updateError } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove member from team
export async function DELETE(request: NextRequest) {
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
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Get member details
    const { data: member } = await supabase
      .from('team_members')
      .select('team_id, user_id, role')
      .eq('id', memberId)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 });
    }

    // Allow self-removal (leaving team)
    const isSelf = member.user_id === user.id;

    if (!isSelf) {
      // Verify requester is admin/owner
      const { data: requesterMembership } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', member.team_id)
        .eq('user_id', user.id)
        .single();

      const { data: team } = await supabase
        .from('teams')
        .select('owner_id')
        .eq('id', member.team_id)
        .single();

      const isOwner = team?.owner_id === user.id;
      const isAdmin = requesterMembership?.role === 'admin' || isOwner;

      if (!isAdmin) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Member removal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
