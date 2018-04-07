var Journey = require("../database/models/journey");
var InscriptionJourney = require("../database/models/inscriptionJourney");
var sequelize = require("../database/db");
var authToken = require("./tools/authToken");
var co = require('co');
var jwt = require('jsonwebtoken');

/**
 * @author Romain Lembo
 * @type {{create: JourneyController.create, getJourneysByUser: JourneyController.getJourneysByUser, getJourneysByID: JourneyController.getJourneysByID, isDriverThisJourney: JourneyController.isDriverThisJourney}}
 * FR: Couche contrôleur de l'entité Journey.
 * ENG: Controller layer of Journey Entity.
 */
var JourneyController = {

    /**
     * FR: Pour créer un nouveau trajet.
     * ENG: For creating a new journey.
     * Creation of a journey
     * @param req
     * @param res
     */
    create: function (req, res) {

        var userToken = authToken.getToken(req);

        if (!userToken.revoked)
        {
            Journey.create({
                origin: req.body.origin,
                destination: req.body.destination,
                seats_available: req.body.seats_available,
                date_journey: req.body.date_journey,
                id_driver: userToken.id_user
            })
            .then(function (response) {

                var inscriptionJourney = {
                    id_user: response.dataValues.id_driver,
                    id_trajet: response.dataValues.id_journey
                };
                InscriptionJourney.create(inscriptionJourney);

                res.status(200).send('Trajet ajouté');
            })
            .catch(function (error) {
                console.log('create error : ', error);
                res.status(500).json(error);
            });
        }
        else res.status(500).send("Compte bloqué !");
    },

    /**
     * FR: Pour récupérer tous les trajets non passé.
     * ENG: Gettings all journeys not happened.
     * @param req
     * @param res
     */
    getJourneys: function (req, res) {

        var result = [];

        Journey.findAll()
            .then(function (response) {

                var journey = null;
                var user = null;

                var journey = {
                    id: response.id_journey,
                    id_driver: driver.id_user,
                    depart: journeyList[i].origin,
                    destination: journeyList[i].destination,
                    auteur: driver.firstName + " " + driver.lastName,
                    date_trajet: journeyList[i].date_journey,
                    nombre_place_disponible: journeyList[i].seats_available
                };

                console.log('getJourneys :', response);
                res.status(200).send(response);
            })
            .catch(function (error) {
                console.log('Fail find for getting journeys :', error);
                res.status(500).send("Echec de la récupération du profil.");
            });

    },

    /**
     * FR: Vérifie si l'utilisateur est le créateur du trajet.
     * ENG: Check if this user is not the creator of journey.
     * @param req
     * @param res
     */
    isCreatorOfJourney: function (req, res) {

        var userToken = authToken.getToken(req);
        var id_journey = req.params.id_journey;

        if(userToken != null)
        {
            Journey.findOne({ where:
                    {
                        id_driver: userToken.id_user,
                        id_journey:  id_journey
                    }
            })
            .then(function (response) {
                var result = false;
                if(response != null) result = true;
                res.status(200).send(result);
            });
        }
        else res.status(200).send(false);

    },

    /**
     * FR: Pour récupérer les données des trajets selon l'utilisateur.
     * ENG: For getting all journeys with id_user.
     * @param req
     * @param res
     */
    getJourneysByUser: function (req, res) {

        var userToken = authToken.getToken(req);
        if (!userToken.revoked)
        {
            sequelize.query(' SELECT j.* ' +
                'FROM inscriptionjourneys ij, journeys j ' +
                'WHERE ij.id_trajet = j.id_journey ' +
                'AND ij.id_user = ' + userToken.id_user +
                ' UNION SELECT * FROM journeys j WHERE id_driver = ' + userToken.id_user
                ,
                {model: Journey}
            )
                .then(function (response) {
                    console.log(response);
                    res.status(200).send(response);
                })
                .catch(function (error) {
                    console.log('Fail find for getting journeys by user :', error);
                    res.status(500).send("Echec de la récupération du profil.");
                });
        }
        else res.status(500).send("Compte bloqué !");
    },


    /**
     * FR: Pour récupérer un trajet selon son id_journey.
     * ENG: For getting all journeys with id_journey.
     * @param req
     * @param res
     */
    getJourneysByID: function (req, res) {

        var id_journey = req.params.id_journey;
        //var userToken = authToken.getToken(req);

        if (!userToken.revoked)
        {
            Journey.findOne({ where: {id_journey: id_journey} })
                .then(function (response) {
                    res.status(200).send(response);
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send("Echec de la récupération des informations sur le trajet.");
                });
        }
        else res.status(500).send("Compte bloqué !");
    },

    /**
     * @author Marvin RAMEIX
     * Getting info of the Journey from the id used in the url
     * @param req
     * @param res
     */
    getJourney: function (req, res) {
        Journey.findById(req.params.id_journey)
            .then(function (response) {
                res.status(200).send(response);
            }).catch(function (error) {
            console.log(error);
            res.status(500).send("Aucun trajet correspondant.");
        });
    },

    /**
     * FR: Pour vérifier si l'utilisateur connecté est le conducteur d'un trajet.
     * ENG: Checking if user with this token it's driver for this journey
     * @param req
     * @param res
     */
    isDriverThisJourney: function  (req, res) {

        var userToken = authToken.getToken(req);
        var journeyReq = req.body;

        if(!userToken.revoked)
        {
            Journey.findById(journeyReq.id_journey)
                .then(function (response) {
                    var journeyRes = response;
                    var result = userToken.id_user === journeyRes.id_driver;

                    res.status(200).send(result);
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send("Echec de la vérification de conducteur.");
                });
        }
        else res.status(500).send("Compte bloqué !");
    },

    /**
     * @author Marvin RAMEIX
     * Deleting journey by id with author check
     * @param req
     * @param res
     */
    delete: function (req, res) {
        var userToken = authToken.getToken(req);
        Journey.findById(req.params.id_journey)
            .then(function (response) {
                if (userToken.id_user === response.dataValues.id_driver) {
                    Journey.destroy({
                        where: {
                            id_journey: response.dataValues.id_journey
                        }
                    }).then(function (resp) {
                        res.status(200).send("Trajet supprimé");
                    }).catch(function (err) {
                        console.log(err);
                        res.status(500).send("Auteur non conducteur.");
                    });
                }
            }).catch(function (error) {
            console.log(error);
            res.status(500).send("Trajet non trouvé.");
        });
    },

    /**
     * @author Marvin RAMEIX
     * Allow to know if the user connected can rate and comment the current journey
     * @param req
     * @param res
     */
    canRateAndComment: function (req, res) {
        var userToken = authToken.getToken(req);
        if(userToken){
            sequelize.query(' SELECT *' +
                'FROM inscriptionjourneys ij, journeys j ' +
                'WHERE ij.id_trajet = j.id_journey ' +
                ' AND ij.id_trajet = '+ req.params.id_journey +
                ' AND ij.id_user ='+ userToken.id_user+
                ' AND ij.id_user NOT IN (SELECT id_driver ' +
                '                       FROM journeys ' +
                '                       WHERE id_journey = '+ req.params.id_journey +')'
            ).then(
                function (value) {
                    if(value !== null){
                        res.status(200).send(true);
                    }
                    else{
                        res.status(200).send(false);
                    }
                }
            ).catch(
                function (reason) {
                    console.log(reason);
                    res.status(500).send("Cet utilisateur ne participe pas au trajet");
                }
            )
        }
        else{
            res.status(400).send("Cet internaute n'est pas inscrit");
        }
    }

};


module.exports = JourneyController;