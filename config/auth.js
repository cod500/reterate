const auth = (req, res, next) =>{
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/');
};

const notGuest = (req, res, next) =>{
    if(req.isAuthenticated()){
        res.redirect('/')
    }else{
        return next();
    }
}

module.exports = {auth, notGuest};