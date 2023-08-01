const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainRoutes = require('./routes/mainRoute');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

//create app
const app =express();

//configure app
let port = 5000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database 
mongoose.connect('mongodb://127.0.0.1:27017/trade', 
                {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(()=> {
    //start app
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));




//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(
    session({
        secret: "qwuehuweheu1u323ublkoylt",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/trade'}),
        cookie: {maxAge: 60*60*1000}
        })
  );

  app.use(flash());
  app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
  });

app.use('/', mainRoutes);
app.use('/items', itemRoutes);
app.use('/users',userRoutes);
app.use('/connections',itemRoutes);





app.use((req, res, next) => {
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server Error")
    }
    res.status(err.status);
    res.render('error',{error:err});
});

//start the server
// app.listen(port, host, () => {
//     console.log('The server is running at port', port);
// });