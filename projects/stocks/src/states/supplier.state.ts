import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {SupplierModel} from '../models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierState {
  selectedForEdit: BehaviorSubject<SupplierModel> = new BehaviorSubject<SupplierModel>(null);
}
