var express = require("express");
var mongoose = require("mongoose");
mongoose.connect("mongodb://drew:drew77@ds011432.mlab.com:11432/polly");
var Poll  = require("./models/polls.js");
var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user.js");
var FacebookStrategy = require('passport-facebook').Strategy;

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});




passport.use(new FacebookStrategy({
    clientID: '324558804598513',
    clientSecret: '273daccbfe1762d2717bb44af928d1e1',
    callbackURL: 'https://fcc-projects-amail.c9users.io/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
     console.log(profile);
     User.findOne({oauthID : profile.id}, function (err, user){
         if (err){
             console.log(err);
              cb(err, user);
         }
         if (!user){
             var userobj = { username: profile.displayName.split(' ')[0], oauthID: profile.id, name : profile.displayName };
             User.create(userobj, function(err,user){
                 if (err){
                     console.log(err);
                 }
                 else {
                     cb(null, user);
                 }
             })
              
             
         }
         else {
             cb(err, user);
         }
     })
  }
));

// passes current user data to all views

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

mongoose.connect("mongodb://localhost/pollsite");

// Poll.create({
//     title: '12th poll',
//     question: '12',
//     image: "http://blog.sanatanatech.com/wp-content/uploads/2013/12/thumbs-up.jpg",
//     answers : [['Yes', 5], ['No', 1]]
//     },
//     function(err, poll){
//         if (err){
//             console.log('Too bad So Sad');
//         }
//         else {
//             console.log('Created new poll - ' + poll.title);
//         }
//     })

// passes current user data to all views

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

app.get('/', function(req, res){
    var results = Poll.find({}).sort({_id:- 1}).limit(6);  
    results.exec(function(err, p){
       if (err){
           console.log(err)
       }
       else {
           res.render('index.ejs', {p:p} );             
       
       }
   })
   
});


// poll index

app.get('/polls/', function(req, res){
    Poll.find({}, function(err, polls){
        if (err){
            console.log(err);
        }
        else {
            res.render('polls.ejs', {polls : polls})
        }
    })
    
})

// view a poll

app.get('/polls/:id', function(req, res){
    var id = req.params.id;
    
    if (req.params.id in req.cookies){
        var voted = true;
    }
    else {
        voted = false;
    }
    
    Poll.findById(id, function(err, poll){
        if(err){
            console.log(err);
        }
        else{
            var data = [];
            var colors = pColor(poll.answers.length);
            poll.answers.forEach(function(answer, i){
              var obj = {};
              obj.value = answer[Object.keys(answer)],
              obj.label = Object.keys(answer),
              obj.color = colors[i];
              data.push(obj);
            })
            res.render('poll.ejs', {poll: poll, voted:voted, data:data})
        }
    })
})

app.get('/create', function(req, res){
    res.render('create.ejs')
})

// create poll

app.post('/create', function(req, res){
    var newPoll = req.body.poll;
    newPoll.answers = [];
    if (newPoll.image === ''){
        delete newPoll.image;
    }
    console.log(req.body.answer);
    var answers = [];
    req.body.answer.forEach(function(ans){
        var obj = {};
        obj[ans] = 0;
        answers.push(obj);
    })
    newPoll.answers = answers;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    newPoll.author = author;
    Poll.create(newPoll, function(err, poll){
        if (err){
            console.log(err)
        }
        else {
            User.findById(req.user._id, function(err, user){
                if (err){
                    console.log(err);
                }
                else{
                    console.log(user);
                    user.polls.push(poll._id);
                    user.save();
                    console.log(user);
                    res.redirect('/polls/' + poll._id);
                   
                }
            })
            
        }
    })

})


// vote route

app.put('/polls/:id', function(req,res){
  var vote = req.body.vote;
  res.cookie(req.params.id, '1');
  Poll.findById(req.params.id, function(err, poll){
      if (err){
          console.log(err);
      }
      else{
          // increase the value of the chosen options
          var answers = poll.answers;
          var updated = [];
          answers.forEach(function(answer){
              
              if (Object.keys(answer)[0] === vote){
                  var obj = {};
                  obj[Object.keys(answer)] = answer[Object.keys(answer)] + 1;
                  updated.push(obj);
              }
              else {
                  updated.push(answer);
              }
          });
          if(req.body.new){
              var obj = {};
              obj[req.body.new] = 1;
              updated.push(obj);
          }
          var p = poll;
          p.answers = updated;
          Poll.findByIdAndUpdate(req.params.id, p,  function(err, poll){
              if (err){
                  
                  console.log(err);
              }
              else{
                  res.redirect('/polls/' + req.params.id);
              }
      
          })
      }
  })
});
  
      
// user routes

// App ID: 324558804598513
// 273daccbfe1762d2717bb44af928d1e1

app.get('/signup', function(req, res){
    res.render('signup.ejs')
})
  
app.post('/signup', function(req, res){
    var newUser = new User({username : req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err)
            return res.render("signup.ejs");
        }
        console.log(user);
        passport.authenticate("local")(req, res, function(){
           res.redirect('/polls'); 
        });
    });

})

app.get('/user/:id', function(req, res){
    if (req.isAuthenticated()){
        User.findById(req.params.id).populate("polls").exec(function(err, user){
            if (err){
                console.log(err);
            }
            else{
                res.render('user.ejs', { user : user})
            }
            
        })
        
    }
})

// logout route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});

//show login form
app.get("/login", function(req, res){
   res.render("login.ejs"); 
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });                         

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Server is up');
});


function pColor(x){
    var colors = ['red', 'blue', 'green','yellow', 'purple','pink', 'white', 'orange', 'brown'];
    shuffle(colors);
    var selected = [];
    for (var i = 0; i < x; i++){
        selected.push(colors[i]);
    }
    return selected;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
