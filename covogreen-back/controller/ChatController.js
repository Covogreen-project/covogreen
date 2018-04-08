/**
 * Author : Mohamed El karmoudi
 * Date : 05/03/2018
 */
var Chat = require("../database/models/chat");
var User = require("../database/models/user");
var Trajet = require("../database/models/journey");
var InscriptionJourney =  require("../database/models/inscriptionJourney");
const Op = require('sequelize').Op;
var co = require('co');
var authToken = require("./tools/authToken");

const nodemailer = require('nodemailer');
const emailController = require('../controller/EmailController');

var jwt = require('jsonwebtoken');
var fs = require("fs");
var path = require('path');

var authToken = require("./tools/authToken");


var ChatController = {
    /**
     * @param idTrajet
     * @param nbElement
     *
     * On vérifie les parametres envoyé par le front de la requete getMessages
     */
     verifierParametresGetMessages: function(idTrajet, nbElement) {
    var out = { "messages" : [], "errors" : [] };

    // On vérifie que idTrajet est un entier et qu'il n'est pas négatif
    if(!Number.isInteger(parseInt(idTrajet)))
        out.errors.push("Le trajet n'est pas un chiffre");

    if(idTrajet < 0)
        out.errors.push("Le trajet ne peut pas être négatif");

    // On vérifie que le nbElement est strictement positif et que c'est un entier.
    if(!Number.isInteger(parseInt(nbElement)))
        out.errors.push("Le nombre d'élement n'est pas un chiffre");

    if(nbElement < 0)
        out.errors.push("Le nombre d'élement demandé doit être strictement positif");

    return out;
},

    /**
     * @param idTrajet
     * @param idMessage
     *
     * On vérifie les parametres envoyé par le front pour la requete qui renvoi le message ajouté juste
     * apres un autre message (idMessage)
     */
     verifierParametresGetLastMessage : function(idTrajet, idMessage) {
        var out = { "messages" : [], "errors" : [] };

        // On vérifie que idTrajet est un entier et qu'il n'est pas négatif
        if(!Number.isInteger(parseInt(idTrajet)))
            out.errors.push("Le trajet n'est pas un chiffre");

        if(idTrajet < 0)
            out.errors.push("Le trajet ne peut pas être négatif");

        // On vérifie que le nbElement est strictement positif et que c'est un entier.
        if(!Number.isInteger(parseInt(idMessage)))
            out.errors.push("L'identifiant du message n'est pas un chiffre");

        if(idMessage < 1)
            out.errors.push("L'identifiant du message demandé doit être strictement positif");

        return out;
    },

    /**
     * @param idTrajet
     * @param message
     *
     * On vérifie les parametres envoyé par le front pour la requete qui ajoute un message dans la db.
     */
     verifierParametresAddMessage : function(idTrajet, message) {
        var out = { "errors" : [] };

        // On vérifie que idTrajet est un entier et qu'il n'est pas négatif
        if(!Number.isInteger(parseInt(idTrajet)))
            out.errors.push("Le trajet n'est pas un chiffre");

        if(idTrajet < 0)
            out.errors.push("Le trajet ne peut pas être négatif");

        if(message.length === 0)
            out.errors.push("Le message ne peut pas être vide");

        return out;
    },

    /**
     * @param idTrajet
     * @returns {{offre: Array, errors: Array}}
     *
     * Vérifie les champs recus dans la requete getTrajet.
     */
     verifierParametresGetTrajet: function(idTrajet){
        var out = { "offre" : [], "errors" : [] };

        // On vérifie que idTrajet est un entier et qu'il n'est pas négatif
        if(!Number.isInteger(parseInt(idTrajet)))
            out.errors.push("Le trajet n'est pas un chiffre");

        if(idTrajet < 0)
            out.errors.push("Le trajet ne peut pas être négatif");

        return out;
    },

    /**
     * On vérifie que dans la table InscriptionTrajet l'utilisateur est inscrit au trajet demandé.
     */
    middlewareProtection: co.wrap(function * (req, res){
        // On décode le json
        var token = authToken.getToken(req);
        if(token.revoked)
            res.status(200).send({success: false, message: "token revoqué"});

        // On vérifie que l'id_user existe dans le token.
        if(token.id_user == null)
            res.status(200).send({success: false, message: "Le token ne contient pas l'id de l'utilisateur connecté (id_user)."});

        // On vérifie qu'un id trajet exist dans la requete.
        if(req.body.idTrajet == null)
            res.status(200).send({success: false, message: "Il faut renseigner l'id d'un trajet."});

        var idTrajet    = parseInt(req.body.idTrajet);
        var idUser      = parseInt(token.id_user);

        // On vérifie que l'utilisateur peut visualiser le chat.
        // On vérifie qu'il est inscrit au trajet (idTrajet).
        var inscriptionJourney = yield InscriptionJourney.find({ where: { id_trajet: idTrajet,  id_user : idUser } });

        try {
            if(inscriptionJourney == null)
                return res.status(200).send({ success: false,  message: "Impossible d'accéder à la page l'utilisateur n'est pas inscrit au trajet : " + idTrajet });
        }catch(erreur){
            return res.status(200).send({ success: false,  message: "Une erreur est survenue lors de l'execution de la req sql" });
        }
    }),


    /**
     * détermine les information d'un utilisateur.
     */
    getAuthorNameById: co.wrap(function * (id){
        return yield User.findById(id);
    }),


    /**
     * On récupère les X dernier messages entre les utilisateurs d'un trajet.
     * Auteur : Mohamed EL karmoudi
     *
     * Entré :
     *      idTrajet : entier
     *      nbElement : entier
     */
    getMessages: co.wrap(function * (req, res){
      ChatController.middlewareProtection(req,res);
        // On vérifie les paramètres
        var out = ChatController.verifierParametresGetMessages(req.body.idTrajet ,req.body.nbElement);
        if(out["errors"].length > 0){
            res.send(out);
        }

        var idTrajet = parseInt(req.body.idTrajet);
        var nbElement = parseInt(req.body.nbElement);

        // si nb element = 0 on renvoi ts les element.
        // sinon on renvoi le nb element souhaitée.
        var resultats = (nbElement===0) ?
            yield Chat.findAll({ where: { id_trajet: idTrajet } }) :
            yield Chat.findAll({ where: { id_trajet: idTrajet },  offset: 0,  limit : nbElement});

        try{
            if (resultats){
                for (var i = 0; i< resultats.length; i++){
                    var author = yield ChatController.getAuthorNameById(resultats[i].id_auteur);

                    out["messages"].push({
                        id      : resultats[i].id,
                        message : resultats[i].message,
                        auteur  : author.firstName + " " + author.lastName,
                        date    : resultats[i].createdAt
                    });
                }
                res.send(out);
            }else{
                // Aucun element
                res.send(out);
            }
        }catch(erreur){
            out["errors"].push("Une erreur est survenue lors de l'execution de la req sql");
            res.status(500).send(out);
        }
    }),


    /**
     * On récupère le dernier message d'un trajet.
     * Auteur : Mohamed EL karmoudi
     *
     *   Entré :
     *      idTrajet : entier
     *      idMessage : entier
     */
    getLastMessageById: co.wrap(function * (req, res) {
      ChatController.middlewareProtection(req,res);

        // On vérifie les paramètres
        var out = ChatController.verifierParametresGetLastMessage(req.body.idTrajet, req.body.idMessage);
        if(out["errors"].length > 0){
            res.send(out);
        }

        var idTrajet = req.body.idTrajet;
        var idMessage = req.body.idMessage;

        // On récupère les info du message passé en parametre
        var messageData = yield Chat.find({ where: { id_trajet: idTrajet,  id : idMessage }, order:[['createdAt', 'ASC']] });

        try {
            if (messageData) {
                var dateMessage = messageData.createdAt;
                var chat = yield Chat.find({where: {id_trajet: idTrajet, createdAt: {[Op.gt]: dateMessage}}});

                if (chat) {
                    // Un message existe
                    var author = yield ChatController.getAuthorNameById(chat.id_auteur);

                    out["messages"].push({
                        id: chat.id,
                        message: chat.message,
                        auteur: author.firstName + " " + author.lastName,
                        date: chat.createdAt
                    });
                    res.send(out);
                } else {
                    // Aucun message
                    res.send(out);
                }
            } else {
                // Aucun element ne correspond dans la db
                res.send(out);
            }
        } catch(erreur){
            console.log(erreur);
            out["errors"].push("Une erreur est survenue lors de l'execution de la req sql");
            res.status(500).send(out);
        }
    }),


    /**
     * On ajout un message
     * Auteur : Mohamed EL karmoudi
     *
     *   Entré :
     *      idTrajet : entier
     *      message : string
     */
    addMessage: co.wrap(function *  (req, res){
      ChatController.middlewareProtection(req,res);
        var userToken = authToken.getToken(req);

      	req.accepts('application/json');
        // On vérifie les paramètres
        var out = ChatController.verifierParametresAddMessage(req.body.idTrajet, req.body.message);
        if(out["errors"].length > 0){
            res.send(out);
        }

        var idTrajet = parseInt(req.body.idTrajet);
        var message = req.body.message;
        var idUser = parseInt(userToken.id_user);

        try{
            var reqSql = yield Chat.create({id_auteur: idUser, id_trajet: idTrajet, message: message});
            if(reqSql)
            {   // Le message a été ajouté
                // On récupère les participants du trajet
                var allParticipants = yield InscriptionJourney.findAll({ where: { id_trajet: idTrajet } });

                // On envoi un message à chaque participant.
                for (var i = 0; i<allParticipants.length; i++){
                    var userInfo = yield User.findById(allParticipants[i].id_user);
                    yield ChatController.sendEmail(userInfo.username, userInfo.email);
                }

                res.status(200).send({
                    success: true
                });
            }
            else
            {
                out["errors"].push("impossible d'ajouter le message");
                res.send(out);
            }
        }catch(erreur){
            out["errors"].push("Une erreur est survenue lors de l'execution de la req sql");
        }
    }),


    /**
     * Se charge d'envoyer un email.
     */
    sendEmail: co.wrap(function * (username, email){
        var subject = 'Un utilisateur a ajouté un message.';
        var text = 'Bonjour '+ username +'\n\n Un utilisateur vient d\'ajouter un message dans le chat du trajet dans lequel vous ête inscrit.';

        try {
            emailController.sendEmail(username, email, subject, text);
        }
        catch(error){
            console.log(error);
        }
    }),

    /**
     * On renvoi les info d'un trajet
     */
    getTrajet: co.wrap(function * (req, res){
      ChatController.middlewareProtection(req,res);

        // On vérifie les paramètres
        var out = ChatController.verifierParametresGetTrajet(req.body.idTrajet);
        if(out["errors"].length > 0){
            res.send(out);
        }

        var id = req.body.idTrajet;
        var trajet = yield Trajet.findById(id);

        try{
            if(trajet){
                var author = yield ChatController.getAuthorNameById(trajet.id_driver);

                out["offre"] = {
                    id      : trajet.id_journey,
                    depart : trajet.origin,
                    destination  : trajet.destination,
                    date_trajet    : trajet.date_journey,
                    auteur : author.firstName + " " + author.lastName,
                    nombre_place_disponible : trajet.seats_available
                };

                res.send(out);
            }else{
                out["errors"].push("Le trajet n'existe pas");
                res.send(out);
            }
        }catch(erreur){
            out["errors"].push("Une erreur est survenue lors de l'execution de la req sql");
            res.status(500).send(out);
        }
    })
};

module.exports = ChatController;
