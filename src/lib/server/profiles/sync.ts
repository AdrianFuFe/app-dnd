import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database/supabase';

type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];

const DISPLAY_NAME_METADATA_KEYS = ['display_name', 'full_name', 'name'] as const;

export function getProfileDisplayName(user: Pick<User, 'user_metadata'>): string | null {
	for (const key of DISPLAY_NAME_METADATA_KEYS) {
		const value = user.user_metadata?.[key];

		if (typeof value === 'string') {
			const normalized = value.trim();

			if (normalized.length > 0) {
				return normalized;
			}
		}
	}

	return null;
}

export async function ensureProfileForSession(
	supabase: SupabaseClient<Database>,
	session: Session
): Promise<void> {
	const profile: ProfilesInsert = {
		id: session.user.id,
		updated_at: new Date().toISOString()
	};

	const displayName = getProfileDisplayName(session.user);

	if (displayName) {
		profile.display_name = displayName;
	}

	const { error } = await supabase.from('profiles').upsert(profile, {
		onConflict: 'id'
	});

	if (error) {
		throw new Error(`Failed to sync profile for user ${session.user.id}`);
	}
}
