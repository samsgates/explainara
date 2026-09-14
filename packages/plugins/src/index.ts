export type PluginKind="content-source"|"ai-provider"|"simulation"|"assessment"|"lms"|"analytics"|"storage"|"voice"|"video";
export type PluginManifest={id:string;name:string;version:string;kind:PluginKind;description:string;permissions:string[];configSchema?:Record<string,unknown>};
export class PluginRegistry{private map=new Map<string,PluginManifest>();register(plugin:PluginManifest){if(this.map.has(plugin.id))throw new Error(`Plugin already registered: ${plugin.id}`);this.map.set(plugin.id,plugin);return this}list(kind?:PluginKind){const all=[...this.map.values()];return kind?all.filter(x=>x.kind===kind):all}get(id:string){return this.map.get(id)}}
export const plugins=new PluginRegistry()
  .register({id:"openmaic",name:"OpenMAIC Classroom",version:"1",kind:"simulation",description:"Render/generate OpenMAIC-compatible interactive classroom content.",permissions:["course:read","course:render"]})
  .register({id:"xapi",name:"xAPI Export",version:"1",kind:"lms",description:"Emit learning evidence as xAPI-compatible statements.",permissions:["events:read"]});

export function toXapiStatement(event:{userId:string;verb:string;objectId:string;result?:Record<string,unknown>}){return{actor:{account:{name:event.userId,homePage:"https://explainara.local"}},verb:{id:`https://w3id.org/xapi/adl/verbs/${event.verb}`,display:{"en-US":event.verb}},object:{id:event.objectId},result:event.result,timestamp:new Date().toISOString()}}
