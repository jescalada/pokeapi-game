var firstCard = 0;
var secondCard = 0;
var pairsMatched = 0;
var totalNumberOfPairs = 0;
var diff = 0;
var score = 0;
var userId = getUserId();
var movesLeft = 0;
var gameRunning = false;

function loadGame(difficulty) {
    diff = difficulty;
    let numberOfPokemon = difficulty * 3;
    totalNumberOfPairs = numberOfPokemon * 2;
    let randomPokemonIndices = [];
    movesLeft = totalNumberOfPairs * 4;
    gameRunning = true;
    score = 0;
    pairsMatched = 0;

    $("#game-grid").attr("disabled", false)
    $("#game-grid").css("height", `${300 * difficulty}px`)
    $("#game-status").text(`Current Difficulty: ${difficulty}`)
    
    $("#score").text(score)
    $("#moves-left").text(movesLeft)

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
    if (!gameRunning) return
    $(`#card-${cardIndex}`).toggleClass("flip");

    if (firstCard == 0) { // If the first card has not been selected yet
        firstCard = cardIndex;
        console.log("First select: ", firstCard, secondCard, cardIndex)
        // Do nothing, as we are waiting for the user to select a second card
    } else if (firstCard == cardIndex) { // If the second card is the same INDEX as the first one
        // Flip it back
        $(`#card-${cardIndex}`).toggleClass("flip");
        $(`#card-${cardIndex}`).toggleClass("flip");
        console.log("Flipback: ", firstCard, secondCard, cardIndex)
        firstCard = 0;
    } else if (secondCard == 0) {
        secondCard = cardIndex;
        movesLeft--;
        $("#moves-left").text(movesLeft)

        // Handle the card check
        let firstCardImage = $(`#card-${firstCard} > img.card-front`).attr("src")
        let secondCardImage = $(`#card-${secondCard} > img.card-front`).attr("src")

        $(`#card-${firstCard}`).prop("disabled", true);
        $(`#card-${secondCard}`).prop("disabled", true);

        setTimeout(function () {
            // Check if matched
            if (firstCardImage == secondCardImage) {
                pairsMatched++;
                score += 100;
                $(`#card-${firstCard}`).prop("onclick", null);
                $(`#card-${secondCard}`).prop("onclick", null);
                $("#score").text(score)
                $("#moves-left").text(movesLeft)

                if (pairsMatched == totalNumberOfPairs) {
                    $("#game-status").text("You won! Click a difficulty to play again.");
                    score += movesLeft * diff * 10
                    $("#score").text(score)
                    
                    addWinToTimeline(userId, diff, score);

                    firstCard = 0;
                    secondCard = 0;
                    pairsMatched = 0;
                    totalNumberOfPairs = 0;
                    score = 0;
                    diff = 0;
                    gameRunning = false;
                } else {
                    checkGameOver();   
                }
            } else {
                $(`#card-${firstCard}`).toggleClass("flip");
                $(`#card-${secondCard}`).toggleClass("flip");
                $(`#card-${firstCard}`).prop("disabled", false);
                $(`#card-${secondCard}`).prop("disabled", false);
                checkGameOver();
            }
            firstCard = 0;
            secondCard = 0;
        }, 500);
    }
}

function checkGameOver() {
    if (movesLeft == 0) {
        $("#game-status").text("You lost! Click a difficulty to play again.");
        $("#game-grid").attr("disabled", true);
        gameRunning = false;
        addLossToTimeline(userId, diff, score);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function loadGameTimelineHandler() {
    const timeline = await loadGameTimeline()
    $("#timeline").empty()
    timeline.forEach(object => {
        entry = object.entry
        let timeData = new Date(entry.timestamp).toString().split("GMT")
        let text = `<li>${entry.message}<br>${timeData[0]}</li>`
        $("#timeline").append(text)    
    });
}

async function loadGameTimeline() {
    try {
        const timeline = await $.get(`/gametimeline/${userId}`, function (timeline, status) {});
        console.log(timeline)
        return timeline;
    } catch {
        return null;
    }
}

async function addWinToTimeline(userId, difficulty, score) {
    let data = {
        userId: userId,
        difficulty: difficulty,
        score: score
    }

    fetch('/addwin', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then((data) => {
        loadGameTimelineHandler()
    });
};

async function addLossToTimeline(userId, difficulty, score) {
    let data = {
        userId: userId,
        difficulty: difficulty,
        score: score
    }

    fetch('/addloss', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then((data) => {
        loadGameTimelineHandler()
    });
};

loadGameTimelineHandler();