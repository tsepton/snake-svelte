export default class Gameboard {
    constructor(size) {
        this.size = size
        this.candies = []
    }

    popCandies() {
        function randomInt(size) {
            Math.floor(Math.random() * size)
        }
        this.candies = [...this.candies, [randomInt(this.size), randomInt(this.size)]]
    }

    // TODO
    over() {
        console.log("you've lost")
    }
}