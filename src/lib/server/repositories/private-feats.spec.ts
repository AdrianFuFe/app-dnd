import { describe, expect, it } from 'vitest';
import {
	buildPrivateFeatDerivationMechanic,
	extractPrivateFeatDerivation
} from './private-feats';

describe('private feat derivation metadata', () => {
	it('extracts the first feat derivation mechanic from mixed mechanics', () => {
		const derivation = extractPrivateFeatDerivation([
			{ type: 'note', text: 'Custom tweak.' },
			buildPrivateFeatDerivationMechanic({
				source: 'srd-5-1',
				slug: 'alert',
				name: 'Alert'
			})
		]);

		expect(derivation).toEqual({
			source: 'srd-5-1',
			contentType: 'feat',
			slug: 'alert',
			name: 'Alert'
		});
	});

	it('ignores non-derivation mechanics', () => {
		expect(extractPrivateFeatDerivation([{ type: 'note', text: 'No provenance here.' }])).toBe(
			null
		);
	});
});
