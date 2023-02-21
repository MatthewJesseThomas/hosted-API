function errorHandling(err, req, res, next) {
    if(err){
        const status = err.status || 500;
        res.status(status).json(
            {
                status: status,
                err: "An error has Occurred. Please try again Later..."
            }
        )
    }
    next();
}
module.exports = {errorHandling};