export default class Gameboard {
    constructor(size, difficulty) {
        this.size = size
        this.candies = []
        this.difficulty = difficulty
    }

    popCandies() {
        function randomInt(size) {
            return Math.floor(Math.random() * size)
        }
        // TODO : Do not let candies appear on the snake body
        this.candies = [...this.candies, [randomInt(this.size), randomInt(this.size)]]
    }

    // TODO
    over() {
        console.log("you've lost")
    }
}