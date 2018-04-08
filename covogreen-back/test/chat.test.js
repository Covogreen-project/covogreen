//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var ChatController = require('../controller/ChatController');
var co = require('co');
const request = require('supertest');
var jwt = require('jsonwebtoken');
var fs = require("fs");
var path = require('path');
var skey_path = path.join(__dirname, '../skey.txt');
var skey = fs.readFileSync(skey_path, 'utf-8');

chai.use(chaiHttp);

describe('Test Chat Backend', function() {
    it('verifierParametresGetMessages', function(done) {

        // scenario nominal
        var test1 = ChatController.verifierParametresGetMessages(1,2);
        chai.assert.isObject(test1, 'verifierParametresGetMessages retourne bien un objet');
        chai.assert.isEmpty(test1["errors"], 'verifierParametresGetMessages aucune erreur');

        // scenario avec idTrajet et nbElement -> string contenant un int
        var test2 = ChatController.verifierParametresGetMessages("2","2");
        chai.assert.isObject(test2, 'verifierParametresGetMessages retourne bien un objet');
        chai.assert.isEmpty(test2["errors"], 'verifierParametresGetMessages aucune erreur');

        // scenario avec idTrajet et nbElement < 0
        var test3 = ChatController.verifierParametresGetMessages(-10,-20);
        chai.assert.isObject(test3, 'verifierParametresGetMessages retourne bien un objet');
        chai.assert.isNotEmpty(test3["errors"], 'verifierParametresGetMessages contient des erreurs');

        // scenario avec idTrajet et nbElement -> string
        var test4 = ChatController.verifierParametresGetMessages("test","toz");
        chai.assert.isObject(test4, 'verifierParametresGetMessages retourne bien un objet');
        chai.assert.isNotEmpty(test4["errors"], 'verifierParametresGetMessages aucune erreur');

        done();
    });
    it('verifierParametresGetLastMessage', function(done) {

        // scenario nominal
        var test1 = ChatController.verifierParametresGetLastMessage(1,2);
        chai.assert.isObject(test1, 'verifierParametresGetLastMessage retourne bien un objet');
        chai.assert.isEmpty(test1["errors"], 'verifierParametresGetLastMessage aucune erreur');

        // scenario avec idTrajet et nbElement -> string contenant un int
        var test2 = ChatController.verifierParametresGetLastMessage("2","2");
        chai.assert.isObject(test2, 'verifierParametresGetLastMessage retourne bien un objet');
        chai.assert.isEmpty(test2["errors"], 'verifierParametresGetLastMessage aucune erreur');

        // scenario avec idTrajet et nbElement < 0
        var test3 = ChatController.verifierParametresGetLastMessage(-10,-20);
        chai.assert.isObject(test3, 'verifierParametresGetLastMessage retourne bien un objet');
        chai.assert.isNotEmpty(test3["errors"], 'verifierParametresGetLastMessage contient des erreurs');

        // scenario avec idTrajet et nbElement -> string
        var test4 = ChatController.verifierParametresGetLastMessage("test","toz");
        chai.assert.isObject(test4, 'verifierParametresGetLastMessage retourne bien un objet');
        chai.assert.isNotEmpty(test4["errors"], 'verifierParametresGetLastMessage aucune erreur');

        done();
    });
    it('verifierParametresAddMessage', function(done) {

        // scenario nominal
        var test1 = ChatController.verifierParametresAddMessage(1,"test");
        chai.assert.isObject(test1, 'verifierParametresAddMessage retourne bien un objet');
        chai.assert.isEmpty(test1["errors"], 'verifierParametresAddMessage aucune erreur');

        // scenario avec idTrajet -> string contenant un int
        var test2 = ChatController.verifierParametresAddMessage("2","test");
        chai.assert.isObject(test2, 'verifierParametresAddMessage retourne bien un objet');
        chai.assert.isEmpty(test2["errors"], 'verifierParametresAddMessage aucune erreur');

        // scenario avec idTrajet < 0
        var test3 = ChatController.verifierParametresAddMessage(-10,"test");
        chai.assert.isObject(test3, 'verifierParametresAddMessage retourne bien un objet');
        chai.assert.isNotEmpty(test3["errors"], 'verifierParametresAddMessage contient des erreurs');

        // scenario avec idTrajet et nbElement -> string
        var test4 = ChatController.verifierParametresAddMessage(1,"");
        chai.assert.isObject(test4, 'verifierParametresAddMessage retourne bien un objet');
        chai.assert.isNotEmpty(test4["errors"], 'verifierParametresAddMessage aucune erreur');

        done();
    });
    it('verifierParametresGetTrajet', function(done) {

        // scenario nominal
        var test1 = ChatController.verifierParametresGetTrajet(1);
        chai.assert.isObject(test1, 'verifierParametresGetTrajet retourne bien un objet');
        chai.assert.isEmpty(test1["errors"], 'verifierParametresGetTrajet aucune erreur');

        // scenario avec idTrajet -> string contenant un int
        var test2 = ChatController.verifierParametresGetTrajet("2");
        chai.assert.isObject(test2, 'verifierParametresGetTrajet retourne bien un objet');
        chai.assert.isEmpty(test2["errors"], 'verifierParametresGetTrajet aucune erreur');

        // scenario avec idTrajet < 0
        var test3 = ChatController.verifierParametresGetTrajet(-10);
        chai.assert.isObject(test3, 'verifierParametresGetTrajet retourne bien un objet');
        chai.assert.isNotEmpty(test3["errors"], 'verifierParametresGetTrajet contient des erreurs');


        done();
    });
});

