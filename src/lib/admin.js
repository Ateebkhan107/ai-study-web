import { auth, clerkClient } from "@clerk/nextjs/server";
import { unstable_rethrow } from "next/navigation";


export async function isAdmin(){


try{


const {userId}=await auth();



if(!userId){

return false;

}



const client =
await clerkClient();



const user =
await client.users.getUser(
userId
);




return (

user.publicMetadata?.role
===

"admin"

);



}

catch(error){

unstable_rethrow(error);

console.log(
"Admin check error",
error
);



return false;


}



}
