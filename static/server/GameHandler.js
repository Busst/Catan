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
    addDevResource(player, resource, value) {
        if (this.players[player] === undefined) return false;
        this.players[player][resource] += value;
        return true;
    }

    start() {

    }

    reset() {
        for (var name in this.players) {
            delete this.players[name];
        }
        this.dev_deck = new deck('default');
    }

    steal(from, to) {
        var numberOfResources = this.resourceNum(from);
        var taking = Math.trunc(Math.random() * numberOfResources+1);
        var cur_resource = this.players[from]['ore'];
        var resource;
        while (cur_resource-- > 0 && taking-- > 0){
            resource = 'ore';
        }
        cur_resource = this.players[from]['lumber'];
        while (cur_resource-- > 0 && taking-- > 0){
            resource = 'lumber';
        }
        cur_resource = this.players[from]['grain'];
        while (cur_resource-- > 0 && taking-- > 0){
            resource = 'grain';
        }
        cur_resource = this.players[from]['sheep'];
        while (cur_resource-- > 0 && taking-- > 0){
            resource = 'sheep';
        }
        cur_resource = this.players[from]['brick'];
        while (cur_resource-- > 0 && taking-- > 0){
            resource = 'brick';
        }
        return resource;

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
        if (card === 'victory card') {
            this.players[player]['victory point']++;
        }
        return card;
    }

    resourceNum(player) {
        var sum = 0;
        sum += this.players[player]['ore'];
        sum += this.players[player]['grain'];
        sum += this.players[player]['sheep'];
        sum += this.players[player]['lumber'];
        sum += this.players[player]['brick'];
        return sum;
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