describe('Test ChatBack', function() {

    var headersUser;
    var tokenSignUser;
    var user;

    beforeEach(function () {
        user = JSON.stringify({id_user: 3, username: "test", privilege: 1, revoked: false});
        tokenSignUser = jwt.sign(user, skey);

        headersUser = {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + tokenSignUser
        };
    });

    // OK
    it('getAuthorNameById',     function(done) {
       co(ChatController.getAuthorNameById(3)).then( function(val){
           chai.assert.isObject(val, 'getAuthorNameById retourne bien un objet');
           chai.assert.isNotNull(val.id_user);
           chai.assert.isNotNull(val.firstName);
           chai.assert.isNotNull(val.lastName);
       });

        done();
    });

    // OK
    it('getMessages',           function(done) {
        // On test la recuperation d'un message.
        request(app)
            .post('/chat/getMessages')
            .send({
                idTrajet: 5,
                nbElement: 1
            })
            .set('Authorization', 'bearer ')
            .set(headersUser)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }else{
                    var dataJson = JSON.parse(res.text)
                    chai.assert.isObject(dataJson);
                    chai.assert.isNotNull(dataJson.id, "id ne peut pas être vide.");
                    chai.assert.isNotNull(dataJson.message, "message ne peut pas être vide.");
                    chai.assert.isNotNull(dataJson.auteur, "auteur ne peut pas être vide.");
                    chai.assert.isNotNull(dataJson.date, "date ne peut pas être vide.");
                }
            });

        // On récupère les messages d'un trajet ou personne n'a parlé (aucun message).
        request(app)
            .post('/chat/getMessages')
            .send({
                idTrajet: 6,
                nbElement: 1
            })
            .set('Authorization', 'bearer ')
            .set(headersUser)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }else{
                    var dataJson = JSON.parse(res.text)
                    console.log(dataJson);
                    chai.assert.isObject(dataJson);
                    chai.assert.isEmpty(dataJson.messages, "Massages doit être vide.");
                    chai.assert.isEmpty(dataJson.errors, "date ne peut pas être vide.");
                }
            });

        done();
    });

    // OK
    it('getLastMessageById',    function(done) {
        // On test la recuperation d'un message. Doit retouner un message
        request(app).post('/chat/getLastMessageById')
            .send({
                idTrajet: 5,
                idMessage: 1
            })
            .set('Authorization', 'bearer ')
            .set(headersUser)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }else{
                    var dataJson = JSON.parse(res.text)
                    chai.assert.isObject(dataJson);
                    chai.assert.equal(dataJson["messages"][0].id, 2, "L'id du message n'est pas egal à 2");
                    chai.assert.equal(dataJson["messages"][0].message, "Test message 2", "Le message n'est pas egal à Test message 2");
                    chai.assert.equal(dataJson["messages"][0].auteur, "Romain Lembo" , "L'auteur n'est pas egal à Romain Lembo");
                    chai.assert.equal(dataJson["messages"][0].date, "2018-04-03T18:27:27.000Z", "La date ne correspond pas");
                }
            });

        // On test la recuperation d'un message inexistant.
        request(app).post('/chat/getLastMessageById')
            .send({
                idTrajet: 5,
                idMessage: 100
            })
            .set('Authorization', 'bearer ')
            .set(headersUser)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }else{
                    var dataJson = JSON.parse(res.text)
                    chai.assert.isObject(dataJson);
                    console.log(dataJson);
                    chai.assert.isEmpty(dataJson["messages"], "Messages doit etre vide");
                }
            });

        done();
    });


    it('addMessage',            function(done) {
        request(app).post('/chat/add')
            .send({
                idTrajet: 5,
                message: "Hello"
            })
            .set('Authorization', 'bearer ')
            .set(headersUser)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }else{
                    var dataJson = JSON.parse(res.text)
                    console.log(dataJson);
                    chai.assert.isObject(dataJson);
                    chai.assert.equal(dataJson.success, true, "La requete n'a pas renvoyé true");
                }
            });

        // On envoi un message vide. Doit renvoyé un tab d'erreurs.
        request(app).post('/chat/add')
            .send({
                idTrajet: 5,
                message: ""
            })
            .set('Authorization', 'bearer ')
            .set(headersUser)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }else{
                    var dataJson = JSON.parse(res.text)
                    chai.assert.isObject(dataJson);
                    chai.assert.isNotNull(dataJson["errors"], "La requete doit renvoyer un tableau d'erreurs");
                    chai.assert.equal(dataJson["errors"][0], "Le message ne peut pas être vide", "Le message ne correspond pas au message 'Le message ne peut pas être vide'");
                }
            });
        done();
    });

    // OK
    it('getTrajet',             function(done) {
        // On récupère un trajet depuis la db
        request(app).post('/chat/getTrajet')
            .send({
                idTrajet: 5
            })
            .set('Authorization', 'bearer ').set(headersUser)
            .expect(200).end(function(err, res) {
            if (err){
                return done(err);
            } else{
                var dataJson = JSON.parse(res.text)
                chai.assert.isObject(dataJson);

                chai.assert.isNotNull(dataJson.id, "id ne peut pas être vide.");
                chai.assert.equal(dataJson.id, 5, "L'id doit etre 5");

                chai.assert.isNotNull(dataJson.depart, "depart ne peut pas être vide.");
                chai.assert.equal(dataJson.depart, "Nice", "Nice doit etre le depart.");

                chai.assert.isNotNull(dataJson.destination, "destination ne peut pas être vide.");
                chai.assert.equal(dataJson.destination, "Antibes", "Antibes doit etre la destination.");

                chai.assert.isNotNull(dataJson.date_trajet, "date_trajet ne peut pas être vide.");
                chai.assert.equal(dataJson.date_trajet, "2018-03-13 00:00:00", "La date du trajet ne correspond pas");

                chai.assert.isNotNull(dataJson.auteur, "auteur ne peut pas être vide.");
                chai.assert.equal(dataJson.auteur, 3, "L'auteur doit êtrre égal à 3.");

                chai.assert.isNotNull(dataJson.nombre_place_disponible, "nombre_place_disponible ne peut pas être vide.");
                chai.assert.equal(dataJson.nombre_place_disponible, 2, "Le nombre de place doit être de 2.");

            }
        });

        done();
    });
});