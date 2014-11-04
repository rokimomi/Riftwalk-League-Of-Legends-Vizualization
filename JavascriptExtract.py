__author__ = 'amine'

# pull a page and extract its main javascript lines

from bs4 import BeautifulSoup as bs

# takes a riftwalk html page as input and extracts the players and positions variables from the minimap javascript
def extract_players_and_positions(html):

    with open (html, "r") as myfile:
        html = myfile.read()

    soup = bs(html)
    script = soup.findAll('script')

    map_JS = script[11].string

    #print map_JS

    vars = map_JS.split('\n')

    players = str(vars[10].lstrip())[:-2] # players
    positions = str(vars[13].lstrip())[:-2] # positions

    return players, positions

"""
players, positions = extract_players_and_positions('mined-pages-2/1508275077.html')

print players
print positions
"""