/**
 * @author: Alex Zarzitski & Marvin Rameix
 * Date: 19/03/2018
 */
var Journey = require("../database/models/journey");
var User = require("../database/models/user");
var InscriptionJourney = require("../database/models/inscriptionJourney");
const Op = require('sequelize').Op;
var co = require('co');

var authToken = require("./tools/authToken");


/**
 * Controleur InscriptionTrajet
 */
var InscriptionTrajetController = {

    /**
     * Cette methode effectue une tentative de l'inscription au trajet d'utilisateur courant
     * @param req Trame envoyée par le client
     * @param res Trame de retour vers le client
     */
    doIt: function (req, res) {
        // On décode le json
        var token = authToken.getToken(req);

        if(token.revoked)
            res.status(200).send({success: false, message: ["Error Token"]});

        var journey = null;
        var user = null;
        var test = null;

        Journey.findById(parseInt(req.body.idTrajet))
            .then(function (response) {
                journey = response.dataValues;
            });
        User.findById(parseInt(token.id_user))
            .then(function (response) {
                user = response.dataValues;
            });

        if(journey != null)
            if(user != null)
                if(journey.seats_available >= 1){

                    InscriptionTrajetController.checkSubscribe(journey, user)
                        .then(function (response) {
                            test = response.dataValues;
                        });

                    if(test == false){
                        var inscriptionJourney = null;
                        journey.seats_available = journey.seats_available-1;
                        journey.save();

                        InscriptionJourney.create({ "id_user" : user.id_user, "id_trajet" : journey.id_journey})
                            .then(function (response) {
                                inscriptionJourney = response.dataValues;
                            });

                        res.status(200).send({success: true});
                    }
                    else
                        res.status(200).send({success: false, message: ["Error the user is already subscribed to journey"]});
                }
                else
                    res.status(200).send({success: false, message: ["Error the journey is full"]});
            else
                res.status(200).send({success: false, message: ["Impossible to find user"]});
        else
            res.status(200).send({success: false, message: ["Impossible to find journey"]});
    },

    /*doIt: co.wrap(function * (req, res) {
        req.accepts('application/json');
        // On décode le json
        var token = authToken.getToken(req);
        if(token.revoked)
            res.status(200).send({success: false, message: ["Error Token"]});

        var journey = yield Journey.findById(parseInt(req.body.idTrajet));
        var user = yield User.findById(parseInt(token.id_user));

        if(journey != null)
            if(user != null)
                if(journey.seats_available >= 1){
                    var test = yield InscriptionTrajetController.checkSubscribe(journey, user);
                    if(test == false){
                        journey.seats_available = journey.seats_available-1;
                        journey.save();
                        var inscriptionJourney = yield InscriptionJourney.create({ "id_user" : user.id_user, "id_trajet" : journey.id_journey});
                        res.status(200).send({success: true});
                    }
                    else
                        res.status(200).send({success: false, message: ["Error the user is already subscribed to journey"]});
                }
                else
                    res.status(200).send({success: false, message: ["Error the journey is full"]});
            else
                res.status(200).send({success: false, message: ["Impossible to find user"]});
        else
            res.status(200).send({success: false, message: ["Impossible to find journey"]});
    }),*/

    /**
     * Cette methode indique au client si l'utilisateur est déjà inscrit au trajet ou pas
     * @param req Trame envoyée par le client
     * @param res Trame de retour vers le client
     */
    verif: function (req, res) {

        // On décode le json
        var token = authToken.getToken(req);
        var id_journey = req.params.id_journey;

        if(token != null) {

            var journey = null;
            var user = null;
            var test = null;

            Journey.findById(parseInt(id_journey))
                .then(function (response) {
                    journey = response.dataValues;
                });

            User.findById(parseInt(token.id_user))
                .then(function (response) {
                    user = response.dataValues;
                });

            if(journey != null)
                if(user != null){

                    InscriptionTrajetController.checkSubscribe(journey, user)
                        .then(function (response) {
                            test = response.dataValues;
                        });

                    if(test == false)
                        res.status(200).send({success: true});
                    else
                        res.status(200).send({success: false, message: ["User is already subscribed to journey"]});
                }
                else
                    res.status(200).send({success: false, message: ["Impossible to find user"]});
            else
                res.status(200).send({success: false, message: ["Impossible to find journey"]});

        }
    },

    /*verif: co.wrap(function * (req, res) {
        req.accepts('application/json');

        // On décode le json
        var token = authToken.getToken(req);

        if(token != null) {

            var journey = yield Journey.findById(parseInt(req.body.idTrajet));
            var user = yield User.findById(parseInt(token.id_user));

            if(journey != null)
                if(user != null){
                    var test = yield InscriptionTrajetController.checkSubscribe(journey, user);
                    if(test == false)
                        res.status(200).send({success: true});
                    else
                        res.status(200).send({success: false, message: ["User is already subscribed to journey"]});
                }
                else
                    res.status(200).send({success: false, message: ["Impossible to find user"]});
            else
                res.status(200).send({success: false, message: ["Impossible to find journey"]});

        }
    }),*/

    /**
     * Cette methode vérifie si l'utilisateur est déjà inscrit au trajet
     * @param journey Le trajet sélectionné
     * @param user L'utilisateur sélectionné
     */
    checkSubscribe: co.wrap(function * (journey, user) {
        var condition = { 'where' : { [Op.and] : [{"id_user" : user.id_user}, {"id_trajet" : journey.id_journey}] } };
        var inscriptionJourneyList = yield InscriptionJourney.findAll(condition);
        if(inscriptionJourneyList == null || inscriptionJourneyList.length <= 0 )
            return false;
        else
            return true;
    }),

    /**
     * Method for getting inscriptionJourney data with id_user and id_journey
     * @param req
     * @param res
     */
    getInscriptionJourneyByJourneyAndUser:  function  (req, res) {

        var userToken = authToken.getToken(req);
        var id_journey = req.params.id_journey;

        if(!userToken.revoked)
        {
            InscriptionJourney.findOne({
                where: {
                    id_user: userToken.id_user,
                    id_trajet: id_journey
                }
            })
            .then(function (response) {
                res.status(200).send(response);
            })
            .catch(function (error) {
                console.log('Fail find for getting InscriptionJourney :', error);
                res.status(500).send("Echec de la requête de récupation d'InscriptionJourney");
            });
        }
        else res.status(500).send("Compte bloqué !");
    },

    /**
     * @author Marvin RAMEIX
     * allow an user to rate and comment with date check
     * @param req
     * @param res
     */
    rateAndComment: function (req, res) {
        var userToken = authToken.getToken(req);
        Journey.findOne({
            where: {
                id_journey: req.params.id_journey,
                date_journey: {
                    [Op.lt]: new Date()
                }
            }
        }).then(
            function (trajet) {
                if (trajet !== null) {
                    InscriptionJourney.update({
                            rate: req.body.rate,
                            comment: req.body.comment
                        }, {
                            where: {
                                id_user: userToken.id_user,
                                id_trajet: trajet.dataValues.id_journey
                            }
                        }
                    );
                    res.status(200).send("La note et commentaire ont bien été pris en compte");
                }
                else{
                    res.status(400).send("Aucun trajet terminé n'a été trouvé pour l'utilisateur courant ");
                }
            }
        ).catch(
            function (reason) {
                console.log(reason);
                res.status(400).send("Le trajet correspondant ne peut être noté");
            }
        )
    }


};

module.exports = InscriptionTrajetController;