var userId = getUserId();

// Gets the basic data needed to display a pokemon to the client.
async function getPokemonBasicDataById(id) {
    let pokemon = await loadPokemonById(id);
    let result = {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprite,
        price: pokemon.price
    };
    return result;
}

async function loadPokemonById(pokemonId) {
    try {
        const pokemon = await $.get(`/pokemon/${pokemonId}/`, function (pokemon, status) {});
        return pokemon[0];
    } catch {
        console.log("Pokemon does not exist!")
    }
}

async function loadProfile() {
    let data = {
        userId: userId,
    }

    fetch('/cart', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => response.json()).then(async (data) => {
                $("#username").text(data.username);
                $("#username2").text(data.username);
                $("#username3").text(data.username);
            data.past_orders.forEach(async (order, index) => {
                let date = new Date(order[0].timestamp)
                let dateTime = date.toString().split("GMT")
                let element = `
                    <div class="order" id="order-${index + 1}" style="text-align: center">
                        <h3>Order id: #${index + 1}</h3>    
                        <h2>${dateTime[0]}</h2>
                        <p class="details">Total: $${order[0].total}</p>
                        <h4>Items in Order #${index + 1}:</h4>
                    </div>`;
                $("#past-orders").append(element);

                order[0].cart.forEach(async (pokemon) => {
                    let pokemonData = await getPokemonBasicDataById(pokemon.pokemonId)
                    let entry = `
                    <div class="thumbnail-container" style="text-align: center; display: inline-block">
                        <img src="${pokemonData.sprite}" alt="${pokemonData.name}" style="width:100%"
                            onclick="location.href='pokemon.html?id=${pokemonData.id}'" class="pokemon-image-thumb">
                            <div class="row pokemon-buy-details">
                            <h3 class="col card-price">${pokemonData.name}</h3>
                            <h3 class="col card-price">$${pokemonData.price}</h3>
                            <h3 class="col card-quantity" id="card-quantity-${pokemonData.id}">Qty: ${pokemon.quantity}</h3>
                            <h3 class="col card-total-price"> Total: $${(pokemonData.price * pokemon.quantity).toFixed(2)}</h3>
                        </div>
                    </div>
                    `;
                    $(`#order-${index + 1}`).append(entry);
                })
            });
        });
}

async function loadTimeline() {
    try {
        const timeline = await $.get(`/timeline/${userId}`, function (timeline, status) {});
        return timeline;
    } catch {
        return null;
    }
}

async function loadTimelineHandler() {
    const timeline = await loadTimeline()
    $("#timeline").empty();
    let text = ""
    timeline.forEach(object => {
        entry = object.entry
        let timeData = new Date(entry.timestamp).toString().split("GMT")
        text += `<li>Query: ${entry.query}<br>${timeData[0]}</li>`
    });
    $("#timeline").append(text);
}

loadProfile();
loadTimelineHandler();