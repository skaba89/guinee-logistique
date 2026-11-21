import { barcodeBars } from '@/lib/parcel-barcode';

export default function ParcelLabel({code}:{code:string}) {
  const {bars,width}=barcodeBars(code);
  return <figure className="inline-block bg-white text-black p-2 rounded max-w-full">
    <svg role="img" aria-label={'Code-barres '+code} xmlns="http://www.w3.org/2000/svg" viewBox={'0 0 '+width+' 48'} className="w-full max-w-md">
      <rect width={width} height={48} fill="white"/>
      {bars.map(bar=><rect key={bar.x} x={bar.x} y={0} width={bar.width} height={48} fill="black"/>)}
    </svg>
    <figcaption className="text-center font-mono text-sm">{code}</figcaption>
  </figure>;
}
