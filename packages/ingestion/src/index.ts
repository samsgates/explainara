export type SourceKind="text"|"website"|"github"|"youtube"|"document"|"paper";
export type SourceDocument={id:string;kind:SourceKind;title:string;text:string;uri?:string;metadata:Record<string,unknown>};
export type Chunk={id:string;documentId:string;text:string;index:number;metadata:Record<string,unknown>};

export function chunkDocument(doc:SourceDocument,maxChars=1800,overlap=220):Chunk[]{
  const paragraphs=doc.text.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  const chunks:Chunk[]=[]; let buffer=""; let index=0;
  for(const p of paragraphs){
    if(buffer && buffer.length+p.length+2>maxChars){chunks.push({id:`${doc.id}:${index}`,documentId:doc.id,text:buffer,index,metadata:doc.metadata});index++;buffer=buffer.slice(Math.max(0,buffer.length-overlap));}
    buffer+=(buffer?"\n\n":"")+p;
  }
  if(buffer)chunks.push({id:`${doc.id}:${index}`,documentId:doc.id,text:buffer,index,metadata:doc.metadata});
  return chunks;
}

export async function fetchWebsite(url:string):Promise<SourceDocument>{
  const response=await fetch(url,{headers:{"user-agent":"ExplainaraKnowledgeBot/0.1"}});
  if(!response.ok)throw new Error(`Source fetch failed: ${response.status}`);
  const html=await response.text();
  const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g,"").trim()??url;
  const text=html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
  return {id:crypto.randomUUID(),kind:"website",title,text,uri:url,metadata:{fetchedAt:new Date().toISOString()}};
}

export function fromText(title:string,text:string):SourceDocument{return{id:crypto.randomUUID(),kind:"text",title,text,metadata:{}}}

export function githubRawCandidates(repoUrl:string){
  const clean=repoUrl.replace(/\/$/,"");
  return ["README.md","docs/README.md","package.json","pyproject.toml"].map(path=>({path,url:`${clean.replace("github.com","raw.githubusercontent.com")}/main/${path}`}));
}
