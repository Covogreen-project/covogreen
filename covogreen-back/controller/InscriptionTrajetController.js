/**
 * Author: Alex Zarzitski
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
   * Exécute la tentative de l'inscription au trajet
   */
  doIt: co.wrap(function * (req, res) {
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
          journey.seats_available = journey.seats_available-1;
          journey.save();

          var test = yield InscriptionTrajetController.checkSubscribe(journey, user);
          if(test == false){
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
  }),

  verif: co.wrap(function * (req, res) {
    req.accepts('application/json');
    // On décode le json
    var token = authToken.getToken(req);
    if(token.revoked)
      res.status(200).send({success: false, message: ["Error Token"]});

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
  }),

  checkSubscribe: co.wrap(function * (journey, user) {
    var condition = { 'where' : { [Op.and] : [{"id_user" : user.id_user}, {"id_trajet" : journey.id_journey}] } };
    var inscriptionJourneyList = yield InscriptionJourney.findAll(condition);
    if(inscriptionJourneyList == null || inscriptionJourneyList.length <= 0 )
      return false;
    else
      return true;
  })


};

module.exports = InscriptionTrajetController;
