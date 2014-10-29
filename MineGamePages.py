#scrapes html from riftwalk.gg
"""
http://www.riftwalk.gg/game-archive?r=na&m=1&p=2&s=t

start from page 2

important browsing options:
    only summoner's rift
    North America
    Sorted by Time

foreach page (p=x) until 100 pages (1000 matches):
    grab page data for page = i
    parse out links to the 10 matches on that browse page

    DELAY

    foreach match of the 10 matches on that page:

        grab page code
        place page into mined-pages (overwrite old matches if exists already)
        DELAY

"""
import urllib2
from bs4 import BeautifulSoup as bs

import time
import re

def sleep():
    time.sleep(2)  # seconds

startingPage = 2
endingPage = 102

riftwalkGG = "http://www.riftwalk.gg"
riftwalkGGArchive = "http://www.riftwalk.gg/game-archive?r=na&m=1&s=t&p="

header = {'User-Agent': 'Mozilla/5.0'}  # Needed to prevent 403 error

for p in range(startingPage, endingPage+1):

    print "starting page " + str(p)

    req = urllib2.Request(riftwalkGGArchive+str(p), headers=header)
    soup = bs(urllib2.urlopen(req).read())

    gameLinks = soup.find_all("a", href=re.compile('/game/'), class_=re.compile('btn'))

    for link in gameLinks:
        href = link.get('href')
        linkReq = urllib2.Request(riftwalkGG + href, headers=header)
        linkSoup = bs(urllib2.urlopen(linkReq).read())

        id = href[9:]

        file = open("mined-pages/" + str(id) + ".html", "w+")
        file.write(str(linkSoup))
        file.close()

        print "finished writing " + str(id) + ".html"

        sleep()

    sleep()