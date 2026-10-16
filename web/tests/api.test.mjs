import test from 'node:test';
import assert from 'node:assert/strict';
import {api, setCsrf} from '../src/api.mjs';
test('unsafe requests carry CSRF, JSON body and relative team API path', async()=>{
 const original=globalThis.fetch;let sent;globalThis.fetch=async(url,options)=>{sent={url,options};return new Response(JSON.stringify({status:'pending'}),{status:200});};
 try{setCsrf('token');await api('/teams/team-id/applications',{method:'POST',body:{}});assert.equal(sent.url,'/api/teams/team-id/applications');assert.equal(sent.options.headers['X-CSRF-Token'],'token');assert.equal(sent.options.body,'{}');assert.equal(sent.options.credentials,'same-origin');}finally{globalThis.fetch=original;}
});
test('API errors retain stable code and unknown detail fallback',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({code:'custom_error',detail:'Useful detail'}),{status:409});
 try{await assert.rejects(api('/teams'),e=>e.status===409&&e.code==='custom_error'&&e.message==='Useful detail');}finally{globalThis.fetch=original;}
});
test('network failures retain a translatable code instead of browser-specific details',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw new Error('Browser network message');};
 try{await assert.rejects(api('/teams'),e=>e.code==='request_failed'&&!e.message.includes('Browser network'));}finally{globalThis.fetch=original;}
});
