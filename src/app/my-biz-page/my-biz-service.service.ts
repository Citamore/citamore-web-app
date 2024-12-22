import { Injectable } from '@angular/core';
import { API_CONSTANTS } from '../shared/common.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyBizService{
  private readonly BASE_URL = 'http://localhost:5001/business'; // Backend URL
  private readonly BASE_URL_MAPS = 'http://localhost:5001/maps';
  private readonly BASE_URL_BOOKING = 'http://localhost:5001/booking';
  private readonly BASE_URL_CUSTOMERS = 'http://localhost:5001/customer';

  constructor(private http: HttpClient) {}

  // Business APIs
  addOrEditBusiness(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.BUSINESS.ADD_OR_EDIT}`, data);
  }

  getAllBusinesses(): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.BUSINESS.GET_ALL}`);
  }

  getBusinessById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.BUSINESS.GET_ONE(id)}`);
  }

  deleteBusinessById(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${API_CONSTANTS.BUSINESS.DELETE(id)}`);
  }

  // Opening Hours APIs
  addOrEditOpeningHours(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.OPENING_HOURS.ADD_OR_EDIT}`, data);
  }

  getOpeningHours(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.OPENING_HOURS.GET(businessId)}`);
  }

  // Category APIs
  addOrEditCategory(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.CATEGORY.ADD_OR_EDIT}`, data);
  }

  getCategoriesByBusinessId(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.CATEGORY.GET_ALL(businessId)}`);
  }

  // Service APIs
  addOrEditService(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.SERVICE.ADD_OR_EDIT}`, data);
  }

  getServicesByCategoryId(categoryId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.SERVICE.GET_BY_CATEGORY(categoryId)}`);
  }

  getServicesByBusinessId(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.SERVICE.GET_BY_BUSINESS(businessId)}`);
  }

  getServicesByServiceId(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.SERVICE.GET_BY_SERVICE(businessId)}`);
  }

  // Professional APIs
  addOrEditProfessional(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL.ADD_OR_EDIT}`, data);
  }

  getProfessionalById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL.GET_ONE(id)}`);
  }

  getProfessionalByServiceId(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL.GET_BY_SERVICE(id)}`);
  }

  getProfessionalsByBusinessId(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL.GET_ALL_BY_BUSINESS(businessId)}`);
  }

  // Professional Schedule APIs
  addOrEditProfessionalSchedule(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL_SCHEDULE.ADD_OR_EDIT}`, data);
  }

  getProfessionalScheduleById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL_SCHEDULE.GET_ONE(id)}`);
  }

  getAllProfessionalSchedules(): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.PROFESSIONAL_SCHEDULE.GET_ALL}`);
  }

  // Days Off APIs
  addDaysOff(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.DAYS_OFF.ADD}`, data);
  }

  editDaysOff(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.DAYS_OFF.EDIT}`, data);
  }

  deleteDaysOffById(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${API_CONSTANTS.DAYS_OFF.DELETE(id)}`);
  }

  getDaysOffById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.DAYS_OFF.GET_ONE(id)}`);
  }

  getAllDaysOff(): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.DAYS_OFF.GET_ALL}`);
  }

  // Booked Slot APIs
  addBookedSlot(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.BOOKED_SLOT.ADD}`, data);
  }

  editBookedSlot(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}${API_CONSTANTS.BOOKED_SLOT.EDIT}`, data);
  }

  deleteBookedSlotById(id: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}${API_CONSTANTS.BOOKED_SLOT.DELETE(id)}`);
  }

  getBookedSlotById(id: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.BOOKED_SLOT.GET_ONE(id)}`);
  }

  getAllBookedSlots(): Observable<any> {
    return this.http.get(`${this.BASE_URL}${API_CONSTANTS.BOOKED_SLOT.GET_ALL}`);
  }

  getDistance(origin: string, destination: string): Observable<any> {
    const params = {
      origin: origin,
      destination: destination
    };
    return this.http.get<any>(`${this.BASE_URL_MAPS}${API_CONSTANTS.MAPS.DISTANCE}`, { params });
  }

  getSearchedAddress(address: any): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL_MAPS}${API_CONSTANTS.MAPS.ADDRESS}?query=${address.query}`);
  }

  getPlaceDetails(id: any): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL_MAPS}${API_CONSTANTS.MAPS.ADDRESS_DETAILS}?placeId=${id}`);
  }

  getBookings(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL_BOOKING}${API_CONSTANTS.BOOKING.GET_ALL_BOOKINGS(businessId)}`);
  }

  addUpdateBooking(payload:any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL_BOOKING}${API_CONSTANTS.BOOKING.ADDEDITBOOKING}`, payload);
  }

  getCustomersByBusinessId(businessId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL_CUSTOMERS}${API_CONSTANTS.CUSTOMER.GET_CUSTOMER_BY_BUSINESS(businessId)}`);
  }

  addCustomer(payload:any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL_CUSTOMERS}${API_CONSTANTS.CUSTOMER.ADD_CUSTOMER}`, payload);
  }

  addCustomerInBulk(payload:any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL_CUSTOMERS}${API_CONSTANTS.CUSTOMER.BULK_ADD}`, payload);
  }


  editCustomer(customer_id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL_CUSTOMERS}${API_CONSTANTS.CUSTOMER.EDIT_CUSTOMER}/${customer_id}`, payload);
  }
  
  deleteCustomer(customerid: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL_CUSTOMERS}${API_CONSTANTS.CUSTOMER.DELETE_CUSTOMER(customerid)}`);
  }

}