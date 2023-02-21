function message(req, res, next) {
    console.log("This Message is coming from the MiddleWare!!!");
    next();
}

module.exports = {message};