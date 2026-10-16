import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {newId} from '../src/ids.mjs';
test('HTTP LAN browsers without randomUUID still generate canonical RFC 4122 version 4 identifiers',()=>{
 const insecureContextCrypto={getRandomValues:webcrypto.getRandomValues.bind(webcrypto)};
 const ids=Array.from({length:10},()=>newId(insecureContextCrypto));
 for(const id of ids)assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.equal(new Set(ids).size,ids.length);
});
test('secure contexts may use their native randomUUID implementation',()=>{
 assert.equal(newId({randomUUID:()=> '11111111-1111-4111-8111-111111111111'}),'11111111-1111-4111-8111-111111111111');
});
