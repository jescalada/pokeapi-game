var firstCard = 0;
var secondCard = 0;
var pairsMatched = 0;
var totalNumberOfPairs = 0;

function loadGame(difficulty) {
    let numberOfPokemon = difficulty * 3;
    totalNumberOfPairs = numberOfPokemon * 2;
    let randomPokemonIndices = [];

    $("#game-grid").css("height", `${300 * difficulty}px`)

    // Get random pokemon IDs
    for (i = 0; i < numberOfPokemon; i++) {
        let randomIndex = Math.ceil(Math.random() * 150);
        randomPokemonIndices.push(randomIndex, randomIndex); // Randomly returns an index corresponding to all Gen 1 pokemon
        randomPokemonIndices.push(randomIndex, randomIndex);
    }

    // Shuffle the pokemon index array
    shuffleArray(randomPokemonIndices);

    $("#game-grid").empty();
    let grid = ``;
    for (i = 0; i < totalNumberOfPairs * 2; i++) {
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
                
                if (pairsMatched == totalNumberOfPairs) {
                    console.log("You won!");
                    // todo add WIN to timeline
                    // todo reset game grid and varibales
                }
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}