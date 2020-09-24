export default class Snake {
    constructor(board, x, y) {
        this.gameboard = board
        this.head = [x, y]
        this.tail = []
    }

    // FIXME - Factorise the 4 following methods
    left() {
        [x, y] = [...this.head]
        this.tail.push(this.head)
        this.head = (x === 0) ? [this.gameboard.size - 1, y] : [x - 1, y]
        (this.tail.includes(this.head)) && this.gameboard.over()  
        (!presenceOfFood()) && this.tail.pop()
    }

    right() {
        [x, y] = [...this.head]
        this.tail.push(this.head)
        this.head = (x === this.gameboard.size - 1) ? [0, y] : [x + 1, y]
        (this.tail.includes(this.head)) && this.gameboard.over()  
        (!presenceOfFood()) && this.tail.pop()
    }

    up() {
        [x, y] = [...this.head]
        this.tail.push(this.head)
        this.head = (y === 0) ? [x, this.gameboard.size - 1] : [x, y - 1]
        (this.tail.includes(this.head)) && this.gameboard.over()  
        (!presenceOfFood()) && this.tail.pop()
    }

    down() {
        [x, y] = [...this.head]
        this.tail.push(this.head)
        this.head = (y === this.gameboard.size - 1) ? [x, 0] : [x, y + 1]
        (this.tail.includes(this.head)) && this.gameboard.over()  
        (!presenceOfFood()) && this.tail.pop()
    }

    // private
    presenceOfFood() {
        return this.gameboard.candies.includes(this.head)
    }
}