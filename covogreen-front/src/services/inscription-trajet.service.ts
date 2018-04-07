/**
 *  Auteur : Mohamed El Karmoudi & Romain Lembo
*/
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {AuthRequest} from "./authrequest.service";
import {InscriptionJourney} from "../class/inscriptionJourney";

@Injectable()
export class InscriptionTrajetService {

    private uri;

    constructor(
        private http: Http,
        private authRequest: AuthRequest
    ) {
        this.uri = 'http://localhost:1313/';
    }

    // Effectue une requete vers le serveur pour inscrire un user à l'offre.
    inscription(idTrajet: number): Observable<any> {
        let jsonData = {
            'idTrajet' : idTrajet
        };

        return this.http.post(this.uri + 'inscriptionTrajet', jsonData, this.authRequest.requestOptions)
            .map((response: Response) => {
            return response.json();
        });
    }

    // Effectue une requete vers le serveur pour vérifier qu'un user est inscrit ou pas.
    verifInscription(idTrajet: number): Observable<any> {
        return this.http.get(this.uri + 'inscriptionTrajet/verif/' + idTrajet, this.authRequest.requestOptions);
    }

    /*verifInscription(idTrajet: number): Observable<any> {
        let jsonData = {
            'idTrajet' : idTrajet
        };

        return this.http.post(this.uri + 'inscriptionTrajet/verif', jsonData, this.authRequest.requestOptions).map((response: Response) => {
            return response.json();
        });
    }*/

    // Effectue une requete vers le serveur pour désinscrire un user à l'offre.
    desinscriptionTrajet(idTrajet: number): Observable<any> {
        let jsonData = {
            'idTrajet' : idTrajet
        };

        return this.http.post(this.uri + 'desinscriptionTrajet', jsonData, this.authRequest.requestOptions).map((response: Response) => {
            return response.json();
        });
    }

    /**
     * Method for getting inscriptionjourney data.
     * @returns {Observable<InscriptionJourney>}
     */
    getInscriptionJourneyByJourneyAndUser (id_journey: number): Observable<InscriptionJourney> {
        return this.http.get(this.uri + 'inscriptionTrajet/byjourneyuser/' + id_journey, this.authRequest.requestOptions)
            .map((response: Response) => {
                let result = response.text();
                return JSON.parse(result);
            });
    }
}
