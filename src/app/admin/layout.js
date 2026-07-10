import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";


export default async function AdminLayout({

children

}){


const admin =
await isAdmin();



if(!admin){


redirect(
"/dashboard"
);


}




return (

<>

{children}

</>

);


}