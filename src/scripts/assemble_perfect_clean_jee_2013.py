import pymupdf, re, json, os

with open('scratch/answer_keys_2013.json') as f:
    all_keys = json.load(f)

PAPERS = [
    ('scratch/jee_2013_07_apr.pdf', 'JEE-MAIN-13-07APR', '07 Apr Offline', '07 Apr', 'Offline'),
    ('scratch/jee_2013_09_apr.pdf', 'JEE-MAIN-13-09APR', '09 Apr Online', '09 Apr', 'Shift 1'),
    ('scratch/jee_2013_22_apr.pdf', 'JEE-MAIN-13-22APR', '22 Apr Online', '22 Apr', 'Shift 1'),
    ('scratch/jee_2013_23_apr.pdf', 'JEE-MAIN-13-23APR', '23 Apr Online', '23 Apr', 'Shift 1'),
    ('scratch/jee_2013_25_apr.pdf', 'JEE-MAIN-13-25APR', '25 Apr Online', '25 Apr', 'Shift 1'),
]

os.makedirs('tmp/clean_diagrams', exist_ok=True)

def clean_latex(s):
    if not s:
        return ''
    s = s.strip()
    s = s.replace('∈', r' \in ')
    s = s.replace('∉', r' \notin ')
    s = s.replace('≠', r' \neq ')
    s = s.replace('≤', r' \le ')
    s = s.replace('≥', r' \ge ')
    s = s.replace('→', r' \rightarrow ')
    s = s.replace('⇒', r' \implies ')
    s = s.replace('π', r'\pi')
    s = s.replace('θ', r'\theta')
    s = s.replace('ω', r'\omega')
    s = s.replace('σ', r'\sigma')
    s = s.replace('λ', r'\lambda')
    s = s.replace('∈0', r'\epsilon_0')
    s = s.replace('ˆi', r'\hat{i}')
    s = s.replace('ˆj', r'\hat{j}')
    s = s.replace('ˆk', r'\hat{k}')
    s = s.replace('−', '-')
    s = s.replace('√', r'\sqrt')
    s = s.replace(' ', ' ')
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

all_dataset = []

