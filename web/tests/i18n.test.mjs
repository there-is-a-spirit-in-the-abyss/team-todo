import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogs, t, setLocale, errorMessage, supportedLocales} from '../src/i18n.mjs';
test('five complete locales render interface labels and interpolated names',()=>{
 assert.deepEqual(supportedLocales,['en-US','zh-CN','es','pt-BR','de']);
 for(const locale of supportedLocales){setLocale(locale);assert.ok(t('Log in'));assert.equal(Object.keys(catalogs[locale]).length,Object.keys(catalogs['en-US']).length);assert.equal(t('After {name}',{name:'用户 text'}).includes('用户 text'),true);}
 setLocale('en-US');assert.equal(t('Log in'),'Log in');setLocale('zh-CN');assert.equal(t('Log in'),'登录');
});
test('errors use stable codes with detail fallback and readable network fallback',()=>{
 setLocale('de');assert.notEqual(errorMessage({code:'invalid_credentials',detail:'bad'}),'bad');
 assert.equal(errorMessage({code:'unknown_code',detail:'Specific server detail'}),'Specific server detail');
 assert.ok(errorMessage({}));setLocale('unknown');assert.equal(t('Log in'),'Log in');
});
import fs from 'node:fs';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
test('every static interface key has five nonempty translations, English contains no Chinese',()=>{
 for(const file of fs.readdirSync(new URL('../src',import.meta.url)).filter(f=>/\.(jsx|mjs)$/.test(f)&&f!=='i18n.mjs')){
  const ast=parse(fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8'),{sourceType:'module',plugins:['jsx']});
  traverse(ast,{CallExpression(path){if(path.node.callee.name!=='t'||path.node.arguments[0]?.type!=='StringLiteral')return;const key=path.node.arguments[0].value;for(const locale of supportedLocales)assert.ok(catalogs[locale][key],`${file}: ${locale} missing ${key}`);assert.ok(!/[\u4e00-\u9fff]/.test(catalogs['en-US'][key]),`${file}: English fallback ${key}`);}});
 }
});
test('every stable standalone API code is translated in every locale',()=>{
 const codes=['auth_required','csrf_invalid','origin_invalid','not_member','board_conflict','task_forbidden','project_rename_forbidden','cycle_forbidden','description_too_long','invalid_action','invalid_transfer','member_not_found','application_not_found','already_member','try_again','request_too_large','not_found'];
 for(const locale of supportedLocales){setLocale(locale);for(const code of codes)assert.notEqual(errorMessage({code,detail:'UNTRANSLATED'}),'UNTRANSLATED',`${locale}: ${code}`);}setLocale('en-US');
});
