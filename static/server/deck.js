'use strict'

class deck {

    constructor (pack) {
        this.pack = pack;
        this.dev_cards = [];
        if (pack === 'default') {
            for (var i = 0; i < 2; i++) {
                this.dev_cards.push("road building");
                this.dev_cards.push("years of plenty");
                this.dev_cards.push("monopoly");
            }
            for (var i = 0; i < 14; i++) {
                this.dev_cards.push("knight");
            }
            for (var i = 0; i < 5; i++) {
                this.dev_cards.push("victory card");
            }
        }
    }

    drawDevCard() {
        var pos = Math.trunc(Math.random() * this.dev_cards.length);
        var card = this.dev_cards[pos];
        this.dev_cards.splice(pos, 1);
        return card;
    }

    getDeckSize() {
        return this.dev_cards.length;
    }




}



module.exports = deck;