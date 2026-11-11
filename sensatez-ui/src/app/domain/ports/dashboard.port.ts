import { Observable } from 'rxjs';
import {
  MonthlyDashboardResponse,
  OperationalAlertsResponse,
  OwnerStatementResponse
} from '../models/dashboard.model';

export abstract class DashboardPort {
  abstract getMonthlySummary(year?: number, month?: number): Observable<MonthlyDashboardResponse>;
  abstract getOwnerStatement(ownerId: string, year?: number, month?: number): Observable<OwnerStatementResponse>;
  abstract getAlerts(): Observable<OperationalAlertsResponse>;
}

