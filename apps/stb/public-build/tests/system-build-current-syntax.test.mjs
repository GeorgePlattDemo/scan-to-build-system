import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('system-build-current inline scripts parse', () => {
  const html=fs.readFileSync(new URL('../system-build-current.html',import.meta.url),'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match=>match[1])
    .filter(source=>source.trim());
  assert.ok(scripts.length>0);
  scripts.forEach((source,index)=>{
    assert.doesNotThrow(()=>new vm.Script(source,{filename:'system-build-current.inline-'+(index+1)+'.js'}));
  });
});
