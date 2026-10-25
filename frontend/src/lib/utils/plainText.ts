export function plainText(value: string, maxLength?: number): string {
  const entities:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  let result=String(value || '').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(match,key:string)=>{
      if(key[0]!=='#') return entities[key.toLowerCase()] || match;
      const code=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1));
      return code>0 && code<=0x10ffff && !(code>=0xd800&&code<=0xdfff)?String.fromCodePoint(code):match;
    }).replace(/\s+/g,' ').trim();
  if(maxLength && result.length>maxLength) result=result.slice(0,maxLength)+'…';
  return result;
}
