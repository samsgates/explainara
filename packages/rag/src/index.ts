import type { Chunk } from "@explainara/ingestion";
export type SearchHit={chunk:Chunk;score:number};
export interface Retriever{upsert(chunks:Chunk[]):Promise<void>;search(query:string,limit?:number):Promise<SearchHit[]>}

export class InMemoryRetriever implements Retriever{
  private chunks:Chunk[]=[];
  async upsert(chunks:Chunk[]){const ids=new Set(chunks.map(c=>c.id));this.chunks=[...this.chunks.filter(c=>!ids.has(c.id)),...chunks];}
  async search(query:string,limit=6){const terms=query.toLowerCase().split(/\W+/).filter(t=>t.length>2);return this.chunks.map(chunk=>{const text=chunk.text.toLowerCase();const hits=terms.filter(t=>text.includes(t)).length;return{chunk,score:terms.length?hits/terms.length:0}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
}

export class QdrantRetriever implements Retriever{
  constructor(private readonly baseUrl:string,private readonly collection:string,private readonly embed:(texts:string[])=>Promise<number[][]>){}
  async upsert(chunks:Chunk[]){const vectors=await this.embed(chunks.map(c=>c.text));await fetch(`${this.baseUrl}/collections/${this.collection}/points?wait=true`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({points:chunks.map((c,i)=>({id:hashId(c.id),vector:vectors[i],payload:{...c}}))})});}
  async search(query:string,limit=6){const [vector]=await this.embed([query]);if(!vector)return[];const response=await fetch(`${this.baseUrl}/collections/${this.collection}/points/search`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({vector,limit,with_payload:true})});if(!response.ok)throw new Error(`Qdrant search failed ${response.status}`);const json=await response.json() as {result:Array<{score:number;payload:Chunk}>};return json.result.map(x=>({score:x.score,chunk:x.payload}));}
}
function hashId(value:string){let h=2166136261;for(const c of value)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
