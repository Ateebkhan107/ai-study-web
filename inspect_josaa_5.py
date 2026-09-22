import urllib.request, urllib.parse, ssl, http.cookiejar
from html.parser import HTMLParser

class OptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inputs = {}
        self.opts = {}
        self.cur_sel = None
        self.has_table = False
        self.error_text = ""
        self.in_error = False
        
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "input" and "name" in d:
            self.inputs[d["name"]] = d.get("value", "")
        elif tag == "select" and "name" in d:
            self.cur_sel = d["name"]
            self.opts[self.cur_sel] = []
        elif tag == "option" and self.cur_sel and "value" in d:
            self.opts[self.cur_sel].append(d["value"])
        elif tag == "table" and d.get("id") == "GridView1":
            self.has_table = True
        elif tag == "div" and d.get("class") == "error-message":
            self.in_error = True
            
    def handle_endtag(self, tag):
        if tag == "select": self.cur_sel = None
        elif tag == "div": self.in_error = False
            
    def handle_data(self, data):
        if self.in_error:
            self.error_text += data.strip() + " "

url = "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx), urllib.request.HTTPCookieProcessor(cj))
opener.addheaders = [("User-Agent", "Mozilla/5.0")]

html = opener.open(url).read().decode('utf-8')
p = OptParser()
p.feed(html)
state = {}

def update_state(new_values):
    state.update({
        "__VIEWSTATE": p.inputs.get("__VIEWSTATE", ""),
        "__VIEWSTATEGENERATOR": p.inputs.get("__VIEWSTATEGENERATOR", ""),
        "__EVENTVALIDATION": p.inputs.get("__EVENTVALIDATION", "")
    })
    state.update(new_values)

def post(target, **kwargs):
    global html, p, state
    update_state(kwargs)
    
    post_d = state.copy()
    post_d["__EVENTTARGET"] = target
    post_d["__EVENTARGUMENT"] = ""
    
    req = urllib.request.Request(url, data=urllib.parse.urlencode(post_d).encode('utf-8'))
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    html = opener.open(req).read().decode('utf-8')
    p = OptParser()
    p.feed(html)
    print("Opts available:", {k: len(v) for k, v in p.opts.items()})
    if p.error_text:
        print("ERROR:", p.error_text)
    return p

print("GET")
print("Opts available:", {k: len(v) for k, v in p.opts.items()})

print("\nPOST round 5")
post("ctl00$ContentPlaceHolder1$ddlroundno", **{"ctl00$ContentPlaceHolder1$ddlroundno": "5"})

print("\nPOST instype ALL")
post("ctl00$ContentPlaceHolder1$ddlInstype", **{"ctl00$ContentPlaceHolder1$ddlInstype": "ALL"})

print("\nPOST inst ALL")
post("ctl00$ContentPlaceHolder1$ddlInstitute", **{"ctl00$ContentPlaceHolder1$ddlInstitute": "ALL"})

print("\nPOST branch ALL")
post("ctl00$ContentPlaceHolder1$ddlBranch", **{"ctl00$ContentPlaceHolder1$ddlBranch": "ALL"})

print("\nPOST seattype ALL")
post("ctl00$ContentPlaceHolder1$ddlSeattype", **{"ctl00$ContentPlaceHolder1$ddlSeattype": "ALL"})

print("\nPOST submit")
post("", **{"ctl00$ContentPlaceHolder1$btnSubmit": "Submit"})

print("\nHas table?", p.has_table)
