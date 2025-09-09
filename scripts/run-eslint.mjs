#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eslintBin = join(__dirname, '..', 'node_modules', 'eslint', 'bin', 'eslint.js');
const args = process.argv.slice(2);

const child = spawn(process.execPath, [eslintBin, ...args], { stdio: 'inherit' });

child.on('exit', (code) => process.exit(code ?? 0));
