import requests
from bs4 import BeautifulSoup

url = "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx"
session = requests.Session()
response = session.get(url)
soup = BeautifulSoup(response.text, "html.parser")

for select_id in ["ctl00_ContentPlaceHolder1_ddlroundno", "ctl00_ContentPlaceHolder1_ddlInstype", "ctl00_ContentPlaceHolder1_ddlInstitute", "ctl00_ContentPlaceHolder1_ddlBranch", "ctl00_ContentPlaceHolder1_ddlSeattype"]:
    select = soup.find("select", id=select_id)
    if select:
        options = [(opt.get("value"), opt.text) for opt in select.find_all("option")]
        print(f"{select_id}: {options[:5]} (Total: {len(options)})")
    else:
        print(f"{select_id} not found")

