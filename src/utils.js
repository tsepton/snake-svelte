export function sameList(list1, list2) {
    return JSON.stringify(list1) === JSON.stringify(list2);
}

export function randomInt(max) {
    return Math.floor(Math.random() * max)
}