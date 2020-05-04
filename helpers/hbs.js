const moment = require('moment');

const equal = function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};

//Count pages needed to show all restaurants 
const getPages = (array) =>{

    let pages = array.length / 10;
    pages = Math.ceil(pages)
    return pages;
};

const getNext = (array) =>{
    if(array.length > 10){
        return Next &rarr;
    }
};

const getPrev = (array) =>{
    if(array.length < 10){
        return Previous &larr;;
    }
};

const formatDate = (date) =>{
    return moment(date).format("MMMM Do YYYY")
   
}

module.exports = {equal, getPages, getNext, getPrev, formatDate};