import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripletVisualizationService {

  private readonly baseUrl;
  private readonly serviceUrl

  constructor(@Inject('ENVIRONMENT') environment: any,
              private httpClient: HttpClient
  ) {
    this.baseUrl = environment.BackEndApi;
    this.serviceUrl = environment.Endpoints;
  }

  findAvailableCPs(dto: any): Observable<Object> {
    const base = this.baseUrl + this.serviceUrl.tripletVisualization.findAvailableCPs;
    const asParam = '?' + this.serviceUrl.tripletVisualization.findAsNumber + dto.asNumber;
    return this.httpClient.get(base + asParam);
  }

  findTriplets(dto: any): Observable<Object> {
    console.log(dto)
    const base = this.baseUrl + this.serviceUrl.tripletVisualization.findTriplets;
    const asParam = '?' + this.serviceUrl.tripletVisualization.findAsNumber + dto.asNumber;
    const peerASParam = '&' + this.serviceUrl.tripletVisualization.findPeerAS + dto.peerAS;
    const queryFamilyParam = '&' + this.serviceUrl.tripletVisualization.findQueryFamily + dto.queryFamily;
    const ipParam = '&' + this.serviceUrl.tripletVisualization.findIPNumber + dto.peerIP;
    if(dto.queryFamily !== '' && dto.queryFamily != null) {
      return this.httpClient.get(base + asParam + peerASParam + queryFamilyParam + ipParam);
    }else{
      return this.httpClient.get(base + asParam + peerASParam + ipParam);
    }
  }
}
