var userId = getUserId();
var isAdmin = isAdmin();

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

async function loadUserList() {
    let data = {
        isAdmin: isAdmin,
    }

    fetch('/userlist', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => response.json()).then(async (data) => {
        console.log(data)
            data.forEach(async (entry, index) => {
            let element = `
                <li class="user-entry row">
                    <span class="user-info col">Id: #${entry.user_id}</span>
                    <span class="user-info col">username: ${entry.username}</span>
                    <span class="user-info col">is Admin?: ${entry.isAdmin ? "Yes" : "No"}</span>
                    <button class="delete-user-button col" onclick="deleteUser(${entry.user_id})">Delete</button>
                </li>    
            `;
            $("#user-entry-container").append(element);
        });
    })
}

async function deleteUser(userId) {
    let data = {
        userId: userId,
    }

    fetch('/deleteuser', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => response.json()).then(async (data) => {
        console.log(data)
        if (data.success) {
            window.location.href = '/admin'
        } else {
            alert(data.message)
        }
    })
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

function registerUser() {
    let data = {
        username: $("#username").val(),
        password: $("#password").val(),
        isAdmin: document.getElementById("isAdmin").checked
    }

    fetch('/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(response => response.json()).then((data) => {
        // On success, redirect (refresh) to login
        if (data.success) {
            $("#success-text").text("Account created.")
            window.location.href = '/admin'
        } else {
            $("#error-text").text("Account creation failed.")
        }
    })
}

loadUserList();
loadTimelineHandler();