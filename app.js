const express = require('express');//framework pour créer des applications web
const bodyParser = require('body-parser');//middleware pour parser les corps des requêtes HTTP
const nodemailer = require('nodemailer');//pour envoie un meg en mail
const session = require('express-session'); // Importer express-session
const flash = require('connect-flash'); // Importer connect-flash
const crypto = require('crypto');
var path=require('path');
const mysql = require('mysql2');//module pour interagir avec une base de données MySQL
const app = express();
exports.app = app;
// const multer = require('multer');

//Configuration de l'application
app.use(bodyParser.json());// Utilisation de body-parser pour analyser les requêtes JSON
app.use(bodyParser.urlencoded({ extended: true }));// Middleware pour parser les données du formulaire
// app.use(cors());
// app.use(fileUpload());

app.use(express.static(path.join(__dirname,'')));// Servir les fichiers statiques depuis le répertoire courant

app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'ejs');



app.get('/',function(request, response){
  response.render('index');
});


// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'Ycode@2021',
database: 'SAM'
});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});


app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Pour HTTPS, mettez secure: true
  }));
  app.use(flash());
  
  // Middleware pour injecter les messages flash dans les vues
  app.use((req, res, next) => {
    res.locals.message = req.flash('message');
    next();
  });
/////// insription
  app.post('/inscription', (req, res) => {
    const { nom, prenom, telephone, email, adresse, profession, organisation, mot_de_passe } = req.body;

    const sql1 = "SELECT * FROM utilisateurs WHERE email=? ";
    db.query(sql1, [email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email :', err);
            return res.status(500).send('Erreur lors de la vérification de l\'email');
        }

        if (results.length > 0) {
           console.log( 'email existe déjà en base de données');
              req.flash('message', 'email deja enregistrer  !');
             return res.redirect('/index');
        } else {
            const sql = `INSERT INTO utilisateurs (nom, prenom, telephone, email, adresse, profession, organisation, mot_de_passe, role)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Utilisateur')`;

            db.query(sql, [nom, prenom, telephone, email, adresse, profession, organisation, mot_de_passe], (err, result) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion de l\'utilisateur:', err);
                    res.status(500).send('Erreur serveur');
                } else {
                    console.log('Inscription réussie !')
                    req.flash('message', 'Inscription réussie !');
                   return res.redirect('/index');
                }
            });
        } 
    });
});

// login
app.post('/login', (req, res) => {
      const { mail, password } = req.body;
      const sql = 'SELECT role FROM utilisateurs WHERE email = ? AND mot_de_passe = ?';
      db.query(sql, [mail, password], (err, results) => {
        if (err) {
          console.error('Erreur lors de la requête de connexion :', err);
          return res.status(500).json({ message: 'Erreur lors de la connexion : ' + err.message });
        }
        if (results.length > 0) {
          const role = results[0].role;
          if (role === 'Administrateur') {
            //  res.json({ message: 'Connexion réussie'});
             res.redirect('/admin');
          } else {
            //  res.json({ message: 'Connexion réussie' });
             res.redirect('/evenement'); 
          }
        } else {
            console.log("mdp ou mail inccorect ")
           req.flash('message', 'mdp ou mail inccorect !');
           res.redirect('/login');
        }
      });
    });
    // Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kkaoutar446@gmail.com',
      pass: 'youcode2024'
    }
  });

  
  
//   app.get('/forgetPassword', (req, res) => {
//     res.send(`
//       <form action="/sendCode" method="post">
//         <label for="email">Email:</label>
//         <input type="email" id="email" name="email" required>
//         <button type="submit">Envoyer le code</button>
//       </form>
//     `);
//   });
  
//   app.post('/sendCode', (req, res) => {
//     const email = req.body.email;
//     const code = crypto.randomBytes(3).toString('hex'); // Générer un code aléatoire
//     transporter.sendMail({
//         from: 'kkaoutar446@gmail.com',
//         to: email,
//         subject: 'Code de réinitialisation de mot de passe',
//         text: `Votre code de réinitialisation est : ${code}`
//       },(error, info) => {
//               if (error) {
//                 return console.log(error);
//               }});
//       console.log('iciiiiiiiiii');

//     });
  
    // connection.query('UPDATE utilisateurs SET reset_code = ? WHERE email = ?', [code, email], (err, results) => {
    //   if (err) throw err;
  
    //   if (results.affectedRows > 0) {
    //     transporter.sendMail({
    //       from: 'your_email@gmail.com',
    //       to: email,
    //       subject: 'Code de réinitialisation de mot de passe',
    //       text: `Votre code de réinitialisation est : ${code}`
    //     }, (error, info) => {
    //       if (error) {
    //         return console.log(error);
    //       }
    //       res.send(`
    //         <form action="/resetPassword" method="post">
    //           <input type="hidden" name="email" value="${email}">
    //           <label for="code">Code:</label>
    //           <input type="text" id="code" name="code" required>
    //           <button type="submit">Vérifier le code</button>
    //         </form>
    //       `);
    //     });
    //   } else {
    //     res.send('Email non trouvé.');
    //   }
    // });
  
  
//   app.post('/resetPassword', (req, res) => {
//     const { email, code } = req.body;
  
//     connection.query('SELECT * FROM users WHERE email = ? AND reset_code = ?', [email, code], (err, results) => {
//       if (err) throw err;
  
//       if (results.length > 0) {
//         res.send(`
//           <form action="/updatePassword" method="post">
//             <input type="hidden" name="email" value="${email}">
//             <label for="password">Nouveau mot de passe:</label>
//             <input type="password" id="password" name="password" required>
//             <button type="submit">Mettre à jour le mot de passe</button>
//           </form>
//         `);
//       } else {
//         res.send('Code invalide.');
//       }
//     });
//   });
  
//   app.post('/updatePassword', (req, res) => {
//     const { email, password } = req.body;
  
//     connection.query('UPDATE users SET password = ?, reset_code = NULL WHERE email = ?', [password, email], (err, results) => {
//       if (err) throw err;
//       res.send('Mot de passe mis à jour avec succès.');
//     });
//   });

app.get('/index', (req, res) => {
    res.render('index');
  });

  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  app.get('/admin', (req, res) => {
    res.render('admin');
  });
  
  app.get('/evenement', (req, res) => {
    res.render('evenement');
  });

  app.get('/forgetPassword', (req, res) => {
    res.render('forgetPassword');
  });

  app.listen(8000,function(){
    console.log("heard en 8000");
  });
    