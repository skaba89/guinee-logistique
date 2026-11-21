// Code 39: each symbol has nine alternating bar/space elements, three wide.
const patterns: Record<string,number> = {
  '0':0x034,'1':0x121,'2':0x061,'3':0x160,'4':0x031,'5':0x130,'6':0x070,'7':0x025,'8':0x124,'9':0x064,
  A:0x109,B:0x049,C:0x148,D:0x019,E:0x118,F:0x058,'*':0x094,
};
export function barcodeBars(code:string) {
  if(!/^[0-9A-F]{16}$/.test(code))throw new Error('Invalid parcel barcode');
  let x=10;
  const bars:{x:number;width:number}[]=[];
  for(const char of '*'+code+'*'){
    const pattern=patterns[char];
    for(let i=0;i<9;i++){
      const width=pattern & (1<<(8-i)) ? 3 : 1;
      if(i%2===0)bars.push({x,width});
      x+=width;
    }
    x++;
  }
  return {bars,width:x+9};
}
