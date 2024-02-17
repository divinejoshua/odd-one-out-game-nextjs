// Generate six(6) digit random numbers as the game ID
export function generateGameId(): number{
    let value = Math.floor(100000 + Math.random() * 900000);
    return value
}