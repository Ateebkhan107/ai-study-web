export async function savePYQAttempt(data){

const res = await fetch(
"/api/pyq-attempts",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

}
);


if(!res.ok){
const errorBody = await res.json().catch(() => ({}));
throw new Error(errorBody.error || "Failed saving attempt");
}


return res.json();

}