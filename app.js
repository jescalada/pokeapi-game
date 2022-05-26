const express = require('express')
const bodyparser = require("body-parser")
const mongoose = require('mongoose')
const path = require('path')
const {
    getEnabledCategories
} = require('trace_events')

const app = express()
const port = process.env.PORT || 3000

const session = require('express-session')

app.use(bodyparser.json())

app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
}))

app.use(bodyparser.urlencoded({
    extended: true
}))

// Tells our app to keep in mind the folder called "public", where we have various assets
app.use(express.static(__dirname + '/public'))

const pokemonSchema = new mongoose.Schema({
    name: String,
    types: [String],
    abilities: [String],
    id: Number,
    stats: [Object],
    sprite: String
}, {
    collection: 'pokemon'
})

const pokemonModel = mongoose.model("pokemon", pokemonSchema);

const usersSchema = new mongoose.Schema({
    user_id: String,
    username: String,
    password: String,
    cart: [Object],
    past_orders: [
        [Object]
    ],
    timeline: [Object]
}, {
    collection: 'users'
})

const usersModel = mongoose.model("users", usersSchema);

mongoose.connect("mongodb+srv://juan:Rocco123@cluster0.nxfhi.mongodb.net/pokemon-db?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.get('/', authenticate, (req, res) => {
    res.sendFile(__dirname + '/public/landing.html')
})

app.get('/cart', authenticate, (req, res) => {
    res.sendFile(__dirname + '/public/cart.html')
})

app.get('/search', authenticate, (req, res) => {
    res.sendFile(__dirname + '/public/search.html')
})

app.get('/profile', authenticate, (req, res) => {
    res.sendFile(__dirname + '/public/profile.html')
})

// This is a get route that does not need the middleware authenticator (it would make an infinite loop)
app.get('/login', (req, res) => {
    // If they're authenticated, send them to their profile, otherwise send them to the login page
    if (req.session.authenticated) {
        res.redirect('/profile')
    } else {
        res.sendFile(__dirname + '/public/login.html')
    }
})

// Checks if the user is authenticated, and either executes the next function or redirects to login
function authenticate(req, res, next) {
    if (req.session.authenticated) {
        next()
    } else {
        res.redirect('/login')
    }
}

app.post('/login', async (req, res) => {
    await authenticateLogin(req.body.username, req.body.password).then(user => {
        if (user) {
            req.session.user = user
            req.session.user_id = user.user_id
        }
    })
    req.session.authenticated = req.session.user != null
    res.json({
        success: req.session.authenticated,
        user: req.session.user,
        message: req.session.authenticated ? "Authentication success." : "Authentication failed."
    })
})

app.post('/register', async (req, res) => {
    let userId = 100000000 + Math.floor(Math.random() * 10000);
    await usersModel.insertMany({
        username: req.body.username,
        password: req.body.password,
        cart: [],
        past_orders: [],
        user_id: userId,
        timeline: []
    }).then((result, err) => {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

async function authenticateLogin(username, password) {
    const users = await usersModel.find({
        username: username,
        password: password
    })
    return users[0]
}

app.get('/pokemon/:pokemonId', (req, res) => {
    pokemonModel.find({
        id: req.params.pokemonId
    }, function (err, pokemon) {
        if (err) {
            console.log("Error " + err)
        }
        res.json(pokemon)
    });
})

app.get('/name/:pokemonName', async (req, res) => {
    pokemonModel.find({
        name: req.params.pokemonName
    }, async function (err, pokemon) {
        if (err) {
            console.log("Error: " + err)
        }
        // Writes an entry object to the timeline
        let entry = {
            query: `/name/${req.params.pokemonName}`,
            timestamp: Date.now()
        }

        await usersModel.updateOne({
            user_id: req.session.user_id
        }, {
            $push: {
                timeline: { entry }
            }
        }).then(() => {
            res.json(pokemon)
        })
    });
})

app.get('/type/:pokemonType', async (req, res) => {
    pokemonModel.find({
        types: {
            $in: req.params.pokemonType
        }
    }, async function (err, pokemon) {
        if (err) {
            console.log("Error " + err)
        }
        // Writes an entry object to the timeline
        let entry = {
            query: `/type/${req.params.pokemonType}`,
            timestamp: Date.now()
        }
        
        await usersModel.updateOne({
            user_id: req.session.user_id
        }, {
            $push: {
                timeline: { entry }
            }
        }).then(() => {
            res.json(pokemon)
        })
    });
})

app.get('/ability/:pokemonAbility', async (req, res) => {
    pokemonModel.find({
        abilities: {
            $in: req.params.pokemonAbility
        }
    }, async function (err, pokemon) {
        if (err) {
            console.log("Error " + err)
        }
        // Writes an entry object to the timeline
        let entry = {
            query: `/ability/${req.params.pokemonAbility}`,
            timestamp: Date.now()
        }
        
        await usersModel.updateOne({
            user_id: req.session.user_id
        }, {
            $push: {
                timeline: { entry }
            }
        }).then(() => {
            res.json(pokemon)
        })
    });
})

app.get('/timeline/:userId', async (req, res) => {
    const user = await usersModel.find({
        user_id: req.params.userId
    })
    return res.json(user[0].timeline);
})

app.post('/addtocart', async (req, res) => {
    res.json(await updateCart(req.body.userId, req.body.quantity, req.body.pokemonId))
})

app.post('/placeorder', async (req, res) => {
    res.json(await placeOrder(req.body.userId, req.body.total))
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

app.post('/cart', async (req, res) => {
    const user = await usersModel.find({
        user_id: req.body.userId
    })
    return res.json(user[0]);
})

async function updateCart(userId, quantity, pokemonId) {
    await usersModel.findOneAndUpdate({
        user_id: userId
    }, {
        $push: {
            cart: {
                quantity: quantity,
                pokemonId: pokemonId
            }
        }
    }).then(() => {
        return {
            success: true
        }
    })
}

async function placeOrder(userId, total) {
    const user = await usersModel.find({
        user_id: userId
    })
    let cart = user[0].cart
    
    // Empties the user's cart
    await usersModel.updateOne({
        user_id: userId
    }, {
        $set: {
            cart: []
        }
    }, {multi: true})

    // Adds the order info to the user's past_orders array
    await usersModel.updateOne({
        user_id: userId
    }, {
        $push: {
            past_orders: {
                cart: cart,
                timestamp: Date.now(),
                total: total
            }
        }
    }).then(() => {
        return {
            success: true
        }
    })
}
