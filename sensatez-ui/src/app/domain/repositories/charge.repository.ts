import { Observable } from 'rxjs';
import {
  CalendarMonthResponse,
  OverdueSummaryResponse,
  PayChargeRequest,
  RentChargeDetailResponse,
  TransferToOwnerRequest,
  UpdateChargeNotesRequest
} from '../models/rent-charge.model';

export abstract class ChargeRepository {
  abstract getCalendarMonth(year?: number, month?: number): Observable<CalendarMonthResponse>;
  abstract getById(id: string): Observable<RentChargeDetailResponse>;
  abstract pay(id: string, request: PayChargeRequest): Observable<RentChargeDetailResponse>;
  abstract transferToOwner(id: string, request: TransferToOwnerRequest): Observable<RentChargeDetailResponse>;
  abstract getOverdue(): Observable<OverdueSummaryResponse>;
  abstract updateNotes(id: string, request: UpdateChargeNotesRequest): Observable<RentChargeDetailResponse>;
}

