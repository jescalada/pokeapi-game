let totalNumberOfPokemon = 26;
let userId = getUserId();

async function displayPokemonOnFront() {
    await getRandomPokemonData().then((randomPokemon) => {
        let grid = `
            <div id="grid">
        `;
        for (row = 0; row < 3; row++) {
            grid += `<div class="row">`;
            for (col = 0; col < 3; col++) {
                index = row * 3 + col;
                grid += `
                    <div class="img-container">
                        <img src="${randomPokemon[index].sprite}" alt="${randomPokemon[index].name}" style="width:100%"
                            onclick="location.href='pokemon.html?id=${randomPokemon[index].id}'" class="pokemon-image">
                        <div class="pokemon-buy-panel row">
                            <h3 class="col card-price">$${randomPokemon[index].price}</h3>
                            <button class="col card-quantity-button" onclick="decreaseQuantity(${randomPokemon[index].id})">-</button>
                            <h3 class="col card-quantity" id="card-quantity-${randomPokemon[index].id}">1</h3>
                            <button class="col card-quantity-button" onclick="increaseQuantity(${randomPokemon[index].id})">+</button>
                            <button class="col add-to-cart-button" onclick="addToCart(${randomPokemon[index].id})">Add To Cart</button>
                        </div>
                    </div> 
                    `;
            }
            grid += `</div>`;
        }
        grid += `</div>`;
        $("main").append(grid);
    });
}

async function loadPokemonById(pokemonId) {
    const pokemon = await $.get(`/pokemon/${pokemonId}/`, function (pokemon, status) {

    });
    return pokemon[0];
}

async function getRandomPokemonData() {
    let pokemonList = [];
    for (i = 0; i < 9; i++) {
        let randomPokemonId = Math.ceil(Math.random() * totalNumberOfPokemon);
        let randomPokemon = await loadPokemonById(randomPokemonId);
        pokemonList[i] = {
            id: randomPokemon['id'],
            name: randomPokemon['name'],
            sprite: randomPokemon['sprite'],
            price: randomPokemon['price']
        };
    }
    return pokemonList;
}

function increaseQuantity(pokemonId) {
    let quantityElement = document.getElementById(`card-quantity-${pokemonId}`);
    quantityElement.innerHTML = parseInt(quantityElement.innerHTML) + 1
}

function decreaseQuantity(pokemonId) {
    let quantityElement = document.getElementById(`card-quantity-${pokemonId}`);
    quantityElement.innerHTML = Math.max(0, parseInt(quantityElement.innerHTML) - 1)
}

function addToCart(pokemonId) {
    let quantity = parseInt(document.getElementById(`card-quantity-${pokemonId}`).innerHTML)
    let data = {
        userId: userId,
        pokemonId: pokemonId,
        quantity: quantity
    }

    fetch('/addtocart', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => {
        alert(`Added to cart!`)
    });
}

displayPokemonOnFront();