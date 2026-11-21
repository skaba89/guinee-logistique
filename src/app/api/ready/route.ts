import {PrismaClient} from '../../../../generated/saas';
import {NextResponse} from 'next/server';

export const dynamic='force-dynamic';
let auth:PrismaClient|undefined,tenant:PrismaClient|undefined;
function response(ready:boolean){
  return NextResponse.json({status:ready?'ready':'unavailable',service:'guinee-logistique'},{
    status:ready?200:503,headers:{'Cache-Control':'no-store'},
  });
}
async function restricted(client:PrismaClient,role:'gl_auth'|'gl_tenant',other:'gl_auth'|'gl_tenant'){
  const [result]=await client.$queryRaw<{safe:boolean}[]>`SELECT (NOT r.rolsuper AND NOT r.rolbypassrls AND NOT r.rolcreaterole AND NOT r.rolcreatedb AND NOT r.rolreplication AND pg_has_role(current_user,CAST(${role} AS name),'USAGE') AND NOT pg_has_role(current_user,CAST(${other} AS name),'USAGE')) AS safe FROM pg_roles r WHERE r.rolname=current_user`;
  return result?.safe===true;
}
export async function GET(){
  const authUrl=process.env.SAAS_AUTH_DATABASE_URL,tenantUrl=process.env.SAAS_TENANT_DATABASE_URL;
  if(process.env.SAAS_AUTH_ENABLED!=='true'||!authUrl||!tenantUrl||!/^https:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?$/.test(process.env.SAAS_PUBLIC_ORIGIN??''))return response(false);
  try{
    auth??=new PrismaClient({datasourceUrl:authUrl});
    tenant??=new PrismaClient({datasourceUrl:tenantUrl});
    const [authSafe,tenantSafe]=await Promise.all([restricted(auth,'gl_auth','gl_tenant'),restricted(tenant,'gl_tenant','gl_auth')]);
    if(!authSafe||!tenantSafe)return response(false);
    // Verify schema and access without reading tenant records.
    await Promise.all([
      auth.$queryRaw`SELECT "tokenHash" FROM "Session" LIMIT 0`,
      tenant.$queryRaw`SELECT "id" FROM "MobilePaymentIntent" LIMIT 0`,
    ]);
    return response(true);
  }catch{return response(false);}
}
