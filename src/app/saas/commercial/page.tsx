import Link from 'next/link';
import {redirect} from 'next/navigation';
import {pageSession} from '@/lib/saas-page';
import {canManageFinance} from '@/lib/saas-logistics';
import {commercialProfile} from '@/lib/commercial-profile';
import CommercialProfileForm from '@/components/saas/commercial-profile-form';
import Unavailable from '@/components/saas/unavailable';

export default async function CommercialSettings(){
  const session=await pageSession();
  if(session.status==='anonymous')redirect('/saas/login');
  if(session.status==='unavailable')return <Unavailable/>;
  if(!canManageFinance(session.identity))return <p role="alert">Accès financier refusé</p>;
  let profile;
  try{profile=await commercialProfile(session.identity);}catch{return <Unavailable/>;}
  return <section className="space-y-4">
    <Link href="/saas" prefetch={false} className="underline">Retour à mon espace</Link>
    <h1 className="text-2xl font-bold">Paramètres commerciaux</h1>
    <p>Ces informations sont utilisées sur les nouveaux devis et conservées lors de leur conversion en facture. Les documents existants ne sont pas modifiés. Les données fiscales déclarées ne sont pas vérifiées.</p>
    <CommercialProfileForm profile={{legalName:profile.legalName,address:profile.address,email:profile.email,phone:profile.phone,taxId:profile.taxId}}/>
  </section>;
}
