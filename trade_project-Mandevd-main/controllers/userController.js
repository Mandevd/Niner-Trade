const model = require('../models/users');
const Connection = require('../models/items');
const Offer = require('../models/offers');

exports.new = (req, res)=> {
    res.render('./user/new');
};

exports.create = (req, res, next)=> {
    let user = new model(req.body);
    user.save()
    .then(user=>{
        req.flash('success', 'You have Successfully registered');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
};

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;

    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.firstName = user.firstName;
                    req.session.lastName = user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                } else {
                    req.flash('error', 'Wrong password');      
                    res.redirect('/users/login');
                }
            })
            .catch(err => next(err));;     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([model.findById(id) , Connection.find({author: id }), Connection.find(),  Offer.find({tradersId: id })])
    .then(results => {
        [user, trades, allTrades, offerTrades] = results;
        const otherItem = offerTrades.map(otherItemId => otherItemId.valueOf());
        const offers = allTrades.filter(trade => otherItem.includes(trade.id) && trade.status == "Offer Pending");
        const watchList = allTrades.filter(trade => trade.watchBy.includes(id));
        console.log(offers);
        res.render('./user/profile', {user, trades, offers, watchList})  
    })
    .catch(err=>next(err));
  };

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
 };