import { readFileSync } from 'node:fs';
import path from 'node:path';

type ContentFile<T> = {
	contentType: string;
	items: T[];
};

type NamedCatalogItem = {
	slug: string;
	name: string;
};

type CatalogSummary = {
	fileName: string;
	label: string;
	sampleSize: number;
};

const summaries: CatalogSummary[] = [
	{ fileName: 'species.json', label: 'Species', sampleSize: 10 },
	{ fileName: 'subspecies.json', label: 'Subspecies', sampleSize: 10 },
	{ fileName: 'classes.json', label: 'Classes', sampleSize: 10 },
	{ fileName: 'subclasses.json', label: 'Subclasses', sampleSize: 10 },
	{ fileName: 'backgrounds.json', label: 'Backgrounds', sampleSize: 10 },
	{ fileName: 'spells.json', label: 'Spells', sampleSize: 12 },
	{ fileName: 'feats.json', label: 'Feats', sampleSize: 10 },
	{ fileName: 'equipment.json', label: 'Equipment', sampleSize: 12 }
];

function loadCatalogItems(fileName: string): NamedCatalogItem[] {
	const filePath = path.resolve(process.cwd(), 'data', 'srd-5-1', fileName);
	const raw = readFileSync(filePath, 'utf-8');
	const parsed = JSON.parse(raw) as ContentFile<NamedCatalogItem>;

	return parsed.items ?? [];
}

function formatSample(items: NamedCatalogItem[], sampleSize: number): string[] {
	return items
		.slice(0, sampleSize)
		.map((item) => `  - ${item.slug} :: ${item.name}`);
}

const lines = [
	'SRD 5.1 structured coverage report',
	'',
	'Current repository coverage by catalog:'
];

for (const summary of summaries) {
	const items = loadCatalogItems(summary.fileName);
	lines.push(`- ${summary.label}: ${items.length}`);

	const sampleLines = formatSample(items, summary.sampleSize);
	if (sampleLines.length > 0) {
		lines.push(...sampleLines);
	}

	lines.push('');
}

console.log(lines.join('\n').trimEnd());
