import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { createRequire } from 'node:module';

const ajv = new Ajv2020({ allErrors: true, strict: false });
// Support compiling schemas that declare $schema draft-07
const require = createRequire(import.meta.url);
const draft7Meta = require('ajv/dist/refs/json-schema-draft-07.json');
ajv.addMetaSchema(draft7Meta);
// Ajv ships draft-07 metaschema with an http:// id, but our test schemas use https://
// Register an alias so either URI resolves correctly during compilation
ajv.addSchema(draft7Meta, 'https://json-schema.org/draft-07/schema#');

export function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function loadSchema(schemaPath) {
  const abs = path.resolve(process.cwd(), schemaPath);
  return readJson(abs);
}

export function validateJson(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors?.map((e) => `${e.instancePath || '/'} ${e.message}`).join('\n');
    throw new Error(`JSON does not match schema:\n${errors}`);
  }
}
