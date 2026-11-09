import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CalendarMonthResponse,
  OverdueSummaryResponse,
  PayChargeRequest,
  RentChargeDetailResponse,
  TransferToOwnerRequest,
  UpdateChargeNotesRequest
} from '../../domain/models/rent-charge.model';
import { ChargeRepository } from '../../domain/repositories/charge.repository';

@Injectable({ providedIn: 'root' })
export class HttpChargeRepository extends ChargeRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/charges`;

  override getCalendarMonth(year?: number, month?: number): Observable<CalendarMonthResponse> {
    let httpParams = new HttpParams();
    if (year !== undefined) httpParams = httpParams.set('year', year);
    if (month !== undefined) httpParams = httpParams.set('month', month);
    return this.http.get<CalendarMonthResponse>(`${this.baseUrl}/calendar`, { params: httpParams });
  }

  override getById(id: string): Observable<RentChargeDetailResponse> {
    return this.http.get<RentChargeDetailResponse>(`${this.baseUrl}/${id}`);
  }

  override pay(id: string, request: PayChargeRequest): Observable<RentChargeDetailResponse> {
    return this.http.post<RentChargeDetailResponse>(`${this.baseUrl}/${id}/pay`, request);
  }

  override transferToOwner(id: string, request: TransferToOwnerRequest): Observable<RentChargeDetailResponse> {
    return this.http.post<RentChargeDetailResponse>(`${this.baseUrl}/${id}/transfer-to-owner`, request);
  }

  override getOverdue(): Observable<OverdueSummaryResponse> {
    return this.http.get<OverdueSummaryResponse>(`${this.baseUrl}/overdue`);
  }

  override updateNotes(id: string, request: UpdateChargeNotesRequest): Observable<RentChargeDetailResponse> {
    return this.http.patch<RentChargeDetailResponse>(`${this.baseUrl}/${id}/notes`, request);
  }
}

