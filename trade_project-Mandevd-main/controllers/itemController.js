const model = require('../models/items');
const Offer = require('../models/offers');
const user = require('../models/users');

const { DateTime } = require("luxon");

exports.index = (req, res, next) => {
    let categories = [];
    model.distinct("category", function(error, results){
        categories = results;
    });
    model.find()
    .then(items => res.render('./item/index', {items, categories}))
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./item/new');
};

exports.create = (req, res, next) => {
    let item = new model(req.body); //create a new connection doc
    item.author = req.session.user;
    item.status = "available";
    item.save()
    .then(item=>{
        req.flash('success', 'You have created a new Item successfully!!');
        res.redirect('/items')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            err.status = 400;
            req.flash('error', err.message);
            res.redirect('back');
        }else{
        next(err);
        }
    });
};


exports.show = (req, res, next) => {
    let id = req.params.id;
    model.findById(id).populate('author', 'firstName lastName')
    .then(item => {
        if(item) {
            item.date = DateTime.fromSQL(item.date).toFormat('LLLL dd, yyyy');
            item.startTime = DateTime.fromSQL(item.startTime).toFormat('hh:mm a');
            item.endTime = DateTime.fromSQL(item.endTime).toFormat('hh:mm a');
            return res.render('./item/show', {item});
        } else {
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(item=> {
        if(item) {
            return res.render('./item/edit', {item});
        } else{
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));

};

exports.update = (req, res, next) => {
    let item = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item=>{
        if(item) {
            req.flash('success', 'Trade has been successfully updated');
            res.redirect('/items/'+id);
        } else{
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status = 400;
            req.flash('error', err.message);
            res.redirect('back');
        }else{   
        next(err);
        }
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(item =>{
        if(item) {
            res.redirect('/items');
        } else {
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};

exports.watch = (req, res, next) => {  
    const id = req.params.id;
    model.findById(id)
    .then(trade => {
        if(!trade.watchBy.includes(req.session.user)) 
        {
            trade.watchBy.push(req.session.user);
        }
        model.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
        .then(watchTrade => {
            return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
};

exports.unwatch = (req, res, next) => {  
    const id = req.params.id;
    model.findById(id)
    .then(trade => {
        const watchIndex = trade.watchBy.indexOf(req.session.user);
        if(watchIndex !== -1) 
        {
            trade.watchBy.splice(watchIndex, 1);
        }
        model.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
        .then(watchTrade => {
            return res.redirect('back');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
};

exports.trade = (req, res, next)=>{
    let otherItem = {id: req.params.id };
    let id = req.session.user;
    Promise.all([user.findById(id), model.find({author: id})]) 
    .then(results=>{
        if(results.author != id) {
            const [user, trades] = results;
            res.render('./user/trade', {user, trades, otherItem})
            }
    })
    .catch(err=>next(err));
};

exports.offer = (req, res, next) => { 
    let offer = new Offer(req.body);
    offer.otherItemId = req.params.id;
    offer.tradersId = req.session.user;
    offer.save()
    .then(offerTrade => {
        model.updateMany(
            {"_id":{$in: [offer.tradeId, offer.otherItemId]}}, 
            {status: "Offer Pending", offerId: offerTrade.id})
        .then(result => {
            req.flash('success', 'Trade Offer has been created successfully!');
            return res.redirect('/users/profile');
        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err));
};

exports.cancelOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerTrade => {
        model.updateMany(
            {"_id": {$in: [offerTrade.tradeId, offerTrade.otherItemId]}}, 
            {status: "Available", offerId: null})
        .then(result => {
            Offer.findByIdAndDelete(offerTrade.id, {useFindAndModify: false, runValidators: true})
            .then(result => {
                return res.redirect('/users/profile');
            })
            .catch(err => next(err));
        })
    })
    .catch(err => next(err))
};

exports.manageOffer = (req, res, next) => { 
    const tradersId = req.session.user;
    let id = req.params.id;
    Offer.findById(req.params.id)
    .then(offerTrade => {
        if(offerTrade) {
            model.find({"_id": {$in: [offerTrade.tradeId, offerTrade.otherItemId]}})
            .then(result => {
                console.log(result);
                if (result  && result.length === 2) 
                {
                    const user = { isOfferInitiator: offerTrade.tradersId == tradersId ? true: false};
                    let trade1, trade2 = null;
                    if(result[0].author == tradersId) 
                    {
                        trade1 = result[0];
                        trade2 = result[1];
                    } 
                    else 
                    {
                        trade1 = result[1];
                        trade2 = result[0];
                    }
                    res.render('./offer/manage', {user, trade1, trade2, offerTrade});
                } 
                else 
                {
                    let err = new Error('Cannot find item with id '+ id)
                    err.status = 404;
                    next(err);
                }
        
            })
        } 
        else 
        {
            let err = new Error('Cannot find the offer associated with this Item')
            err.status = 404;
            next(err);
        } 
    })      
    .catch(err => next(err))
};


exports.acceptOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerTrade => {
        model.updateMany(
            {"_id": {$in: [offerTrade.tradeId, offerTrade.otherItemId]}}, 
            {status: "Traded"})
        .then(result => {
           return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};


exports.rejectOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerTrade => {
        model.updateMany(
            {"_id": {$in: [offerTrade.tradeId, offerTrade.otherItemId]}}, 
            {status: "Available", offerId: null})
        .then(result => {
            Offer.findByIdAndDelete(offerTrade.id, {useFindAndModify: false, runValidators: true})
            .then(result => {
                return res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        })
        .catch(err=>next(err))
    })
    .catch(err=>next(err));
};