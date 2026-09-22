import urllib.request, urllib.parse, ssl, http.cookiejar
from html.parser import HTMLParser

class OptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inputs = {}
        self.opts = {}
        self.cur_sel = None
        self.has_table = False
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
    def handle_endtag(self, tag):
        if tag == "select": self.cur_sel = None

url = "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx), urllib.request.HTTPCookieProcessor(cj))

def post(target, **kwargs):
    global html, p
    d = {
        "__EVENTTARGET": target,
        "__EVENTARGUMENT": "",
        "__VIEWSTATE": p.inputs.get("__VIEWSTATE", ""),
        "__VIEWSTATEGENERATOR": p.inputs.get("__VIEWSTATEGENERATOR", ""),
        "__EVENTVALIDATION": p.inputs.get("__EVENTVALIDATION", "")
    }
    d.update(kwargs)
    req = urllib.request.Request(url, data=urllib.parse.urlencode(d).encode('utf-8'))
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    html = opener.open(req).read().decode('utf-8')
    p = OptParser()
    p.feed(html)
    return p

print("GET")
html = opener.open(url).read().decode('utf-8')
p = OptParser()
p.feed(html)

print("POST round")
post("ctl00$ContentPlaceHolder1$ddlroundno", **{"ctl00$ContentPlaceHolder1$ddlroundno": "5"})

print("POST instype")
post("ctl00$ContentPlaceHolder1$ddlInstype", **{
    "ctl00$ContentPlaceHolder1$ddlroundno": "5",
    "ctl00$ContentPlaceHolder1$ddlInstype": "ALL"
})

print("POST inst")
post("ctl00$ContentPlaceHolder1$ddlInstitute", **{
    "ctl00$ContentPlaceHolder1$ddlroundno": "5",
    "ctl00$ContentPlaceHolder1$ddlInstype": "ALL",
    "ctl00$ContentPlaceHolder1$ddlInstitute": "ALL"
})

print("POST branch")
post("ctl00$ContentPlaceHolder1$ddlBranch", **{
    "ctl00$ContentPlaceHolder1$ddlroundno": "5",
    "ctl00$ContentPlaceHolder1$ddlInstype": "ALL",
    "ctl00$ContentPlaceHolder1$ddlInstitute": "ALL",
    "ctl00$ContentPlaceHolder1$ddlBranch": "ALL"
})

print("POST submit")
post("", **{
    "ctl00$ContentPlaceHolder1$ddlroundno": "5",
    "ctl00$ContentPlaceHolder1$ddlInstype": "ALL",
    "ctl00$ContentPlaceHolder1$ddlInstitute": "ALL",
    "ctl00$ContentPlaceHolder1$ddlBranch": "ALL",
    "ctl00$ContentPlaceHolder1$ddlSeattype": "ALL",
    "ctl00$ContentPlaceHolder1$btnSubmit": "Submit"
})

print("Has table?", p.has_table)
