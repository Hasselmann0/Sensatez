import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MonthlyDashboardResponse,
  OperationalAlertsResponse,
  OwnerStatementResponse
} from '../../domain/models/dashboard.model';
import { DashboardRepository } from '../../domain/repositories/dashboard.repository';

@Injectable({ providedIn: 'root' })
export class HttpDashboardRepository extends DashboardRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  override getMonthlySummary(year?: number, month?: number): Observable<MonthlyDashboardResponse> {
    let httpParams = new HttpParams();
    if (year !== undefined) httpParams = httpParams.set('year', year);
    if (month !== undefined) httpParams = httpParams.set('month', month);
    return this.http.get<MonthlyDashboardResponse>(`${this.baseUrl}/summary`, { params: httpParams });
  }

  override getOwnerStatement(ownerId: string, year?: number, month?: number): Observable<OwnerStatementResponse> {
    let httpParams = new HttpParams();
    if (year !== undefined) httpParams = httpParams.set('year', year);
    if (month !== undefined) httpParams = httpParams.set('month', month);
    return this.http.get<OwnerStatementResponse>(`${this.baseUrl}/owner-statement/${ownerId}`, {
      params: httpParams
    });
  }

  override getAlerts(): Observable<OperationalAlertsResponse> {
    return this.http.get<OperationalAlertsResponse>(`${this.baseUrl}/alerts`);
  }
}

