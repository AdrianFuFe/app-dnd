import { spawn } from 'node:child_process';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const SERVER_URL = 'http://127.0.0.1:4173';
const PID_DIR = path.join(process.cwd(), '.svelte-kit', 'playwright');
const PID_PATH = path.join(PID_DIR, 'preview-server.json');
const VITE_BIN_PATH = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const execFileAsync = promisify(execFile);

export default async function globalSetup() {
	await mkdir(PID_DIR, { recursive: true });
	await stopStaleServer();

	if (await isServerReachable(SERVER_URL)) {
		throw new Error(
			`${SERVER_URL} is already in use. Stop the existing server before running Playwright.`
		);
	}

	const serverProcess = spawn(
		process.execPath,
		[VITE_BIN_PATH, 'preview', '--host', '127.0.0.1', '--strictPort'],
		{
			cwd: process.cwd(),
			detached: true,
			env: {
				...process.env,
				APP_E2E: 'true'
			},
			stdio: 'ignore'
		}
	);

	if (!serverProcess.pid) {
		throw new Error('Failed to start the Playwright preview server.');
	}

	serverProcess.unref();
	await writeFile(PID_PATH, JSON.stringify({ pid: serverProcess.pid }), 'utf8');
	await waitForServer(SERVER_URL, 120_000);
}

async function waitForServer(url: string, timeoutMs: number) {
	const deadline = Date.now() + timeoutMs;
	let lastError: unknown;

	while (Date.now() < deadline) {
		try {
			const response = await fetch(url);

			if (isReadyStatus(response.status)) {
				return;
			}
		} catch (error) {
			lastError = error;
		}

		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	throw new Error(`Timed out waiting for ${url}: ${String(lastError)}`);
}

async function isServerReachable(url: string) {
	try {
		const response = await fetch(url);
		return isReadyStatus(response.status);
	} catch {
		return false;
	}
}

function isReadyStatus(status: number) {
	return (status >= 200 && status < 404) || (status >= 400 && status <= 403);
}

async function stopStaleServer() {
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
		// Ignore stale PID files that no longer point to a live process.
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
