import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
from html.parser import HTMLParser
import json
import csv
import os
import ssl

class AspNetFormParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inputs = {}
        self.opts = {}
        self.cur_sel = None
        self.table_data = []
        self.in_table = False
        self.in_tr = False
        self.in_td = False
        self.current_row = []
        self.current_cell = ""
        self.is_header = False

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == "input" and "name" in attr_dict:
            self.inputs[attr_dict["name"]] = attr_dict.get("value", "")
        elif tag == "select" and "name" in attr_dict:
            self.cur_sel = attr_dict["name"]
            self.opts[self.cur_sel] = []
        elif tag == "option" and self.cur_sel and "value" in attr_dict:
            self.opts[self.cur_sel].append(attr_dict["value"])
        elif tag == "table" and "GridView1" in attr_dict.get("id", ""):
            self.in_table = True
        elif tag == "tr" and self.in_table:
            self.in_tr = True
            self.current_row = []
        elif tag in ("td", "th") and self.in_tr:
            self.in_td = True
            self.current_cell = ""
            self.is_header = (tag == "th")
        elif tag == "br" and self.in_td:
            self.current_cell += " "

    def handle_endtag(self, tag):
        if tag == "select":
            self.cur_sel = None
        elif tag == "table" and self.in_table:
            self.in_table = False
        elif tag == "tr" and self.in_table:
            self.in_tr = False
            if self.current_row:
                self.table_data.append(self.current_row)
        elif tag in ("td", "th") and self.in_table and self.in_tr:
            self.in_td = False
            self.current_row.append(self.current_cell.strip())
            
    def handle_data(self, data):
        if self.in_td:
            self.current_cell += data.replace("\r", "").replace("\n", " ").strip() + " "

def main():
    target_round = "5"
    url = "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx"
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPSHandler(context=ctx),
        urllib.request.HTTPCookieProcessor(cj)
    )
    opener.addheaders = [("User-Agent", "Mozilla/5.0")]
    
    print("Fetching initial page...")
    html = opener.open(url, timeout=30).read().decode('utf-8')
    parser = AspNetFormParser()
    parser.feed(html)
    
    state = {}
    
    def post(target, **kwargs):
        nonlocal parser, html
        state.update({
            "__VIEWSTATE": parser.inputs.get("__VIEWSTATE", ""),
            "__VIEWSTATEGENERATOR": parser.inputs.get("__VIEWSTATEGENERATOR", ""),
            "__EVENTVALIDATION": parser.inputs.get("__EVENTVALIDATION", "")
        })
        state.update(kwargs)
        
        post_d = state.copy()
        post_d["__EVENTTARGET"] = target
        post_d["__EVENTARGUMENT"] = ""
        
        req = urllib.request.Request(url, data=urllib.parse.urlencode(post_d).encode('utf-8'))
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        html = opener.open(req, timeout=60).read().decode('utf-8')
        parser = AspNetFormParser()
        parser.feed(html)
        return parser

    print("Selecting Round 5...")
    post("ctl00$ContentPlaceHolder1$ddlroundno", **{"ctl00$ContentPlaceHolder1$ddlroundno": target_round})
    
    print("Selecting Institute Type ALL...")
    post("ctl00$ContentPlaceHolder1$ddlInstype", **{"ctl00$ContentPlaceHolder1$ddlInstype": "ALL"})
    
    print("Selecting Institute Name ALL...")
    post("ctl00$ContentPlaceHolder1$ddlInstitute", **{"ctl00$ContentPlaceHolder1$ddlInstitute": "ALL"})
    
    print("Selecting Branch ALL...")
    post("ctl00$ContentPlaceHolder1$ddlBranch", **{"ctl00$ContentPlaceHolder1$ddlBranch": "ALL"})
    
    print("Selecting Seat Type ALL...")
    post("ctl00$ContentPlaceHolder1$ddlSeattype", **{"ctl00$ContentPlaceHolder1$ddlSeattype": "ALL"})
    
    print("Submitting form (this may take a while)...")
    post("", **{"ctl00$ContentPlaceHolder1$btnSubmit": "Submit"})
    
    table = parser.table_data
    if not table:
        print("ERROR: No table found or table is empty!")
        exit(1)
        
    if len(table) < 2:
        print("ERROR: Table only has headers or is empty.")
        exit(1)
        
    headers = table[0]
    
    results = []
    institutes = set()
    programs = set()
    categories = set()
    quotas = set()
    genders = set()
    prep_count = 0
    missing_count = 0
    seen = set()
    duplicate_count = 0
    
    for row in table[1:]:
        if len(row) < 7:
            continue
            
        institute_name = row[0].strip()
        academic_program_name = row[1].strip()
        quota = row[2].strip()
        seat_type = row[3].strip()
        gender_pool = row[4].strip()
        op_str = row[5].strip()
        cl_str = row[6].strip()
        
        is_prep = False
        
        if op_str.endswith('P') or cl_str.endswith('P'):
            is_prep = True
            prep_count += 1
            op_str = op_str.replace('P', '')
            cl_str = cl_str.replace('P', '')
            
        try:
            opening_rank = int(op_str)
            closing_rank = int(cl_str)
        except ValueError:
            opening_rank = None
            closing_rank = None
            missing_count += 1
            
        record = {
            "year": 2026,
            "round": int(target_round),
            "institute_name": institute_name,
            "academic_program_name": academic_program_name,
            "quota": quota,
            "seat_type": seat_type,
            "gender_pool": gender_pool,
            "opening_rank": opening_rank,
            "closing_rank": closing_rank,
            "is_preparatory": is_prep
        }
        
        sig = (institute_name, academic_program_name, quota, seat_type, gender_pool)
        if sig in seen:
            duplicate_count += 1
            continue
        seen.add(sig)
        
        institutes.add(institute_name)
        programs.add(academic_program_name)
        categories.add(seat_type)
        quotas.add(quota)
        genders.add(gender_pool)
        
        results.append(record)
        
    if len(results) == 0:
        print("ERROR: Zero rows extracted successfully.")
        exit(1)
        
    out_dir = "src/data/admission/josaa/2026"
    os.makedirs(out_dir, exist_ok=True)
    
    csv_path = os.path.join(out_dir, "round-5.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
        
    json_path = os.path.join(out_dir, "round-5.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"data": results}, f, indent=2)
        
    print("\n--- EXTRACTION REPORT ---")
    print(f"Total rows: {len(results)}")
    print(f"Unique institutes: {len(institutes)}")
    print(f"Unique programs: {len(programs)}")
    print(f"Unique categories: {len(categories)}")
    print(f"Unique quotas: {len(quotas)}")
    print(f"Unique gender pools: {len(genders)}")
    print(f"Preparatory rows: {prep_count}")
    print(f"Missing ranks rows: {missing_count}")
    print(f"Duplicate rows skipped: {duplicate_count}")
    print(f"Files written to:\n  - {csv_path}\n  - {json_path}")
    print("\nSample rows:")
    for r in results[:5]:
        print(r)

if __name__ == "__main__":
    main()
