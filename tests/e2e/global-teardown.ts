import { execFile } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const PID_PATH = path.join(process.cwd(), '.svelte-kit', 'playwright', 'preview-server.json');

export default async function globalTeardown() {
	const pid = await readPid();

	if (!pid) {
		return;
	}

	try {
		if (process.platform === 'win32') {
			await execFileAsync('taskkill', ['/pid', String(pid), '/T', '/F']);
		} else {
			process.kill(-pid, 'SIGKILL');
		}
	} catch {
		// The preview server may already be gone if startup failed or the process exited early.
	}

	await rm(PID_PATH, { force: true });
}

async function readPid() {
	try {
		const content = await readFile(PID_PATH, 'utf8');
		const parsed = JSON.parse(content) as { pid?: number };
		return typeof parsed.pid === 'number' ? parsed.pid : null;
	} catch {
		return null;
	}
}
