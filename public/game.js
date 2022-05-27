var firstCard = 0;
var secondCard = 0;
var pairsMatched = 0;

function flipCard(cardIndex) {
    $(`#card-${cardIndex}`).toggleClass("flip");

    if (firstCard == 0) { // If the first card has not been selected yet
        firstCard = cardIndex;
        // Do nothing, as we are waiting for the user to select a second card
    } else if (firstCard == cardIndex) { // If the second card is the same as the first one
        // Flip it back
        $(`#card-${firstCard}`).toggleClass("flip");
        firstCard = 0;
    } else if (secondCard == 0) {
        secondCard = cardIndex;
        // Handle the card check
        let firstCardImage = $(`#card-${firstCard} > img.card-front`).attr("src")
        let secondCardImage = $(`#card-${secondCard} > img.card-front`).attr("src")
        
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
                console.log("pairs: " + pairsMatched)
            }
            firstCard = 0;
            secondCard = 0;
        }, 1000);
        
    }
}