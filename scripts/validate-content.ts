import path from 'node:path';
import {
	formatContentValidationResult,
	validateContentDataDirectory
} from '../src/lib/server/import/content-file-validation.ts';

const dataDirectoryPath = path.resolve(process.cwd(), 'data');
const result = validateContentDataDirectory(dataDirectoryPath);

console.log(formatContentValidationResult(result));

if (result.issues.length > 0) {
	process.exitCode = 1;
}
