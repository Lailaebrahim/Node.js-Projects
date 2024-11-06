class appError extends Error{
    constructor(){
        super();
    }

    createError(statusCode, message){
        this.statusCode = statusCode;
        this.message = message;
        return this;
    }
}

module.exports = appError;