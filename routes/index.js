var express = require('express');
var router = express.Router();
// Get Homepage
// //Handles Every other page/url request
router.get("/", function(req, res) {
    res.render('index', {
        title: "Test title",
        user: {
            name: "Guest"
        }
    });
});
module.exports = router;