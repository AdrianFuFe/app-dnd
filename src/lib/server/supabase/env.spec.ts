import { describe, expect, it } from 'vitest';
import { getSupabaseServerEnv } from './env.ts';

describe('getSupabaseServerEnv', () => {
	it('throws when required public Supabase variables are missing', () => {
		expect(getSupabaseServerEnv).toThrow();
	});
});
