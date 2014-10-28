// Modified from http://www.riftwalk.gg/

function Minimap(mapID, mapName, gameLength, rangeValue, xMin, yMin, xMax, yMax, players, turrets, inhibitors, positionFrames, killFrames, wardFrames, campFrames) {
    
	this.mapID = mapID;
    this.mapName = mapName;
    this.gameLength = gameLength;
    this.rangeValue = rangeValue;
    this.xMin = xMin;
    this.yMin = yMin;
    this.xMax = xMax;
    this.yMax = yMax;
	
    this.players = players;
    this.turrets = turrets;
    this.inhibitors = inhibitors;
    this.positionFrames = positionFrames;
    this.killFrames = killFrames;
    //this.wardFrames = wardFrames;
    //this.campFrames = campFrames;
    this.playerTeamIDs = [];
    for (var i = 0; i < this.players.length; i++) {
        this.playerTeamIDs[this.players[i].unitID] = this.players[i].teamID;
    }
	
}

Minimap.prototype.render = function() {
    var mm = this;
    var svg = d3.select(".minimap").append("svg");
    svg.append("filter").attr("id", "grayscale").append("feColorMatrix").attr("type", "matrix").attr("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");
    svg.append("image").attr("xlink:href", "img/minimap/" + mm.mapName + ".png").attr("x", 0).attr("y", 0).attr("height", 700).attr("width", 700);
    mm.turretNodes = [];
    for (var i = 0; i < mm.turrets.length; i++) {
        var n = svg.append("image").attr("xlink:href", "img/minimap/" + mm.turrets[i].team + "-turret.png").attr("x", mm.scaleX(mm.turrets[i].x)).attr("y", mm.scaleY(mm.turrets[i].y)).attr("width", 36).attr("height", 36);
        mm.turretNodes.push(n);
    }
    mm.inhibitorNodes = [];
    for (var i = 0; i < mm.inhibitors.length; i++) {
        var n = svg.append("image").attr("xlink:href", "img/minimap/" + mm.inhibitors[i].team + "-inhibitor.png").attr("x", mm.scaleX(mm.inhibitors[i].x)).attr("y", mm.scaleY(mm.inhibitors[i].y)).attr("width", 36).attr("height", 36);
        mm.inhibitorNodes.push(n);
    }
    mm.campGroup = svg.append("g");
    mm.wardGroup = svg.append("g");
    mm.playerNodes = [];
    for (var i = 0; i < mm.players.length; i++) {
        var g = svg.append("g");
        g.append("clipPath").attr("id", "p" + mm.players[i].unitID).append("circle").attr("r", 5).attr("cx", 18).attr("cy", 18);
        g.append("image").attr("xlink:href", "img/minimap/champions/" + mm.players[i].championImg).attr("x", 0).attr("y", 0).attr("width", 36).attr("height", 36).attr("clip-path", "url(#p" + mm.players[i].unitID + ")");
        g.append("circle").attr("r", 5).attr("cx", 18).attr("cy", 18).attr("fill", "none").attr("stroke", mm.teamColor(mm.players[i].teamID)).attr("stroke-width", 2);
        mm.playerNodes[mm.players[i].unitID] = g;
    }
    mm.updateMinimap(mm.rangeValue);
    var controls = d3.select(".minimap").append("div").attr("class", "row");
    controls.append("div").attr("class", "col-sm-9 slider").append("input").attr("type", "range").attr("min", 0).attr("max", mm.gameLength).attr("step", 5).attr("value", mm.rangeValue);
    var gameTime = controls.append("div").attr("class", "col-sm-3 game-time");
    gameTime.append("span").attr("class", "current-time").text(mm.rangeValue.toString().toHHMMSS());
    gameTime.append("span").text(" / ");
    gameTime.append("span").text(mm.gameLength.toString().toHHMMSS());
    $(document).on('change', 'input[type="range"]', function() {
        var time = $(this).val();
        $('.game-time > span.current-time').text(time.toHHMMSS());
        mm.updateMinimap(time);
    });
    $(document).on('click', 'div.event-log > div > span.time', function() {
        var time = $(this).data('time');
        var time = Math.round(time / 5) * 5;
        var time = '' + time;
        $('input[type="range"]').val(time).change();
    });
}
Minimap.prototype.updateMinimap = function(time) {
    this.updatePlayers(time);
    this.updateTurrets(time);
    this.updateInhibitors(time);
    this.updateWards(time);
    this.updateCamps(time);
}
Minimap.prototype.updatePlayers = function(time) {
    var playerPositions = this.positionFrames[time / 5].playerPositions;
    for (var i = 0; i < playerPositions.length; i++) {
        var p = playerPositions[i];
        if (this.playerNodes[p.unitID] === undefined) {
            continue;
        }
        this.playerNodes[p.unitID].select("image").attr("filter", "");
        if (this.playerNodes[p.unitID][0][0].transform.baseVal.length > 0) {
            this.playerNodes[p.unitID].transition().ease("linear").attr("transform", "translate(" + this.scaleX(p.position.x) + "," + this.scaleY(p.position.y) + ")");
        } else {
            this.playerNodes[p.unitID].attr("transform", "translate(" + this.scaleX(p.position.x) + "," + this.scaleY(p.position.y) + ")");
        }
    }
    for (var i = 0; i < this.killFrames.length; i++) {
        var killFrame = this.killFrames[i];
        if (killFrame.victimUnitID > 255) {
            continue;
        }
        if (killFrame.killTime <= time && killFrame.respawnTime >= time) {
            this.playerNodes[killFrame.victimUnitID].select("image").attr("filter", "url(#grayscale)");
        }
    }
}
Minimap.prototype.updateTurrets = function(time) {
    for (var i = 0; i < this.turretNodes.length; i++) {
        this.turretNodes[i].attr("filter", "");
        for (var j = 0; j < this.killFrames.length; j++) {
            var killFrame = this.killFrames[j];
            if (killFrame.victimUnitID != 600) {
                continue;
            }
            if (killFrame.killTime <= time && killFrame.respawnTime >= time) {
                var x = this.turretNodes[i].attr("x");
                var y = this.turretNodes[i].attr("y");
                if (x == this.scaleX(killFrame.x) && y == this.scaleY(killFrame.y)) {
                    this.turretNodes[i].attr("filter", "url(#grayscale)");
                    break;
                }
            }
        }
    }
}
Minimap.prototype.updateInhibitors = function(time) {
    for (var i = 0; i < this.inhibitorNodes.length; i++) {
        this.inhibitorNodes[i].attr("filter", "");
        for (var j = 0; j < this.killFrames.length; j++) {
            var killFrame = this.killFrames[j];
            if (killFrame.victimUnitID != 601) {
                continue;
            }
            if (killFrame.killTime <= time && killFrame.respawnTime >= time) {
                var x = this.inhibitorNodes[i].attr("x");
                var y = this.inhibitorNodes[i].attr("y");
                if (x == this.scaleX(killFrame.x) && y == this.scaleY(killFrame.y)) {
                    this.inhibitorNodes[i].attr("filter", "url(#grayscale)");
                    break;
                }
            }
        }
    }
}
Minimap.prototype.updateWards = function(time) {
    if (!this.wardFrames) {
        return;
    }
    this.wardGroup.selectAll("*").remove();
    for (var i = 0; i < this.wardFrames.length; i++) {
        var ward = this.wardFrames[i];
        if (ward.startTime <= time && ward.endTime >= time) {
            this.wardGroup.append("image").attr("xlink:href", "img/minimap/" + this.wardName(this.playerTeamIDs[ward.casterUnitID], ward.wardUnitID)).attr("x", this.scaleX(ward.x)).attr("y", this.scaleY(ward.y)).attr("width", 32).attr("height", 32);
        }
    }
}
Minimap.prototype.updateCamps = function(time) {
    if (!this.campFrames) {
        return;
    }
    this.campGroup.selectAll("*").remove();
    for (var i = 0; i < this.campFrames.length; i++) {
        var camp = this.campFrames[i];
        if (parseInt(camp.spawnTime) <= time && (time <= camp.deathTime || camp.deathTime == 0)) {
            if (camp.campUnitID == 300 || camp.campUnitID == 301 || camp.campUnitID == 312) {
                this.campGroup.append("image").attr("xlink:href", "img/minimap/large-monster.png").attr("x", this.scaleX(camp.x)).attr("y", this.scaleY(camp.y)).attr("width", 36).attr("height", 36);
            } else if (camp.campUnitID == 302 || camp.campUnitID == 303 || camp.campUnitID == 305 || camp.campUnitID == 307 || camp.campUnitID == 309 || camp.campUnitID == 311) {
                this.campGroup.append("image").attr("xlink:href", "img/minimap/monster.png").attr("x", this.scaleX(camp.x)).attr("y", this.scaleY(camp.y)).attr("width", 36).attr("height", 36);
            }
        }
    }
}
Minimap.prototype.scaleX = function(x, offset) {
    offset = typeof offset !== 'undefined' ? offset : 18;
    if (this.mapID == 10) {
        return 15 + 675 * (x - this.xMin) / (this.xMax - this.xMin) - offset;
    } else {
        return 700 * (x - this.xMin) / (this.xMax - this.xMin) - offset;
    }
}
Minimap.prototype.scaleY = function(y, offset) {
    offset = typeof offset !== 'undefined' ? offset : 18;
    if (this.mapID == 10) {
        return 230 + 280 - 280 * (y - this.yMin) / (this.yMax - this.yMin) - offset;
    } else {
        return 700 - 700 * (y - this.yMin) / (this.yMax - this.yMin) - offset;
    }
}
Minimap.prototype.teamColor = function(teamID) {
    if (teamID == 100) {
        return "rgba(41, 128, 185, 1)";
    } else {
        return "rgba(192, 57, 43, 1)";
    }
}
Minimap.prototype.wardName = function(teamID, unitID) {
    var wardName = "";
    if (teamID == 100) {
        wardName = "blue-";
    } else {
        wardName = "red-";
    }
    if (unitID == 500) {
        wardName += "stealth";
    } else {
        wardName += "vision";
    }
    return wardName += "-ward.png";
}
Minimap.prototype.campName = function(unitID) {
    if (unitID >= 300 && unitID <= 303) {
        return "large-monster.png";
    } else {
        return "monster.png";
    }
}
Minimap.prototype.constructor = Minimap;