var bodyParser       = require('body-parser'),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose         = require("mongoose"),
    express          = require("express"),
    app              = express();
 
  //app config 
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
// this has to go after body parser
app.use(expressSanitizer());

// mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String, 
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


// restful routes

app.get("/", function(req, res){
   res.redirect("/blogs"); 
});
// index route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error");
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});
// new Route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// create Route
app.post("/blogs", function(req, res){
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render('new');
        } else {
            // then, redirect to index
            res.redirect("/blogs");
        }
    });
});
// show route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});
// edit route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
    
});
// update route
app.put("/blogs/:id", function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        req.body.blog.body = req.sanitize(req.body.blog.body);
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// delete route
app.delete("/blogs/:id", function(req, res){
//  destroy post
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is running");
})