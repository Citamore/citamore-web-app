// src/app/shared/constants.ts

export const API_CONSTANTS = {
  BUSINESS: {
    ADD_OR_EDIT: '/business',
    GET_ALL: '/business',
    GET_ONE: (id: string) => `/business/${id}`,
    DELETE: (id: string) => `/business/${id}`,
  },
  OPENING_HOURS: {
    ADD_OR_EDIT: '/opening-hours',
    GET: (businessId: string) => `/opening-hours/${businessId}`,
  },
  CATEGORY: {
    ADD_OR_EDIT: '/category',
    GET_ALL: (businessId: string) => `/category/${businessId}`,
  },
  SERVICE: {
    ADD_OR_EDIT: '/service',
    GET_BY_CATEGORY: (categoryId: string) => `/service/${categoryId}`,
    GET_BY_BUSINESS: (businessId:string) =>`/service/business/${businessId}`,
    GET_BY_SERVICE:(serviceId:string) =>`/getServiceById/${serviceId}`,
  },
  PROFESSIONAL: {
    ADD_OR_EDIT: '/professional',
    GET_ONE: (id: string) => `/professional/${id}`,
    GET_ALL_BY_BUSINESS: (businessId: string) => `/professionals/business/${businessId}`,
    GET_BY_SERVICE:(serviceId: string) => `/getProfessionals/${serviceId}`
  },
  PROFESSIONAL_SCHEDULE: {
    ADD_OR_EDIT: '/professional-schedule',
    GET_ONE: (id: string) => `/professional-schedule/${id}`,
    GET_ALL: '/professional-schedule',
  },
  DAYS_OFF: {
    ADD: '/days-off',
    EDIT: '/days-off/edit',
    DELETE: (id: string) => `/days-off/${id}`,
    GET_ONE: (id: string) => `/days-off/${id}`,
    GET_ALL: '/days-off',
  },
  BOOKED_SLOT: {
    ADD: '/booked-slot',
    EDIT: '/booked-slot/edit',
    DELETE: (id: string) => `/booked-slot/${id}`,
    GET_ONE: (id: string) => `/booked-slot/${id}`,
    GET_ALL: '/booked-slot',
  },
  MAPS:{
    DISTANCE:'/distance',
    ADDRESS:'/searchAddress',
    ADDRESS_DETAILS:'/placeDetails'
  },
  BOOKING:{
     ADDEDITBOOKING:'/booking',
     GET_ALL_BOOKINGS: (businessId: string) => `/bookings/business/${businessId}`,
  },
  PAYMENTS:{},
  CUSTOMER:{
    GET_CUSTOMER_BY_BUSINESS: (businessId: string) => `/customers/business/${businessId}`,
    ADD_CUSTOMER:'/customers',
    EDIT_CUSTOMER:`/customers`,
    BULK_ADD:'/customers/bulkAdd',
    DELETE_CUSTOMER: (customerId: string) => `/customers/${customerId}`
  }
};

  // common.constants.ts

export const TIME_INTERVALS = [
    '12:00 AM', '12:15 AM', '12:30 AM', '12:45 AM',
    '1:00 AM', '1:15 AM', '1:30 AM', '1:45 AM',
    '2:00 AM', '2:15 AM', '2:30 AM', '2:45 AM',
    '3:00 AM', '3:15 AM', '3:30 AM', '3:45 AM',
    '4:00 AM', '4:15 AM', '4:30 AM', '4:45 AM',
    '5:00 AM', '5:15 AM', '5:30 AM', '5:45 AM',
    '6:00 AM', '6:15 AM', '6:30 AM', '6:45 AM',
    '7:00 AM', '7:15 AM', '7:30 AM', '7:45 AM',
    '8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM',
    '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  ];
  

  export const COUNTRY_CODES = [
    { code: "+1", name: "United States", flag: "https://flagcdn.com/w40/us.png" },
    { code: "+91", name: "India", flag: "https://flagcdn.com/w40/in.png" },
    { code: "+44", name: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
    { code: "+61", name: "Australia", flag: "https://flagcdn.com/w40/au.png" },
    { code: "+81", name: "Japan", flag: "https://flagcdn.com/w40/jp.png" },
    // **Continuously updated list of countries with ISO 3166-1 codes:**
    { code: "+49", name: "Germany", flag: "https://flagcdn.com/w40/de.png" },
    { code: "+33", name: "France", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "+86", name: "China", flag: "https://flagcdn.com/w40/cn.png" },
    { code: "+7", name: "Russia", flag: "https://flagcdn.com/w40/ru.png" },
    { code: "+55", name: "Brazil", flag: "https://flagcdn.com/w40/br.png" },
    { code: "+27", name: "South Africa", flag: "https://flagcdn.com/w40/za.png" },
    { code: "+1", name: "Canada", flag: "https://flagcdn.com/w40/ca.png" },
    { code: "+64", name: "New Zealand", flag: "https://flagcdn.com/w40/nz.png" },
    { code: "+20", name: "Egypt", flag: "https://flagcdn.com/w40/eg.png" },
    { code: "+43", name: "Austria", flag: "https://flagcdn.com/w40/at.png" },
    { code: "+34", name: "Spain", flag: "https://flagcdn.com/w40/es.png" },
    { code: "+39", name: "Italy", flag: "https://flagcdn.com/w40/it.png" },
    { code: "+82", name: "South Korea", flag: "https://flagcdn.com/w40/kr.png" },
    { code: "+52", name: "Mexico", flag: "https://flagcdn.com/w40/mx.png" },
    { code: "+62", name: "Indonesia", flag: "https://flagcdn.com/w40/id.png" },
    { code: "+48", name: "Poland", flag: "https://flagcdn.com/w40/pl.png" },
    { code: "+54", name: "Argentina", flag: "https://flagcdn.com/w40/ar.png" },
    { code: "+41", name: "Switzerland", flag: "https://flagcdn.com/w40/ch.png" },
    { code: "+57", name: "Colombia", flag: "https://flagcdn.com/w40/co.png" },
    { code: "+46", name: "Sweden", flag: "https://flagcdn.com/w40/se.  png" },
    { code: "+45", name: "Denmark", flag: "https://flagcdn.com/w40/dk.png" },
    { code: "+358", name: "Finland", flag: "https://flagcdn.com/w40/fi.png" },
    { code: "+31", name: "Netherlands", flag: "https://flagcdn.com/w40/nl.png" },
    { code: "+30", name: "Greece", flag: "https://flagcdn.com/w40/gr.png" }
  ]