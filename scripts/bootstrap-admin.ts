import {PrismaClient} from '../generated/saas';
import {hashPassword} from '../src/lib/saas-auth';
import {z} from 'zod';
import {readFileSync} from 'node:fs';

const args=z.tuple([
  z.string().trim().min(1).max(150),
  z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/),
  z.string().trim().min(1).max(150),
  z.string().trim().toLowerCase().email().max(254),
]);
async function main(){
  const [orgName,slug,displayName,email]=args.parse(process.argv.slice(2));
  const secret=readFileSync(0,'utf8').replace(/\r?\n$/,'');
  if(/[\r\n]/.test(secret))throw new Error('Invalid password');
  const passwordHash=await hashPassword(secret);
  const db=new PrismaClient();
  try{
    const result=await db.$transaction(async tx=>{
      const organization=await tx.organization.create({data:{name:orgName,slug}});
      const account=await tx.account.create({data:{displayName,email,passwordHash}});
      await tx.membership.create({data:{organizationId:organization.id,accountId:account.id,role:'admin'}});
      return {organizationId:organization.id,email:account.email};
    });
    console.log(JSON.stringify(result));
  }finally{await db.$disconnect();}
}
main().catch(()=>{console.error('Provisionnement refusé : données invalides, compte/organisation déjà existant ou base indisponible. Aucun compte existant modifié.');process.exitCode=1;});
