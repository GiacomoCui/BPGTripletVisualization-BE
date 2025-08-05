import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  findTripletsFromAS(dto: any): Observable<Object> {
    if (dto.queryFamily == 4 || dto.queryFamily == 6) {
      const finalUrl = this.baseUrl + this.serviceUrl.tripletVisualization;
      return this.httpClient.get(finalUrl);
    } else {
      return this.httpClient.get(this.baseUrl + this.serviceUrl.tripletVisualization);
    }
  }
}
