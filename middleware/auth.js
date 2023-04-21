const Connection = require('../models/items')

//check if user is a Guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    }else {
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error','You need to log in first');
        return res.redirect('/users/login');
    }
};

//check if user is a host
exports.isHost = (req, res, next)=>{
    let id = req.params.id;
    Connection.findById(id)
    .then(connection => {
        if(connection){
            if(connection.author == req.session.user){
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};