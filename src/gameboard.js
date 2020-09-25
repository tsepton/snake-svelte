import { randomInt, sameList } from './utils'

export default class Gameboard {
    constructor(size, spawn) {
        this.size = size
        this.candies = []
        this.candySpawn = spawn
    }

    popCandies(exclusions) {
        exclusions = [...exclusions, ...this.candies] 
        let pos
        do {
            pos = [randomInt(this.size), randomInt(this.size)]
        } while (exclusions.some(list => sameList(list, pos)))
        this.candies = [...this.candies, pos]
    }
}