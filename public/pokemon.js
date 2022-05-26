async function loadPokemonById(pokemonId) {
    try {
        const pokemon = await $.get(`/pokemon/${pokemonId}/`, function (pokemon, status) {});
        return pokemon[0];
    } catch {
        let info = `
            <p>Pokemon #${pokemonId} does not exist!</p>
        `
        $("main").html(info);
    }
}

// Gets query params
function getIdFromParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('id');
}

function extractPokemonData(pokemon) {
    return {
        id: pokemon.id,
        name: pokemon.name,
        abilities: pokemon.abilities,
        types: pokemon.types,
        stats: pokemon.stats,
        sprite: pokemon.sprite,
    }
}

async function displayPokemon() {
    let pokemonId = getIdFromParams();
    await loadPokemonById(pokemonId).then((pokemon) => {
        pokemon = extractPokemonData(pokemon);
        let info = `
        <div id="info">
            <div class="row">
                <div class="col pokemon-name">
                    <h1>${pokemon.name}</h1>
                </div>
            </div>
`
        info += `<div class="row">`
        pokemon.types.forEach(type => {
            info += `
            <div class="col pokemon-type">
                <h2>${type}</h2>
            </div>
            `
        });
        info += `</div>`

        info += `<div class="row">`
        pokemon.abilities.forEach(ability => {
            info += `
            <div class="col pokemon-type">
                <h2>${ability}</h2>
            </div>
            `
        });
        info += `</div>`

        info += `
            <div class="row">
                <div class="info-container">
                    <img src="${pokemon.sprite}" alt="${pokemon.name}" style="width:100%">
                </div>
            </div>`

        info += `<div class="row">`

        pokemon.stats.forEach(stat => {
            info += `
            <div class="col pokemon-stat">
                <p>${stat.value} ${stat.name}</p>
            </div>
            `;
        });
        
        info += `</div>`
        $("main").html(info);
    });
}

displayPokemon();