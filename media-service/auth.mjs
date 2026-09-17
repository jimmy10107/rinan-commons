import {createRemoteJWKSet,jwtVerify} from 'jose';
const resolvers=new Map();
export async function verifyOwner(request,env,keyResolver){
 const issuer=env.ACCESS_TEAM_DOMAIN;
 if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer||'')||!env.ACCESS_AUDIENCE||!env.MEDIA_OWNER_EMAIL)throw new Error('Access not configured');
 const token=request.headers.get('cf-access-jwt-assertion');
 if(!token)throw new Error('Authentication required');
 if(!keyResolver){
  if(!resolvers.has(issuer))resolvers.set(issuer,createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`),{timeoutDuration:5000,cooldownDuration:30000,cacheMaxAge:600000}));
  keyResolver=resolvers.get(issuer);
 }
 const {payload}=await jwtVerify(token,keyResolver,{issuer,audience:env.ACCESS_AUDIENCE,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email'],clockTolerance:5});
 if(typeof payload.email!=='string'||payload.email.toLowerCase()!==env.MEDIA_OWNER_EMAIL.trim().toLowerCase())throw new Error('Owner role required');
 return {subject:payload.sub};
}
