import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCanonicalChaptersForSubject, getChapterTargets, getSubjectTargets, normalizeChapterName } from "@/lib/pyqChapterMapping";


export async function GET(req){


const {searchParams}=new URL(req.url);


const exam =
searchParams.get("exam");


const subject =
searchParams.get("subject");



let query = supabase
.from("pyq_questions")
.select("chapter")
.eq("status", "PUBLISHED")
.not("exam_id", "is", null);



if(exam){

query=query.eq(
"exam",
exam
);

}


if(subject){
  const subjectsArray = subject
    .split(",")
    .flatMap((s) => getSubjectTargets(s.trim()))
    .filter(Boolean);
  query = query.in("subject", subjectsArray);
}



const {data,error}=await query;



if(error){

return NextResponse.json(
{
error:"Failed loading chapters"
},
{
status:500
}
);

}




const subjectList = subject
  ? subject.split(",").map((s) => s.trim()).filter(Boolean)
  : [];
const canonicalOrder = subjectList.flatMap((subjectName) => getCanonicalChaptersForSubject(subjectName));
const orderIndex = new Map(canonicalOrder.map((chapter, index) => [chapter, index]));
const rawChapters = new Set((data || []).map((item) => item.chapter).filter(Boolean));
const chaptersSet = new Set();

for (const canonicalChapter of canonicalOrder) {
  if (getChapterTargets(canonicalChapter).some((target) => rawChapters.has(target))) {
    chaptersSet.add(canonicalChapter);
  }
}

for (const chapter of rawChapters) {
  const normalizedChapter = normalizeChapterName(chapter);
  if (canonicalOrder.includes(normalizedChapter)) {
    chaptersSet.add(normalizedChapter);
  } else if (canonicalOrder.length === 0 && normalizedChapter) {
    chaptersSet.add(normalizedChapter);
  }
}

const chapters = [...chaptersSet];

chapters.sort((a, b) => {
  const indexA = orderIndex.has(a) ? orderIndex.get(a) : Number.MAX_SAFE_INTEGER;
  const indexB = orderIndex.has(b) ? orderIndex.get(b) : Number.MAX_SAFE_INTEGER;
  if (indexA !== indexB) return indexA - indexB;
  return a.localeCompare(b);
});



return NextResponse.json(
chapters
);


}
