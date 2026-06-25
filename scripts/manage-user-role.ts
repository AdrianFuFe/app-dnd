import { createClient } from '@supabase/supabase-js';
import {
	assertAdminGrantAllowed,
	buildProfileUpsert,
	findUserByEmail,
	parseAdminWorkflowEnv,
	parseManageRoleInput
} from '../src/lib/server/admin/workflow.ts';
import type { Database } from '../src/lib/types/database/supabase.ts';

const usage = [
	'Usage:',
	'  node --experimental-strip-types scripts/manage-user-role.ts --email user@example.com --role admin',
	'',
	'Roles: user, content_editor, admin',
	'Admin grants require the target email to be present in ADMIN_ALLOWLIST_EMAILS.'
].join('\n');

async function main(): Promise<void> {
	const input = parseManageRoleInput(process.argv.slice(2));
	const config = parseAdminWorkflowEnv();

	assertAdminGrantAllowed(input.email, input.role, config.adminAllowlistEmails);

	const supabase = createClient<Database>(config.supabaseUrl, config.serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	const user = await findUserByEmail(async (page, perPage) => {
		const { data, error } = await supabase.auth.admin.listUsers({
			page,
			perPage
		});

		if (error) {
			throw new Error(`Failed to list Supabase users: ${error.message}`);
		}

		return {
			lastPage: data.lastPage,
			users: data.users.map((entry) => ({
				email: entry.email,
				id: entry.id
			}))
		};
	}, input.email);

	if (!user) {
		throw new Error(
			`No auth user found for ${input.email}. Register the account first or create it with scripts/create-test-user.ts.`
		);
	}

	const { error } = await supabase.from('profiles').upsert(
		buildProfileUpsert({
			role: input.role,
			userId: user.id
		}),
		{
			onConflict: 'id'
		}
	);

	if (error) {
		throw new Error(`Failed to update profile role for ${input.email}: ${error.message}`);
	}

	console.log(`Updated ${input.email} to role "${input.role}" for user ${user.id}.`);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : 'Unknown error';
	console.error(message);
	console.error('');
	console.error(usage);
	process.exitCode = 1;
});
