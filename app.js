var express = require('express')
var app = express()

var crypto = require("crypto")
var path = require ("path")
var mongoose = require ("mongoose")
var multer = require ("multer")
var GridFsStorage = require ("multer-gridfs-storage")
var bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise = Promise

var db_url = process.env.MONGOLAB_URI
//var db_url = 'mongodb+srv://photo-user:user@cluster0-ejunx.mongodb.net/test?retryWrites=true&w=majority'

var schema = new mongoose.Schema({fileName: String,
                                contactName: String,
                                contactEmail: String,
                                likes: Number})

var connection = mongoose.createConnection(db_url, {
    auth: {
        user: photo-user,
        password: user
    }
})
var Photo = connection.model('Photo', schema)

app.use(express.static(__dirname))
var server = app.listen(process.env.PORT || 3000, () => {
    console.log('server is listening on port', server.address().port)
})

var conn = mongoose.createConnection(db_url, /**{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
}**/ {
    auth: {
        user: photo-user,
        password: user
    }
})

let gfs

conn.once("open", () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    })
})

var storage = new GridFsStorage({
    url: db_url,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          }
          resolve(fileInfo);
        })
      })
    }
})

const upload = multer({ storage })

app.post('/upload', upload.single('contest-photo'), async (req, res) => {
    try {
        var contestPhoto = await new Photo;
        contestPhoto.fileName = req.file.filename
        contestPhoto.contactName = req.body['contact-name']
        contestPhoto.contactEmail = req.body['contact-email']
        contestPhoto.likes = 0
        contestPhoto.save(function (err) {
            if (err) return handleError(err);
          });
        res.redirect("/")
    } catch {
        console.error (error)
    }
})

app.get("/photo/:filename", async (req, res) => {
    try {
        gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    } catch (error) {
        return console.error(error)
    }
})

app.get("/photos", async (req, res) => {
    try {
        gfs.find().toArray((err, photos) => {
            res.send(photos)
            if (err) {
                return console.error(err)
            }
        })
    } catch (error) {
        console.error(error)
    }
})

app.get("/likes/:filename", async (req, res) => {
    try {
        Photo.findOne({fileName: req.params.filename},(err, photo_object) => {
            res.send(photo_object)
            }
        )
    } catch (error) {
        return console.error(error)
    }
})

app.post("/like/:filename", async (req, res) => {
    try {
        Photo.update(
            { fileName: req.params.filename },
            { $inc: { 'likes': 1 } },
            (err) => {
                console.log(err)
            }
        )
    } catch (error) {
        return console.error(error)
    }
})


