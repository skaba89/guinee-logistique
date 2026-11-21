import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {BillingDocument,BillingLine} from '../../generated/saas';

const gnf=(value:number)=>String(value).replace(/\B(?=(\d{3})+(?!\d))/g,' ')+' GNF';
export function billingPdf(document:BillingDocument&{lines:BillingLine[];organizationName:string}){
  const pdf=new jsPDF({unit:'mm',format:'a4'});
  pdf.setFillColor(15,118,110);pdf.rect(0,0,210,34,'F');
  pdf.setTextColor(255,255,255);pdf.setFontSize(18);pdf.text('GUINÉE LOGISTIQUE',14,14);
  pdf.setFontSize(12);pdf.text(document.status==='invoice'?'FACTURE INTERNE':'DEVIS',14,25);
  pdf.setTextColor(30,41,59);pdf.setFontSize(10);
  const organization=pdf.splitTextToSize('Organisation : '+document.organizationName,180);
  pdf.text(organization,14,44);
  let y=44+organization.length*5;
  pdf.text('Référence : '+(document.invoiceNumber??document.quoteNumber),14,y);y+=5;
  pdf.text('Date : '+(document.issuedAt??document.createdAt).toISOString().slice(0,10),14,y);y+=5;
  const customer=pdf.splitTextToSize('Client : '+document.customerName,180);
  pdf.text(customer,14,y);y+=customer.length*5+3;
  autoTable(pdf,{startY:y,head:[['Prestation','Qté','Prix GNF','Taxe GNF','Total GNF']],body:document.lines.map(l=>[l.description,String(l.quantity),String(l.unitPrice),String(l.tax),String(l.total)]),styles:{fontSize:9,overflow:'linebreak'},headStyles:{fillColor:[15,118,110]},columnStyles:{0:{cellWidth:75},1:{halign:'right'},2:{halign:'right'},3:{halign:'right'},4:{halign:'right'}},margin:{left:14,right:14,bottom:22}});
  // autoTable returns its final position on the last page.
  const last=(pdf as jsPDF&{lastAutoTable?:{finalY:number}}).lastAutoTable;
  y=(last?.finalY??y)+10;
  if(y>235){pdf.addPage();y=20;}
  pdf.setFontSize(11);
  pdf.text('Sous-total : '+gnf(document.subtotal),14,y);y+=6;
  pdf.text('Taxes : '+gnf(document.taxTotal),14,y);y+=6;
  pdf.setFont('helvetica','bold');pdf.text('TOTAL : '+gnf(document.total),14,y);y+=6;
  pdf.setFont('helvetica','normal');
  if(document.status==='invoice'){pdf.text('Encaissé : '+gnf(document.paid),14,y);y+=6;pdf.text('Avoirs : '+gnf(document.credited),14,y);y+=6;pdf.text('Solde : '+gnf(document.total-document.paid-document.credited),14,y);}
  for(let page=1;page<=pdf.getNumberOfPages();page++){
    pdf.setPage(page);pdf.setFontSize(8);pdf.setTextColor(90);
    pdf.text('Document interne - conformité fiscale non validée',14,285);
    pdf.text(String(page)+' / '+pdf.getNumberOfPages(),195,285,{align:'right'});
  }
  return pdf.output('arraybuffer');
}

// Quote RFC-style cells; neutralize spreadsheet formulas before serialization.
export function csvCell(value:string|number){
  let cell=String(value);
  if(typeof value==='string'&&/^[\s\u0000-\u001f]*[=+\-@]/.test(cell))cell="'"+cell;
  return '"'+cell.replace(/"/g,'""')+'"';
}
export function billingCsv(documents:BillingDocument[]){
  const header=['Reference','Date','Client','Sous-total GNF','Taxes GNF','Total GNF','Encaisse GNF','Avoirs GNF','Solde GNF'];
  return '\uFEFF'+[header,...documents.map(d=>[d.invoiceNumber??'',d.issuedAt?.toISOString().slice(0,10)??'',d.customerName,d.subtotal,d.taxTotal,d.total,d.paid,d.credited,d.total-d.paid-d.credited])].map(row=>row.map(csvCell).join(';')).join('\r\n')+'\r\n';
}
