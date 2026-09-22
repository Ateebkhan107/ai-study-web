const fs = require('fs');
let content = fs.readFileSync('src/components/analytics/JEEMainPredictor.jsx', 'utf8');

// 1. Add useEffect and supabase import
content = content.replace(
  /import React, { useState, useMemo } from "react";/,
  'import React, { useState, useEffect, useMemo } from "react";\nimport { supabase } from "../../lib/supabaseClient";'
);

// 2. Add Quota state
content = content.replace(
  /const \[branch, setBranch\] = useState\("Computer Science and Engineering"\);/,
  'const [branch, setBranch] = useState("Computer Science and Engineering");\n  const [quota, setQuota] = useState("All");\n  const [loadingColleges, setLoadingColleges] = useState(false);'
);

// 3. Replace the matchedColleges logic
const oldUseMemo = `  const matchedColleges = useMemo(() => {
    if (!hasData && !finalScore) return { likely: [], possible: [], stretch: [] };
    
    const likely = [];
    const possible = [];
    const stretch = [];

    josaaCutoffs.data.forEach(c => {
      // Basic filtering
      if (c.category !== category) return;
      if (c.gender !== gender && c.gender !== "Gender-Neutral") return;
      if (branch !== "Any" && !c.branch.includes(branch)) return;

      const diff = c.closingRank - rawRank;
      
      // Categorization
      if (rawRank <= c.closingRank * 0.8) {
        likely.push(c);
      } else if (rawRank <= c.closingRank * 1.1) {
        possible.push(c);
      } else if (rawRank <= c.closingRank * 1.5) {
        stretch.push(c);
      }
    });

    return { likely: likely.slice(0, 3), possible: possible.slice(0, 3), stretch: stretch.slice(0, 3) };
  }, [rawRank, category, gender, branch, hasData, finalScore]);`;

const newUseEffect = `  const [matchedColleges, setMatchedColleges] = useState({ likely: [], possible: [], stretch: [] });

  let effectiveRank = rawRank;
  if (category === "EWS") effectiveRank = Math.max(1, Math.round(rawRank / 6));
  if (category === "OBC-NCL") effectiveRank = Math.max(1, Math.round(rawRank / 4));
  if (category === "SC") effectiveRank = Math.max(1, Math.round(rawRank / 20));
  if (category === "ST") effectiveRank = Math.max(1, Math.round(rawRank / 40));

  useEffect(() => {
    if (!hasData && !finalScore) {
      setMatchedColleges({ likely: [], possible: [], stretch: [] });
      return;
    }

    let isMounted = true;
    
    async function fetchColleges() {
      setLoadingColleges(true);
      
      let query = supabase
        .from('josaa_cutoffs')
        .select('*')
        .eq('year', 2026)
        .eq('round', 5)
        .eq('seat_type', category)
        .in('gender_pool', [gender, 'Gender-Neutral'])
        .gte('closing_rank', Math.floor(effectiveRank * 0.8))
        .order('closing_rank', { ascending: true })
        .limit(200);

      if (quota !== "All") {
        query = query.eq('quota', quota);
      }
      if (branch !== "Any") {
        query = query.ilike('academic_program_name', \`%\${branch}%\`);
      }

      const { data, error } = await query;
      
      if (!isMounted) return;
      
      if (error) {
        console.error("Error fetching colleges:", error);
        setLoadingColleges(false);
        return;
      }

      const likely = [];
      const possible = [];
      const stretch = [];

      (data || []).forEach(c => {
        if (effectiveRank <= c.closing_rank * 0.8) {
          likely.push(c);
        } else if (effectiveRank <= c.closing_rank * 1.1) {
          possible.push(c);
        } else if (effectiveRank <= c.closing_rank * 1.5) {
          stretch.push(c);
        }
      });

      setMatchedColleges({ 
        likely: likely.slice(0, 4), 
        possible: possible.slice(0, 4), 
        stretch: stretch.slice(0, 4) 
      });
      setLoadingColleges(false);
    }

    fetchColleges();
    
    return () => { isMounted = false; };
  }, [effectiveRank, category, gender, branch, quota, hasData, finalScore]);`;

content = content.replace(oldUseMemo, newUseEffect);

// 4. Add effective rank display right next to the category selector!
content = content.replace(
  /<div>\s*<label className="block text-\[10px\] font-bold uppercase tracking-wider text-slate-500 mb-1">Category<\/label>/,
  `<div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex justify-between">
                  <span>Category</span>
                  {category !== "OPEN" && <span className="text-[9px] text-blue-500 font-medium">Est. Rank: {effectiveRank}</span>}
                </label>`
);

// 5. Add Quota select
content = content.replace(
  /<div className="grid grid-cols-2 gap-3 mb-5">/,
  `<div className="grid grid-cols-3 gap-3 mb-5">`
);

content = content.replace(
  /<\/select>\s*<\/div>\s*<div>\s*<label className="block text-\[10px\] font-bold uppercase tracking-wider text-slate-500 mb-1">Preferred Branch<\/label>/,
  `</select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quota</label>
                <select 
                  value={quota} 
                  onChange={e => setQuota(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                >
                  <option value="All">All Quotas</option>
                  <option value="AI">All India (AI)</option>
                  <option value="HS">Home State (HS)</option>
                  <option value="OS">Other State (OS)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Preferred Branch</label>`
);

// 6. Fix mapped rendering logic to use c.institute_name and c.academic_program_name instead of c.institute and c.branch
content = content.replace(/\{c\.institute\}/g, '{c.institute_name}');
content = content.replace(/\{c\.branch\}/g, '{c.academic_program_name}');
content = content.replace(/\{c\.closingRank\}/g, '{c.closing_rank}');

// 7. Render a loading spinner or text while loadingColleges is true
const noResultsDiv = `<div className="text-center py-6 border border-dashed border-slate-200 rounded-lg dark:border-slate-700">
                <p className="text-sm text-slate-500">No matching colleges found for this criteria.</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your preferences or boosting your score.</p>
              </div>`;

const newNoResultsDiv = `loadingColleges ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg dark:border-slate-700 flex flex-col items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 mb-2"></div>
                <p className="text-sm text-slate-500">Fetching live cutoffs...</p>
              </div>
            ) : matchedColleges.likely.length === 0 && matchedColleges.possible.length === 0 && matchedColleges.stretch.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg dark:border-slate-700">
                <p className="text-sm text-slate-500">No matching colleges found for this criteria.</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your preferences or boosting your score.</p>
              </div>
            )`;

content = content.replace(noResultsDiv, newNoResultsDiv);
content = content.replace(`matchedColleges.likely.length === 0 && matchedColleges.possible.length === 0 && matchedColleges.stretch.length === 0 ? (`, newNoResultsDiv);

fs.writeFileSync('src/components/analytics/JEEMainPredictor.jsx', content);
console.log('Done!');
