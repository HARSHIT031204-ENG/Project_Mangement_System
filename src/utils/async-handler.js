export const asynchandler = (requetshandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requetshandler(req, res, next))
        .catch(err => next(err))
    }
}