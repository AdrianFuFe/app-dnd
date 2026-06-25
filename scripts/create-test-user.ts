import { createClient } from '@supabase/supabase-js';
import {
	buildProfileUpsert,
	parseAdminWorkflowEnv,
	parseCreateTestUserInput
} from '../src/lib/server/admin/workflow.ts';
import type { Database } from '../src/lib/types/database/supabase.ts';

const usage = [
	'Usage:',
	'  node --experimental-strip-types scripts/create-test-user.ts --email user@example.com --password secret123 --display-name "Test User"',
	'',
	'Optional flags:',
	'  --email-confirmed true|false    Defaults to true'
].join('\n');

async function main(): Promise<void> {
	const input = parseCreateTestUserInput(process.argv.slice(2));
	const config = parseAdminWorkflowEnv();

	const supabase = createClient<Database>(config.supabaseUrl, config.serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});

	const { data, error } = await supabase.auth.admin.createUser({
		email: input.email,
		email_confirm: input.emailConfirmed,
		password: input.password,
		user_metadata: input.displayName ? { display_name: input.displayName } : undefined
	});

	if (error) {
		throw new Error(`Failed to create test user ${input.email}: ${error.message}`);
	}

	const user = data.user;

	if (!user) {
		throw new Error(`Supabase did not return a user for ${input.email}.`);
	}

	const { error: profileError } = await supabase.from('profiles').upsert(
		buildProfileUpsert({
			displayName: input.displayName,
			role: 'user',
			userId: user.id
		}),
		{
			onConflict: 'id'
		}
	);

	if (profileError) {
		throw new Error(`Failed to create profile for ${input.email}: ${profileError.message}`);
	}

	console.log(`Created test user ${input.email} with role "user" and id ${user.id}.`);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : 'Unknown error';
	console.error(message);
	console.error('');
	console.error(usage);
	process.exitCode = 1;
});
