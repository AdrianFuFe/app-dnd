import { describe, expect, it } from 'vitest';
import { authFormSchema } from './auth-form.schema.ts';

describe('authFormSchema', () => {
	it('accepts a valid email and password', () => {
		const result = authFormSchema.safeParse({
			email: 'user@example.com',
			password: 'strongpass123'
		});

		expect(result.success).toBe(true);
	});

	it('rejects an invalid email', () => {
		const result = authFormSchema.safeParse({
			email: 'bad-email',
			password: 'strongpass123'
		});

		expect(result.success).toBe(false);
	});
});
