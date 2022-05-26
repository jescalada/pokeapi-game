function getUserId() {
    console.log("User id being loaded: " + sessionStorage.getItem("userId"))
    return sessionStorage.getItem("userId")
}