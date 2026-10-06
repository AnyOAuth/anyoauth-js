import { AnyOAuth, SDKError } from '../index.js';
let out;
try {
  const chunks = []; for await (const chunk of process.stdin) chunks.push(chunk);
  const v = JSON.parse(Buffer.concat(chunks).toString());
  const client = new AnyOAuth({clientId:v.clientId ?? 'conformance',clientSecret:v.clientSecret,baseUrl:v.baseUrl});
  const allowed = ['exchangeCode','profile','revoke','providers','pkceChallenge','authorizationUrl','validateCallback','createTransaction'];
  if (!allowed.includes(v.action) || typeof client[v.action] !== 'function') throw new SDKError(0,'unsupported_action','Unsupported action');
  out = {ok:true,result:(await client[v.action](v.params ?? {})) ?? null};
} catch (e) { const error = e instanceof SDKError ? e : new SDKError(); out = {ok:false,error:{status:error.status,code:error.code,message:error.message}}; }
console.log(JSON.stringify(out));
