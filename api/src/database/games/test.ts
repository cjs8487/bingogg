import { allGames } from "./Games";



const main = async () => {
    const games = await allGames();
    console.log(games);
}

main().finally(() => process.exit(0));