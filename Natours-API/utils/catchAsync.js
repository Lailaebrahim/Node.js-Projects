// this for wrapping async functions instead of catch block in every async function
// note if we have a function that is not async and wrapped with this function it will raise an error as catch will be called on a non promise
const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
};

export default catchAsync;