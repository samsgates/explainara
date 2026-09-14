import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

const app=Fastify({logger:true});
await app.register(cors,{origin:true,credentials:true});
await app.register(websocket);

type Client={socket:import("ws").WebSocket; userId:string};
const rooms=new Map<string,Set<Client>>();

app.get("/health",async()=>({ok:true,service:"explainara-realtime",rooms:rooms.size}));
app.get("/ws/classrooms/:id",{websocket:true},(socket,request)=>{
  const roomId=(request.params as {id:string}).id;
  const userId=String((request.query as {userId?:string}).userId??`guest-${crypto.randomUUID().slice(0,6)}`);
  const client={socket,userId};
  const room=rooms.get(roomId)??new Set<Client>(); room.add(client); rooms.set(roomId,room);
  broadcast(roomId,{type:"presence",userId,status:"joined",at:new Date().toISOString()});
  socket.on("message",raw=>{try{const event=JSON.parse(raw.toString());broadcast(roomId,{...event,userId,roomId,at:new Date().toISOString()});}catch{socket.send(JSON.stringify({type:"error",message:"invalid JSON"}));}});
  socket.on("close",()=>{room.delete(client);if(room.size===0)rooms.delete(roomId);broadcast(roomId,{type:"presence",userId,status:"left",at:new Date().toISOString()});});
});

function broadcast(roomId:string,message:unknown){for(const client of rooms.get(roomId)??[]){if(client.socket.readyState===1)client.socket.send(JSON.stringify(message));}}

const port=Number(process.env.REALTIME_PORT??3010);
await app.listen({port,host:"0.0.0.0"});
