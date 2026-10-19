// Never accept a caller-supplied Sites identity on a public Vercel deployment.
export function trustedHeaders(request,verifiedUserId){const headers=new Headers(request.headers);for(const name of [...headers.keys()])if(name.startsWith('oai-authenticated-user-'))headers.delete(name);if(verifiedUserId)headers.set('oai-authenticated-user-id',verifiedUserId);return headers;}
