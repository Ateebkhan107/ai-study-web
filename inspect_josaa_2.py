import urllib.request, urllib.parse, ssl, http.cookiejar
from html.parser import HTMLParser

class OptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inputs = {}
        self.opts = {}
        self.cur_sel = None
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "input" and "name" in d:
            self.inputs[d["name"]] = d.get("value", "")
        elif tag == "select" and "name" in d:
            self.cur_sel = d["name"]
            self.opts[self.cur_sel] = []
        elif tag == "option" and self.cur_sel and "value" in d:
            self.opts[self.cur_sel].append(d["value"])
    def handle_endtag(self, tag):
        if tag == "select": self.cur_sel = None

url = "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx), urllib.request.HTTPCookieProcessor(cj))

# GET 1
html = opener.open(url).read().decode('utf-8')
p = OptParser()
p.feed(html)

# POST 2 (Round 5)
data = urllib.parse.urlencode({
    "__EVENTTARGET": "ctl00$ContentPlaceHolder1$ddlroundno",
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": p.inputs.get("__VIEWSTATE", ""),
    "__VIEWSTATEGENERATOR": p.inputs.get("__VIEWSTATEGENERATOR", ""),
    "__EVENTVALIDATION": p.inputs.get("__EVENTVALIDATION", ""),
    "ctl00$ContentPlaceHolder1$ddlroundno": "5"
}).encode('utf-8')
req = urllib.request.Request(url, data=data)
req.add_header("Content-Type", "application/x-www-form-urlencoded")
html2 = opener.open(req).read().decode('utf-8')
p2 = OptParser()
p2.feed(html2)
print("After Round 5:")
for s, o in p2.opts.items():
    print(s, len(o), o[:5])

# POST 3 (Instype ALL)
# ... Let's see if ALL is an option
