import { sameList, randomInt } from './utils'

export default class Snake {
    constructor(board, speed) {
        this.head = [0, 0]
        this.tail = []
        this.gameboard = board
        this.speed = speed
        this.gameover = false
    }

    move(dir) {
        let x, y
        [x, y] = [...this.head]
        this.tail.unshift(this.head)

        // Handling the direction
        switch (dir) {
            case 'up':
                this.head = (y === 0) ? [x, this.gameboard.size - 1] : [x, y - 1]
                break
            case 'down':
                this.head = (y === this.gameboard.size - 1) ? [x, 0] : [x, y + 1]
                break
            case 'left':
                this.head = (x === 0) ? [this.gameboard.size - 1, y] : [x - 1, y]
                break
            case 'right':
                this.head = (x === this.gameboard.size - 1) ? [0, y] : [x + 1, y]
                break
            default:
                throw ("Unknown direction")
        }

        if (this.tail.some(list => sameList(list, this.head))){
            this.gameover = true
        }

        if (!this.presenceOfFood(this.head))
            this.tail.pop()
        else {
            const index = this.gameboard.candies.findIndex(list => sameList(list, this.head))
            if (index > -1) {
                this.gameboard.candies.splice(index, 1)
            }
        }

        if (randomInt(100) <= this.gameboard.candySpawn) {
            this.gameboard.popCandies([...this.tail, this.head]);
        }
    }
    
    reset() {
        this.head = [0, 0]
        this.tail = []
        this.gameover = false
        this.gameboard.candies = []
    }
    
    getScore() {
        return this.tail.length
    }

    // private
    presenceOfFood(pos) {
        return this.gameboard.candies.some(list => sameList(list, pos))
    }
}