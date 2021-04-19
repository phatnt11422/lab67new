var express = require('express');
var router = express.Router();
var path1 = require('path');

// thay the duong dan mongo cua cac ban
var urlDB = 'mongodb+srv://admin:admin@cluster0.9q4s9.mongodb.net/Tinder?retryWrites=true&w=majority';
const mongoose = require('mongoose');
mongoose.connect(urlDB, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('connected!!!!')
});

var multer = require('multer')
var path = 'uploads/'
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+'-'+file.originalname)
    }
})

var upload = multer({ storage: storage })
// username
// password
// name
// address
// number_phone

var user = new mongoose.Schema({
    name: String,
    date: String,
    sex: String,
    phone: String,
    hobby: String,
    avatar: String
})

/* GET home page. */
router.get('/',function(request,reponse){
    reponse.render('index');
});

router.get('/user', function (req, res, next) {
    // ket noi toi collection ten la users
    var connectUsers = db.model('users', user);
    connectUsers.find({},
        function (error, user) {
            if (error) {
                console.log(error)
                res.render('user', {title: 'Express : Loi'})
            } else {
                res.render('user', {title: 'Express', users: user})
            }
        })
});

let baseJson = {
    errorCode: undefined,
    errorMassage: undefined,
    data: undefined
}

router.get('/getUsers', function (req, res){
    var connectUser = db.model('users', user);
    connectUser.find({},
        function (error, users){
        if (error){
            baseJson.errorCode = 400
            baseJson.errorMassage = error
            baseJson.data = []
        } else {
            baseJson.errorCode = 200
            baseJson.errorMassage = ' Thanh Cong'
            baseJson.data = users
        }
        res.send(baseJson)
        })
})

router.post('/addusers', upload.single('avatar'), function (req, res) {
    console.log(req.body);
    var connectUsers = db.model('users', user);
    connectUsers({
        name: req.body.name,
        date: req.body.date,
        sex: req.body.sex,
        phone: req.body.phone,
        description: req.body.description,
        hobby: req.body.hobby,
        avatar: req.file.filename
    }).save(function (error) {
        if (error) {
            res.render('addusers', {title: 'Express Loi!'});
        } else {
            res.render('addusers', {title: 'Express Thanh Cong'});
        }
    })
})

router.post("/updateusers",upload.single('avatar'), function (req, res, next) {
    var obj = {
        name: req.body.name,
        date: req.body.date,
        sex: req.body.sex,
        phone: req.body.phone,
        description: req.body.description,
        hobby: req.body.hobby,
        avatar: req.file.filename
    }
    var connectUser = db.model("users", user)
    connectUser.updateOne({ _id: req.body._id },  obj , function (err) {
        if (err) {
            console.log(err)
        }
        else {
           res.redirect('/user')
        }
    })
})

router.get("/updateusers",upload.single('avatar'), function (req, res, next) {
    res.render('updateusers',{_id:req.query._id})
})
router.post("/deleteUsers", function (req, res, next) {
    var connectUser = db.model("users", user)
    connectUser.remove({ _id: req.body._id }, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            connectUser.find({}).then(users => {
                res.render("user", { text: "List Delete", users: users.map(obj => obj.toJSON(obj)) })
            })
        }
    })
})


module.exports = router;
