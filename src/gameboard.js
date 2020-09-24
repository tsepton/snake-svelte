export default class Gameboard {
    constructor(size){
        this.size = size
        this.candies = []
    }

    popCandies() {
        function randomInt() {
            Math.floor(Math.random() * this.size)
        }
        this.candies = [...this.candies, [randomInt(), randomInt()]]
    }
}