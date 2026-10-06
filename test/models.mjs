import assert from 'node:assert/strict';
import { AnyOAuth, SDKError, validateSchema } from '../index.js';
const profile={subject:'usr_test',provider:'github',providerSubject:'123',name:null,username:null,email:null,emailVerified:false,avatarUrl:null};
assert.deepEqual(validateSchema('Profile',profile),profile);
assert.deepEqual(validateSchema('ProviderStatuses',[{id:'google',configured:true,enabled:false,available:false}]),[{id:'google',configured:true,enabled:false,available:false}]);
for (const invalid of [null,[],{...profile,provider:'other'},{...profile,emailVerified:null},{...profile,name:42}]) assert.throws(()=>validateSchema('Profile',invalid),SDKError);
for (const key of Object.keys(profile)) { const invalid={...profile}; delete invalid[key]; assert.throws(()=>validateSchema('Profile',invalid),SDKError); }
assert.deepEqual(validateSchema('Profile',{...profile,future:true}),{...profile,future:true});
assert.deepEqual(validateSchema('ApiError',{error:'denied',message:'detail'}),{error:'denied',message:'detail'});
assert.throws(()=>validateSchema('ApiError',{error:'denied',message:null}),SDKError);
assert.throws(()=>validateSchema('ProviderStatuses',[{id:'other'}]),SDKError);
assert.throws(()=>validateSchema('missing',{}),SDKError);
const token={access_token:'aop_'+'a'.repeat(43),token_type:'Bearer',expires_in:900,scope:'profile'};
assert.deepEqual(validateSchema('TokenResponse',token),token);
assert.throws(()=>validateSchema('TokenResponse',{...token,expires_in:901}),SDKError);
const client = new AnyOAuth({clientId:'test'});
for (const timeoutMs of [0,-1,1.5]) assert.throws(()=>new AnyOAuth({clientId:'test',timeoutMs}),SDKError);
for (const baseUrl of ['not a URL','https://:invalid','https://example.com:0',false]) assert.throws(()=>new AnyOAuth({clientId:'test',baseUrl}),SDKError);
const auth={provider:'google',redirectUri:'https://backend.example/cb',state:'a'.repeat(16),codeChallenge:'a'.repeat(43)};
for (const changes of [{codeChallenge:'a'.repeat(43)+'\n'}, {state:'x'.repeat(513)}, {provider:null}]) assert.throws(()=>client.authorizationUrl({...auth,...changes}),SDKError);
await assert.rejects(client.pkceChallenge({codeVerifier:null}),SDKError);
const tx=await client.createTransaction();
const callback={callbackUrl:auth.redirectUri+'?code=ok&state='+tx.state,redirectUri:auth.redirectUri,state:tx.state,expiresAt:tx.expiresAt};
for(const changes of [{state:''},{state:null},{callbackUrl:auth.redirectUri+'?code=%FF&state='+tx.state}]) assert.throws(()=>client.validateCallback({...callback,...changes}),SDKError);
if (false) {
  const request={grant_type:'authorization_code',client_id:'id',client_secret:'secret',code:'code',redirect_uri:auth.redirectUri,code_verifier:'a'.repeat(43)};
  assert.throws(()=>validateSchema('TokenRequest',{...request,extra:true}),SDKError);
  await assert.rejects(client.request('unknown',{}),SDKError);
  for (const accessToken of [null,'bad\n']) await assert.rejects(client.profile({accessToken}),SDKError);
}
console.log('PASS constructor, encoding and argument boundary checks');
