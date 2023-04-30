const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.static('public'));

const db = new sqlite3.Database('example.db');

const bodyParser = require('body-parser');

app.use(bodyParser.json());


// app.get('/', (req,res) => {
//     res.sendFile(path.join(__dirname,'index.html'))
// })


app.listen(3000, ()=>{
    console.log(`App listening at port 3000`);
} )


app.post('/posttest', (req,res) => {



} )

app.post('/populatesong', (req,res) => {                
  insertuj(req ,'songs_data');
})


app.post('/updater', (req, res) => {
    updater('songs_data', req.body, { id: req.body.id });
})


app.post('/updaterall', (req, res) => {
    let processdata = req.body;

    res.send(req.body);
    for(let i=0;i<processdata.length;i++){
        updater('songs_data', processdata[i], { id: processdata[i].id });
    }
})

app.get('/movetime', (req,res) => {
    res.send('song:'+req.query.song+',time:'+req.query.time+',mode'+req.query.mode )
})

app.get('/delete' , (req , res) => {
    let id = req.query.id;
    let query = 'DELETE FROM songs where id = ' + id;
    console.log(query);
    db.run(query);
})




async function insertuj(req , tableName){


    const insertdata = req.body;

    // console.log(insertdata);

    // const tableName = 'songs';
    const columns = Object.keys(insertdata[0]);
    const values = insertdata.map(obj => Object.values(obj));

    const insertStatements = values.map(vals => {
        const escapedVals = vals.map(val => {
            if (typeof val === 'string') {
                return `'${val.replace(/'/g, "''")}'`;
            } else {
                return val;
            }
        });
        return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${escapedVals.join(', ')});`;
    });

    try {
        db.serialize(() => {
            for (const statement of insertStatements) {
                db.run(statement);
                console.log(statement);
            }
        });
    } catch (error) {
        console.error(error);
        // handle error here, e.g. throw an exception or return an error message
    } finally {
        // db.close();
    }


}


async function updater(tableName, updateObj, condition) {

    try {
        const columns = Object.keys(updateObj);
        const setStatement = columns.map(col => `${col} = ?`).join(', ');
        const values = Object.values(updateObj);

        let conditionClause = '';
        let conditionValues = [];

        if (condition) {
            const conditionColumns = Object.keys(condition);
            conditionClause = `WHERE ${conditionColumns.map(col => `${col} = ?`).join(' AND ')}`;
            conditionValues = Object.values(condition);
        }

        const updateStatement = `UPDATE ${tableName} SET ${setStatement} ${conditionClause};`;
        const statementValues = [...values, ...conditionValues];

        await db.run(updateStatement, statementValues);
        console.log(updateStatement, statementValues);
    } catch (error) {
        console.error(error);
        // handle error here, e.g. throw an exception or return an error message
    } finally {
        // db.close();
    }
}

app.get('/getsongsheaders', (req, res) => {
    db.all("SELECT * FROM songs", [], (err, rows) => {
        res.json(rows);
    })
})



app.get('/getdata', (req,res) =>{
    db.all("SELECT * FROM songs_data", [] , (err, rows) => {
        res.json(rows) ;
    } )
})

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/muzyka/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})



// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10 MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myFile');

// Check file type
function checkFileType(file, cb) {
    // Allowed file types
    const filetypes = /jpeg|jpg|png|gif|txt|mp3/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

// Handle upload
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).json({ error: err });
        } else {
            // File uploaded successfully
            res.status(200).json({ message: 'File uploaded successfully!' });
        }
    });
});


app.get('/migrate', function (req, res) {
    db.serialize(function () {
        db.run("CREATE TABLE songs (id INTEGER PRIMARY KEY,name varchar(255), description varchar(255))");
        db.run('CREATE TABLE "songs_data" (id INTEGER PRIMARY KEY,song varchar(255),tekst text,start float, duration float)');
    });

    db.close();

    res.send('Migration successful!');


    
});


app.post('/createsong', function (req, res) {
    insertuj(req,'songs');
    res.send('POSZŁO');
});





