__author__ = 'amine'

# mines pages and creates csv for matrix scatterplots

"""
    blue or red side
    win or loss
    total gold
    creeps killed
    wards placed
    baron kills
    dragon kills
"""

import os
import re
from bs4 import BeautifulSoup as bs
import csv

def extract_red_blue_stats(html):

    temp_red_list = ['Red']
    temp_blue_list = ['Blue']

    with open (html, "r") as myfile:
        html = myfile.read()

    soup = bs(html)

    red = soup.find_all("span", class_=re.compile('red'))
    blue = soup.find_all("span", class_=re.compile('blue'))



    print "-- red --"

    #total gold
    #print red[0].contents[0]
    temp_red_list.append(float(red[0].contents[0].replace(',',''))/1000)

    #creeps killed
    #print red[6].contents[0]
    temp_red_list.append(red[6].contents[0].replace(',',''))

    #wards placed
    #print red[9].contents[0]
    temp_red_list.append(red[9].contents[0].replace(',',''))

    #baron kills
    #print red[10].contents[0]
    temp_red_list.append(red[10].contents[0].replace(',',''))

    #dragon kills
    #print red[11].contents[0]
    temp_red_list.append(red[11].contents[0].replace(',',''))

    #print "-- blue --"

    #total gold
    #print blue[0].contents[0]
    temp_blue_list.append(float(blue[0].contents[0].replace(',',''))/1000.0)

    #creeps killed
    #print blue[6].contents[0]
    temp_blue_list.append(blue[6].contents[0].replace(',',''))

    #wards placed
    #print blue[9].contents[0]
    temp_blue_list.append(blue[9].contents[0].replace(',',''))

    #baron kills
    #print blue[10].contents[0]
    temp_blue_list.append(blue[10].contents[0].replace(',',''))

    #dragon kills
    #print blue[11].contents[0]
    temp_blue_list.append(blue[11].contents[0].replace(',',''))

    # who won?
    # find latest instance of "turret" in red and blue, compare them

    latest_blue_turret = -1
    latest_red_turret = -1

    for i in range(0, len(blue)-1):
        if('Turret' in blue[i].contents[0]):
            latest_blue_turret = i

    for i in range(0, len(red)-1):
        if('Turret' in red[i].contents[0]):
            latest_red_turret = i

    # latest turret down was blue, red won
    if(latest_blue_turret > latest_red_turret):
        #print "RED WON!"
        temp_red_list.append('1')
        temp_blue_list.append('0')

    # latest turret down was red, blue won
    elif(latest_blue_turret < latest_red_turret):
        #print "BLUE WON!"
        temp_red_list.append('0')
        temp_blue_list.append('1')

    # no turrets down for either side, no turret game winner
    elif(latest_blue_turret == latest_red_turret):
        #print "dunno who won...no turrets down..."
        temp_red_list.append('-1')
        temp_blue_list.append('-1')

    print temp_red_list
    print temp_blue_list

    return temp_red_list, temp_blue_list


def create_from_directory(dirname, writer):

    red_list = []
    blue_list = []

    for filename in os.listdir(dirname):
        red_list, blue_list = extract_red_blue_stats(dirname + '/' + filename)

        # write csv line
        writer.writerow(red_list)
        writer.writerow(blue_list)

        print 'done with ' + filename + '\n'


#######################################################################################################################
# main:

f = open('simpleviz/league.csv', 'wb')

try:
    writer = csv.writer(f)
    writer.writerow( ('Color', 'Gold', 'Creep Score', 'Wards', 'Baron Kills', 'Dragon Kills', 'Won') )
    create_from_directory('mined-pages-150', writer)

finally:
    f.close()