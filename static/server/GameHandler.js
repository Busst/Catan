'use strict'

var deck = require('./deck');

class GameHandler {

    constructor () {
        this.players = {};
        this.game_commands = {
            
        }
        this.dev_deck = new deck('default');
    }

    addPlayer(name) {
        if (this.players[name] !== undefined || name.length <= 0) {
            return false;
        }
        this.players[name] = {
            "sheep": 0,
            "ore": 0,
            "lumber": 0,
            "brick": 0,
            "grain": 0,
            "victory card": 0,
            "knight": 0,
            "monopoly": 0,
            "years of plenty": 0,
            "road building": 0,
            "victory point" : 2,
            "road": 2,
            "settlement": 2,
            "city": 0
        };
        return true;
    }

    addResource(player, resource, value) {
        if (this.players[player] === undefined) return false;
        this.players[player][resource] += value;
        return true;
    }

    start() {

    }

    reset() {

    }

    buyDevCard(player) {
        if (this.players[player] === undefined ||this.players[player]['grain'] === undefined) {
            return false;
        }
        if (this.dev_deck.getDeckSize() <= 0) {
            return "empty";
        }
        if (this.players[player]['grain'] < 1 || this.players[player]['ore'] < 1  || this.players[player]['sheep'] < 1) {
            return false;
        }
        var card = this.dev_deck.drawDevCard();
        this.players[player][card]++;
        this.players[player]['ore']--;
        this.players[player]['grain']--;
        this.players[player]['sheep']--;
        return card;
    }

    buyRoad(player) {
        if (this.players[player] === undefined ||this.players[player]['road'] === undefined) {
            return false;
        }
        if (this.players[player]['brick'] < 1 || this.players[player]['lumber'] < 1) {
            return false;
        }
        this.players[player]['brick']--;
        this.players[player]['lumber']--;
        this.players[player]['road']++;
        
        return true;
    }
    buySettlement(player) {
        if (this.players[player] === undefined ||this.players[player]['settlement'] === undefined) {
            return false;
        }
        if (this.players[player]['brick'] < 1 || this.players[player]['lumber'] < 1 || this.players[player]['grain'] < 1 || this.players[player]['sheep'] < 1) {
            return false;
        }
        this.players[player]['brick']--;
        this.players[player]['lumber']--;
        this.players[player]['grain']--;
        this.players[player]['sheep']--;
        this.players[player]['settlement']++;
        this.players[player]['victory point'] += 1;
        return true;
    }
    buyCity(player) {
        if (this.players[player] === undefined ||this.players[player]['city'] === undefined) {
            return false;
        }
        if (this.players[player]['ore'] < 3 || this.players[player]['grain'] < 2) {
            return false;
        }
        this.players[player]['ore'] -= 3;
        this.players[player]['grain'] -= 2;
        this.players[player]['city'] += 1;
        this.players[player]['victory point'] += 1;
        return true;
    }

    checkVictoryPoints(wins) {
        for (var p in this.players) {
            if (this.players[p]["victory point"] >= wins) {
                return p;
            }
        }
        return false;
    }

    playerData(player) {
        var p = this.players[player];
        return p;
    }


    printGame(){
        console.log(this.players);
    }


}



module.exports = GameHandler;


