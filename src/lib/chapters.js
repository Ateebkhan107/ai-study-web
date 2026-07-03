export async function getChapters(subject){

const url = subject
? `/api/chapters?subject=${subject}`
: `/api/chapters`;


const res = await fetch(url);


if(!res.ok){
throw new Error("Failed loading chapters");
}


return res.json();

}