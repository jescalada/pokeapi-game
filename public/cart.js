let userId = getUserId();
var subtotal = 0;
var taxRate = 0.06;

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
    const pokemon = await $.get(`/pokemon/${pokemonId}/`, function (pokemon, status) {

    })
    return pokemon[0]
}

async function loadPokemonToDOM(pokemonId, quantity) {
    let pokemon = await loadPokemonById(pokemonId)
    let entry = `
        <div class="row">
            <div class="thumbnail-container">
                <img src="${pokemon.sprite}" alt="${pokemon.name}" style="width:100%"
                    onclick="location.href='pokemon.html?id=${pokemon.id}'" class="pokemon-image-thumb">
            </div>
            <div class="row pokemon-buy-details">
                <h3 class="col card-price">${pokemon.name}</h3>
                <h3 class="col card-price">$${pokemon.price}</h3>
                <h3 class="col card-quantity" id="card-quantity-${pokemon.id}">Qty: ${quantity}</h3>
                <h3 class="col card-total-price"> Total: $${(pokemon.price * quantity).toFixed(2)}</h3>
                <button class="col add-to-cart-button" onclick="removeFromCart(${pokemon.id})">Remove</button>
            </div>
        </div>
    `
    $("#cart").append(entry)
    subtotal += parseFloat(pokemon.price) * parseInt(quantity);
}

function loadCart() {
    let data = {
        userId: userId,
    }

    fetch('/cart', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => response.json()).then((data) => {
        subtotal = 0;
        $("#cart-item-count").text(data.cart.length)
        data.cart.forEach(async (pokemon) => {
            await loadPokemonToDOM(pokemon.pokemonId, pokemon.quantity)
            $("#subtotal").text(subtotal.toFixed(2))
            $("#tax").text((subtotal * taxRate).toFixed(2))
            $("#total").text((subtotal * taxRate + subtotal).toFixed(2))
        }) 
    });
    
}

function placeOrder() {
    let total = $("#total").text();

    let data = {
        userId: userId,
        total: total
    }
    fetch('/placeorder', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => {
        window.location.href = '/profile'
    });
}


async function loadPastOrders() {
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

loadPastOrders();
loadCart();