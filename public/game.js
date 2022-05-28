var firstCard = 0;
var secondCard = 0;
var pairsMatched = 0;

async function loadImageUrls(pokemonIndices) {
    pokemonIndices.forEach(index => {
        
    });
}

function loadGame(difficulty) {
    let numberOfPokemon = difficulty * 3;
    let numberOfPairs = numberOfPokemon * 2;
    let randomPokemonIndices = [];

    // Get random pokemon IDs
    for (i = 0; i < numberOfPokemon; i++) {
        let randomIndex = Math.ceil(Math.random() * 150);
        randomPokemonIndices.push(randomIndex, randomIndex); // Randomly returns an index corresponding to all Gen 1 pokemon
        randomPokemonIndices.push(randomIndex, randomIndex);
    }

    // Shuffle the pokemon index array
    randomPokemonIndices.sort(() => Math.random() - 0.5)



    $("#game-grid").empty();
    let grid = ``;
    for (i = 0; i < numberOfPairs * 2; i++) {
        grid += `
        <div class="game-card" id="card-${i + 1}" onclick="flipCard(${i+1})">
            <img class="card-front" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomPokemonIndices[i]}.png">
            <img class="card-back" src="pokecard.jpg">
        </div>
        `
    }
    $("#game-grid").append(grid);    
}

function flipCard(cardIndex) {
    $(`#card-${cardIndex}`).toggleClass("flip");

    if (firstCard == 0) { // If the first card has not been selected yet
        firstCard = cardIndex;
        // Do nothing, as we are waiting for the user to select a second card
    } else if (firstCard == cardIndex) { // If the second card is the same INDEX as the first one
        // Flip it back
        $(`#card-${firstCard}`).toggleClass("flip");
        firstCard = 0;
    } else if (secondCard == 0) {
        secondCard = cardIndex;
        // Handle the card check
        let firstCardImage = $(`#card-${firstCard} > img.card-front`).attr("src")
        let secondCardImage = $(`#card-${secondCard} > img.card-front`).attr("src")

        $(`#card-${firstCard}`).prop("disabled", true);
        $(`#card-${secondCard}`).prop("disabled", true);
        
        setTimeout(function() {
            // Check if matched
            if (firstCardImage == secondCardImage) {
                pairsMatched++;
                $(`#card-${firstCard}`).prop("onclick", null);
                $(`#card-${secondCard}`).prop("onclick", null);
                console.log("pairs: " + pairsMatched)
            } else {
                $(`#card-${firstCard}`).toggleClass("flip");
                $(`#card-${secondCard}`).toggleClass("flip");
                $(`#card-${firstCard}`).prop("disabled", false);
                $(`#card-${secondCard}`).prop("disabled", false);
                console.log("pairs: " + pairsMatched)
            }
            firstCard = 0;
            secondCard = 0;
        }, 500);
    }
}

loadGame(1);