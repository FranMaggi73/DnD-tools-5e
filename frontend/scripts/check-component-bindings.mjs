import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compile, preprocess } from 'svelte/compiler';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

async function check(directory) {
  let errors = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) errors += await check(filename);
    else if (entry.name.endsWith('.svelte')) {
      const source = await preprocess(await readFile(filename, 'utf8'), vitePreprocess(), { filename });
      const { warnings } = compile(source.code, { filename, generate: false });
      for (const warning of warnings.filter(warning => warning.code === 'missing-declaration')) {
        console.error(`${filename}:${warning.start?.line ?? 1}: ${warning.message}`);
        errors++;
      }
    }
  }
  return errors;
}

const errors = await check('src');
if (errors) process.exitCode = 1;
else console.log('Component bindings: OK');
