/*
    Auteur : Mohamed El Karmoudi
*/
import { Component, OnInit, Input  } from '@angular/core';
import {InscriptionTrajetService} from '../../services/inscription-trajet.service';
import {Response} from '@angular/http';
import {TrajetEnt} from "../../class/TrajetEnt";
import {JourneyService} from "../../services/journey.service";
import {isBoolean} from "util";

@Component({
  selector: 'app-bouton-inscription',
  templateUrl: './bouton-inscription.component.html',
  styleUrls: ['./bouton-inscription.component.css'],
  providers: [InscriptionTrajetService]
})
export class BoutonInscriptionComponent implements OnInit {
  	@Input() idTrajet: number;
  	inscrit: boolean;
  	messages: string[];
  	is_creator: boolean;

  	@Input() offre: TrajetEnt;

  	constructor(
  	    private inscriptionService: InscriptionTrajetService,
        private journeyService: JourneyService
    ) { }

	ngOnInit() {
  		this.verifUserInscription();
  		this.isCreatorOfJourney();
  	}

  	/**
  	*	Envoi une requete vers le backend pour inscrire l'utilisateur connecté au trajet X
  	*/
  	inscriptionTrajet(){
	  	// requete vers le back pour s'inscrire au trajet X
  		this.inscriptionService.inscription(this.idTrajet).subscribe((res: Response) => { // on récupère la réponse.
        	// on vérifie la variable success
			if(res["success"] === true){
                this.inscrit = true;
                // On modifie le nombre de place.
                this.offre.nombre_place_disponible--;
			}else{
				this.messages = res["message"];
			}
    	});
  	}

  	/**
  	*	Envoi une requete vers le backend pour desinscrire l'utilisateur connecté au trajet X
  	*/
  	desinscriptionTrajet(){
  		// requete vers le back pour se désinscrire au trajet x
  		this.inscriptionService.desinscriptionTrajet(this.idTrajet).subscribe((res: Response) => { // on récupère la réponse.// on vérifie la variable success
            if(res["success"] === true){
                this.inscrit = false;
                // On modifie le nombre de place.
                this.offre.nombre_place_disponible++;
            }else{
                this.messages = res["message"];
            }
    	});
	}


  	/**
  	*	Envoi une requete vers le backend pour déterminer si l'utilisateur X est inscrit au trajet Y.
  	*/
    verifUserInscription(){
        this.inscriptionService.verifInscription(this.idTrajet)
            .subscribe( (res: Response) => {
                this.inscrit = (res["success"] === false) ? true : false ;
            });
    }

    /**
     * @author Romain Lembo
     * Evite au créateur de l'offre de s'inscrire ou se désinscrire du trajet
     */
    isCreatorOfJourney() {
        this.journeyService.isCreatorOfJourney(this.idTrajet)
            .subscribe( result => {
                console.log('isCreatorOfJourney : ', result);
                this.is_creator = result;
            });
    }
}
