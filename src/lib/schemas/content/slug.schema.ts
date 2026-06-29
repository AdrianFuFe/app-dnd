import { z } from 'zod';

export const slugSchema = z
	.string()
	.trim()
	.min(1)
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		'Slug must use lowercase letters, numbers, and hyphens only'
	);
