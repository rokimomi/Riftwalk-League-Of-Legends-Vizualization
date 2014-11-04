__author__ = 'amine'

import json
import pprint

# combine data points to essentially make one dataset that has 20 players rather than 10.
# make the game cutoff at 30 mins, if game does not cut off by then, throw away points, if game does cutoff by then, make
# position -1,-1 (for no longer in game)

# todo # function that grabs box area, prints num players in area out to alert message or something
# todo # play/pause button

# input

json_data=open('game1.txt')
game_1 = json.load(json_data)

json_data=open('game1time.txt')
game_1_time = json.load(json_data)

json_data=open('game2.txt')
game_2 = json.load(json_data)

json_data=open('game2time.txt')
game_2_time = json.load(json_data)

json_data.close()

##

# change character images to "character.png" and id's of character to id+10 for game 2

for player in game_1:
    player['championImg'] = 'Champion.png'

for player in game_2:
    player['championImg'] = 'Champion.png'
    player['unitID'] = player['unitID'] + 10

for time in game_2_time:
    for player in time['playerPositions']:
        player['unitID'] = player['unitID'] + 10

####

# combine the two game player lists

game_combined = game_1 + game_2

json_game_combined = json.dumps(game_combined)


##

# combine the two game from 0-420 (35 minute long game)

game_combined_time = {}

for time in range(0, 150):
    game_combined_time[time] = game_1_time[time]
    game_combined_time[time]['playerPositions'] += game_2_time[time]['playerPositions']

json_game_combined_time = json.dumps(game_combined_time)

# final output

#print json.dumps(game_1)
#print json.dumps(game_1_time)

#print '\n'

#print json_game_combined
#print json_game_combined_time





import os
import JavascriptExtract as je

# takes directory and merges the player lists into one list and merges the position variables into one list
def create_from_directory(dirname):

    players_list = []
    positions_list = []

    for filename in os.listdir(dirname):
        players, positions = je.extract_players_and_positions(dirname + '/' + filename)

        print positions

        players_list.append(json.loads(players))
        positions_list.append(json.loads(positions))

        print 'done with ' + filename + '\n'

create_from_directory('mined-pages-2')

"""
data = {}
data['key'] = 'value'
json_data = json.dumps(data)
print json_data
"""