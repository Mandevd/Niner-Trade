const model = require('../models/items');
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
    item.save()
    .then(item=> res.redirect('/items'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            err.status = 400;
        }
        next(err);
    });
};


exports.show = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Connection id');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
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
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
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
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item=>{
        if(item) {
            res.redirect('/items/'+id);
        } else{
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
            err.status = 400;
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
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