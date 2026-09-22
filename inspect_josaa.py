import urllib.request
from html.parser import HTMLParser
import ssl

class OptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cur_sel = None
        self.opts = {}
    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if tag == "select" and "name" in attr_dict:
            self.cur_sel = attr_dict["name"]
            self.opts[self.cur_sel] = []
        elif tag == "option" and self.cur_sel and "value" in attr_dict:
            self.opts[self.cur_sel].append(attr_dict["value"])
    def handle_endtag(self, tag):
        if tag == "select":
            self.cur_sel = None

url = "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
html = urllib.request.urlopen(url, context=ctx).read().decode('utf-8')
p = OptParser()
p.feed(html)
for s, o in p.opts.items():
    print(s, len(o), o[:5])