for pdf_path, paper_code, name, attempt, shift in PAPERS:
    doc = pymupdf.open(pdf_path)
    paper_keys = all_keys[paper_code]
    out_diag_dir = f'tmp/clean_diagrams/{paper_code}'
    os.makedirs(out_diag_dir, exist_ok=True)
    
    # Extract lines page by page
    all_pages_lines = []
    q_page_locs = []
    
    for pno in range(len(doc)):
        if pno >= len(doc) - 2 and 'ANSWER KEY' in doc[pno].get_text().upper():
            continue
        page = doc[pno]
        words = page.get_text('words')
        words = [w for w in words if 45 <= w[1] <= page.rect.height - 40]
        
        # Expand concatenated Q markers like Q41.For -> Q41. For
        expanded = []
        for w in words:
            m = re.match(r'^(Q\d+\.)([A-Za-z0-9].*)$', w[4])
            if m:
                expanded.append((w[0], w[1], w[2], w[3], m.group(1), w[5], w[6], w[7]))
                expanded.append((w[0] + 15, w[1], w[2], w[3], m.group(2), w[5], w[6], w[7]))
            else:
                expanded.append(w)
                
        # Group into lines
        lines = []
        for w in sorted(expanded, key=lambda w: (w[1], w[0])):
            placed = False
            for line in lines:
                if abs(line['y'] - w[1]) < 3.8:
                    line['words'].append(w)
                    line['y'] = (line['y'] * (len(line['words']) - 1) + w[1]) / len(line['words'])
                    placed = True
                    break
            if not placed:
                lines.append({'y': w[1], 'words': [w], 'pno': pno})
                
        lines.sort(key=lambda l: l['y'])
        for l in lines:
            l['words'].sort(key=lambda w: w[0])
            line_str = ' '.join([w[4] for w in l['words']]).strip()
            if line_str:
                all_pages_lines.append((pno, l['y'], line_str))
                qm = re.match(r'^Q(\d+)\.', line_str)
                if qm:
                    q_page_locs.append({
                        'qnum': int(qm.group(1)),
                        'pno': pno,
                        'y0': l['y']
                    })
                    
    full_text = '\n'.join([l[2] for l in all_pages_lines])
    q_matches = list(re.finditer(r'(?:^|\s)Q(\d+)\.\s*', full_text))
    # Deduplicate matches by qnum
    seen_q = set()
    uniq_matches = []
    for m in q_matches:
        qn = int(m.group(1))
        if qn not in seen_q:
            seen_q.add(qn)
            uniq_matches.append(m)
    q_matches = sorted(uniq_matches, key=lambda m: int(m.group(1)))
    
    # Extract diagrams
    diagram_map = {}
    q_page_locs.sort(key=lambda x: x['qnum'])
    for idx in range(len(q_page_locs)):
        cur = q_page_locs[idx]
        qnum = cur['qnum']
        pno = cur['pno']
        y0 = cur['y0'] - 5
        y1 = q_page_locs[idx+1]['y0'] - 5 if (idx + 1 < len(q_page_locs) and q_page_locs[idx+1]['pno'] == pno) else doc[pno].rect.height - 40
        page = doc[pno]
        for img in page.get_images():
            xref = img[0]
            for r in page.get_image_rects(xref):
                if (y0 <= r.y0 <= y1 or y0 <= r.y1 <= y1 or (r.y0 <= y0 and r.y1 >= y1)):
                    # Check dimensions for genuine diagram (width > 65 and height > 40)
                    if r.width > 65 and r.height > 40:
                        base = doc.extract_image(xref)
                        ext = base["ext"]
                        diag_filename = f"{out_diag_dir}/q{qnum}_diagram.{ext}"
                        with open(diag_filename, "wb") as f:
                            f.write(base["image"])
                        diagram_map[qnum] = diag_filename
                        
    print(f'{paper_code}: Processed {len(q_matches)} questions, {len(diagram_map)} diagrams.')
    
    for idx, match in enumerate(q_matches):
        qnum = int(match.group(1))
        start_pos = match.end()
        end_pos = q_matches[idx+1].start() if idx + 1 < len(q_matches) else len(full_text)
        q_raw = full_text[start_pos:end_pos].strip()
        
        # Clean footers
        q_raw = re.sub(r'Join the Most Relevant Test Series.*', '', q_raw, flags=re.DOTALL | re.IGNORECASE)
        q_raw = re.sub(r'JEE Main 2013.*?(?:Question Paper|MathonGo)', '', q_raw, flags=re.DOTALL | re.IGNORECASE)
        q_raw = re.sub(r'-- \d+ of \d+ --', '', q_raw)
        
        # Extract options (1), (2), (3), (4)
        opt_matches = list(re.finditer(r'(?:^|\s)\(([1-4])\)\s*', q_raw))
        if len(opt_matches) >= 4:
            q_stem = q_raw[:opt_matches[0].start()].strip()
            opts = {}
            for o_idx in range(len(opt_matches)):
                o_num = int(opt_matches[o_idx].group(1))
                o_start = opt_matches[o_idx].end()
                o_end = opt_matches[o_idx+1].start() if o_idx + 1 < len(opt_matches) else len(q_raw)
                opts[o_num] = q_raw[o_start:o_end].strip()
            opt_a = opts.get(1, 'Option (A)')
            opt_b = opts.get(2, 'Option (B)')
            opt_c = opts.get(3, 'Option (C)')
            opt_d = opts.get(4, 'Option (D)')
        else:
            q_stem = q_raw
            opt_a = 'Option (A)'
            opt_b = 'Option (B)'
            opt_c = 'Option (C)'
            opt_d = 'Option (D)'
            
        ans_num = paper_keys.get(str(qnum), 1)
        opt_char_map = {1: 'a', 2: 'b', 3: 'c', 4: 'd'}
        
        if qnum <= 30:
            subject = 'Physics'
        elif qnum <= 60:
            subject = 'Chemistry'
        else:
            subject = 'Mathematics'
            
        diag_path = diagram_map.get(qnum)
        
        all_dataset.append({
            'qnum': qnum,
            'paper_code': paper_code,
            'attempt': attempt,
            'shift': shift,
            'subject': subject,
            'question_text': clean_latex(q_stem),
            'option_a': clean_latex(opt_a),
            'option_b': clean_latex(opt_b),
            'option_c': clean_latex(opt_c),
            'option_d': clean_latex(opt_d),
            'correct_option': opt_char_map.get(ans_num, 'a'),
            'ans_num': ans_num,
            'has_diagram': qnum in diagram_map,
            'local_diagram_path': diag_path
        })

print(f'\nTotal questions in complete dataset: {len(all_dataset)}')
with open('scratch/complete_clean_jee_2013.json', 'w') as f:
    json.dump(all_dataset, f, indent=2)
