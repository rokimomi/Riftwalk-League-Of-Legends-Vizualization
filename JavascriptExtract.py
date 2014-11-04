__author__ = 'amine'

# pull a page and extract its main javascript lines

import json
from bs4 import BeautifulSoup as bs

with open ("mined-pages-2/1508275077.html", "r") as myfile:
    html = myfile.read()

soup = bs(html)
script = soup.findAll('script')

map_JS = script[11].string

#print map_JS

vars = map_JS.split('\n')

names = str(vars[10].lstrip())[:-2] # names
positions = str(vars[13].lstrip())[:-2] # positions

print names
print positions
