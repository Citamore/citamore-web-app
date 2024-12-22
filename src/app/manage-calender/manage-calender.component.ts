import { Component, HostListener, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import handleEventDropPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format } from 'date-fns';
import { MyBizService } from '../my-biz-page/my-biz-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-manage-calender',
  templateUrl: './manage-calender.component.html',
  styleUrls: ['./manage-calender.component.scss'],
  standalone: false
})
export class ManageCalenderComponent implements OnInit {
  calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, handleEventDropPlugin];
  calendarOptions: any;
  events: any[] = []; // Reactive array for events
  showPopup: boolean = false;
  dropdownTypeOpen: boolean = false;
  selectedCategory: string | null = null; // Store the selected category
  editingField: any = {};
  popupData: any = {
    appointmentType: 'Service',
    eventName: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    repeats: '',
    guests: '',
    location: '',
    notes: '',
    staff: ''
  };
  repeatOptions: string[] = [
    'Daily',
    'Weekly',
    'Every 2 Weeks',
    'Every 3 Weeks',
    'Monthly',
    'Annually',
    'Custom',
  ];

  chooseAppointmentType: string[] = [
    'Service',
    'Class',
    'Event',
    'Reminder',
    'Blocked Time'
  ];

  timeSlots: string[] = [];
  daysOfWeek = [
    { start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
  ];

  existingLocations: string[] = ['283 Duke St', '123 Main St'];  // Preloaded locations
  searchedLocations: { description: string }[] = []; 
  querySubject = new Subject<string>(); // Subject for debounce search
  selectedLocation: string = ''; // Selected location
  dropdownLocationOpen: boolean = false; 
  guests: any[] = []; // Full list of guests from the API
  filteredGuests: any[] = []; // Filtered list based on search input
  services: any[] = [];
  selectedService: any;
  dropdownServiceOpen: boolean = false;
  staff: any[] = [];
  dropdownStaffOpen: boolean = false;
  selectedStaff: any = null; // Selected staff member
  staffList: any[] = []; // List of staff fetched based on service
  selectedGuest: any;
  serviceDuration: any;
  
  constructor(private myBizService: MyBizService, private snackBar: MatSnackBar) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek', // Add agenda view (listWeek)
      },
      initialView: 'timeGridWeek', // Default view
      views: {
        listWeek: {
          buttonText: 'Agenda', // Custom button text for agenda view
          displayEventTime: true, // Show event time in the list
          displayEventEnd: true, // Show event end time
        },
      },
      slotDuration: '00:15:00', // 15-minute intervals
      slotLabelInterval: '01:00:00', // Labels for every hour
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: 'short',
      },
      slotMinTime: '00:00:00', // Start of the day
      slotMaxTime: '23:59:59', // End of the day
      allDaySlot: false, // Remove "All Day" slot
      editable: true,
      events: this.events,
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDrop: this.handleEventDrop.bind(this),
    };
    this.getBookings();
    this.generateTimeSlots();
    this.querySubject.pipe(
      debounceTime(300), // Delay by 300ms
      distinctUntilChanged(), // Avoid duplicate queries
      switchMap(query => this.myBizService.getSearchedAddress(query)) // Call the API
    ).subscribe(
      (results: any) => {
        this.searchedLocations = results; // Assign fetched results
      },
      (error) => console.error('Error fetching locations:', error)
    );
  }
  ngOnInit() {
    if (!this.popupData.appointmentType) {
      this.popupData.appointmentType = 'Service'; // Default value
    }

    this.fetchGuests();
  }

  // Fetch all guests from the API
  fetchGuests() {
    this.myBizService.getCustomersByBusinessId('BUS123').subscribe((response: any[]) => {
      this.guests = response;
    });
  }

  showExistingLocations(): void {
    this.dropdownLocationOpen = true; // Open the dropdown
    this.searchedLocations = []; // Clear any previously searched results
  }

  // Filter guests based on the input
  onGuestSearch(query: string) {
    if (!query) {
      this.filteredGuests = [];
      return;
    }
    const lowerQuery = query.toLowerCase();
    this.filteredGuests = this.guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(lowerQuery) ||
        guest.email.toLowerCase().includes(lowerQuery) ||
        guest.phone.toLowerCase().includes(lowerQuery)
    );
  }

  // Handle guest selection
  selectGuest(guest: any) {
    this.selectedGuest = guest;
    this.popupData.guests = guest.name; // Assign selected guest name to the input
    this.editingField.guests = false; // Close the input
    this.filteredGuests = []; // Clear suggestions
  }

  // Get initials for guests without images
  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  // Show all guests when input is focused
  showAllGuests() {
    this.filteredGuests = [...this.guests]; // Display all guests on focus
  }

  getBookings() {
    this.myBizService.getBookings('BUS123').subscribe((response: any) => {
      const colors = ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#66c2a5'];
  
      // Map bookings to promises resolving with detailed bookings
      const bookingsWithDetails = response.bookings.map(async (booking: any, index: any) => {
        try {
          const serviceName = await this.fetchServiceName(booking.service_id);
          const professionalName = await this.fetchProfessionalName(booking.professional_id);
  
          // Parse booking_date to ensure it's a valid date string
          const bookingDate = new Date(booking.booking_date.split('T')[0]); // Use only the date part
          const startTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${booking.start_time}`).toISOString();
          const endTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${booking.end_time}`).toISOString();
  
          return {
            id: booking.booking_id,
            professional_id: booking.professional_id,
            title: `${serviceName} with ${professionalName}`,
            start: startTime, // Proper ISO format
            end: endTime, // Proper ISO format
            backgroundColor: colors[index % colors.length],
            extendedProps: {
              customer_id: booking.customer_id,
              booking_id: booking.booking_id,
              business_Id: booking.business_id,
              professional_id: booking.professional_id,
              service_id: booking.service_id,
              guests: booking.guests,
              location: booking.location,
              notes: booking.notes,
              status: booking.status,
              platform: booking.platform,
            },
          };
        } catch (error) {
          console.error(`Error fetching details for booking ${booking.booking_id}:`, error, {
            bookingDate: booking.booking_date,
            startTime: booking.start_time,
            endTime: booking.end_time,
          });
          return null; // Return null for failed fetches
        }
      });
  
      // Wait for all promises to resolve
      Promise.all(bookingsWithDetails).then((detailedBookings) => {
        // Filter out any null values due to failed fetches
        this.events = detailedBookings.filter((booking) => booking !== null);
  
        // Update FullCalendar with the transformed events
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.events,
          eventContent: function (arg:any) {
            const title = document.createElement('div');
            title.className = 'fc-event-title';
            title.innerText = arg.event.title;
        
            const customerName = document.createElement('div');
            customerName.className = 'fc-event-customer';
            customerName.innerText = 'Client : ' + arg.event.extendedProps.guests;
        
            const content = document.createElement('div');
            content.appendChild(title);
            content.appendChild(customerName);
        
            return { domNodes: [content] };
          },
        };
        console.log('Updated Events:', this.calendarOptions.events);
      });
    });
  }
  
  // Fetch service name by ID
  fetchServiceName(serviceId: string): Promise<string> {
    return this.myBizService.getServicesByServiceId(serviceId).toPromise().then(
      (response: any) => response[0]?.name || 'Unknown Service',
      (error) => {
        console.error(`Error fetching service name for ID ${serviceId}:`, error);
        throw error;
      }
    );
  }
  
  // Fetch professional name by ID
  fetchProfessionalName(professionalId: string): Promise<string> {
    return this.myBizService.getProfessionalById(professionalId).toPromise().then(
      (response: any) => response.professional?.name || 'Unknown Professional',
      (error) => {
        console.error(`Error fetching professional name for ID ${professionalId}:`, error);
        throw error;
      }
    );
  }
  
  

  // Open the popup
  handleSlotClick(arg: any) {
    this.popupData.date = arg.dateStr;
    this.popupData.time = new Date(arg.dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.popupData.appointmentType = this.popupData.appointmentType || 'Service'; // Ensure Service is set
    this.showPopup = true;
  }

  handleEventDrop(arg: any) {
    const updatedEvent = {
      booking_id: arg.event.id,
      professional_id: arg.event.extendedProps.professional_id,
      customer_Id: arg.event.extendedProps.customer_Id,
      business_Id: arg.event.extendedProps.business_Id,
      booking_date: arg.event.start.toISOString().split('T')[0],
      start_time: arg.event.start.toTimeString().split(' ')[0].slice(0, 5),
      end_time: arg.event.end.toTimeString().split(' ')[0].slice(0, 5),
    };

    this.myBizService.addUpdateBooking(updatedEvent).subscribe(
      (response: any) => {
        if (response.success) {
          this.snackBar.open('Booking Changed to ' + updatedEvent.booking_date + ' from '
            + updatedEvent.start_time + ' to ' + updatedEvent.end_time + ' for Booking ID :' + updatedEvent.booking_id, '', {
            duration: 3000,  // Snackbar will disappear after 3 seconds
            panelClass: ['custom-snackbar']  // Updated class name
          });
          this.getBookings(); // Refresh bookings to reflect the change
        } else {
          console.error(response.error);
        }
      },
      (error) => console.error('Error updating booking:', error)
    );
  }


  onLocationInputChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
  
    if (query.trim() === '') {
      this.searchedLocations = []; // Clear searched locations if input is empty
      return;
    }
  
    this.getLocations(query);
  }

  getLocations(query: string): void {
    this.myBizService.getSearchedAddress({ query }).subscribe(
      (locations) => {
        this.searchedLocations = locations; // Assign the API results to `searchedLocations`
      },
      (error) => {
        console.error('Error fetching locations:', error);
      }
    );
  }

  showLocationDropdown(): void {
    this.dropdownLocationOpen = true; // Open the dropdown
  }

  selectLocation(location: string): void {
    this.popupData.location = location; // Update the selected location
    this.dropdownLocationOpen = false; // Close the dropdown
  }
  // Toggle editing mode for fields
  editField(field: string) {
    this.editingField = { [field]: true };
  }

  formatPlaceholder(field: string): string {
    const placeholders: any = {
      repeats: 'Does not repeat',
      guests: 'Add guest(s)',
      location: 'Add location',
      notes: 'Notes to provider and guest(s)'
    };
    return placeholders[field] || 'Add info';
  }

  saveField(field: string): void {
    this.editingField[field] = false;
  }

  onDateSelected(selectedDate: Date): void {
    this.popupData.date = selectedDate.toISOString().split('T')[0];
    this.saveField('date'); // Close the dropdown
  }

  handleDateClick(arg: any) {
    const selectedDate = new Date(arg.dateStr);
    const startTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    this.popupData.date = selectedDate;
    // Add 15 minutes to the start time for the end time
    const endTime = new Date(selectedDate.getTime() + 15 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Update the daysOfWeek array with the new start and end times
    this.daysOfWeek = [
      { start: startTime, end: endTime, dropdownOpen: { start: false, end: false } },
    ];

    this.myBizService.getServicesByBusinessId('BUS123').subscribe(
      (services: any[]) => {
        // Update the services dynamically
        this.services = services.filter((s) => s.is_hidden === 0);
      },
      (error) => {
        console.error('Error fetching services:', error);
      }
    );
    //this.resetPopupData();
    // Optionally show a popup or perform additional logic
    this.showPopup = true;
  }

  getIconForField(field: string): string {
    const icons: { [key: string]: string } = {
      guests: 'group', // Material icon for 'Guests'
      location: 'location_on', // Material icon for 'Location'
      notes: 'edit_note', // Material icon for 'Notes'
    };
    return icons[field] || 'info'; // Fallback icon
  }


  handleEventClick(arg: any) {
    const selectedDate = arg.event.start;
    const startTime = this.formatToTimeString(selectedDate);
    const endTime = this.formatToTimeString(arg.event.end);

    this.popupData = {
      booking_id: arg.event.extendedProps.booking_id,
      eventName: arg.event.title || 'New Event',
      date: selectedDate.toISOString().split('T')[0],
      time: startTime,
      repeats: arg.event.extendedProps?.repeats || 'Does not repeat',
      guests: arg.event.extendedProps?.guests || '',
      location: arg.event.extendedProps?.location || '',
      notes: arg.event.extendedProps?.notes || '',
      appointmentType: 'Service',
      staff: ''
    };

    this.daysOfWeek = [
      { start: startTime, end: endTime, dropdownOpen: { start: false, end: false } },
    ];

    this.showPopup = true;
  }

  // Utility function to format date as "HH:MM AM/PM"
  formatToTimeString(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  ngAfterViewInit() {
    // Populate the calendar slots after the view has rendered
    setTimeout(() => this.populateCalendarSlots(), 0);
  }

  highlightTodayCell(info: any) {
    const today = new Date().toISOString().split('T')[0];
    if (info.date.toISOString().split('T')[0] === today) {
      info.el.style.backgroundColor = 'lightgrey'; // Highlight today
    }
  }

  populateCalendarSlots() {
    // Select all <td> elements with the "fc-timegrid-slot-lane" class and a "data-time" attribute
    const laneSlots = document.querySelectorAll('.fc-timegrid-slot-lane[data-time]');

    // Get column width and calculate left values for each day
    const columnElements = document.querySelectorAll('.fc-col-header-cell');
    const columnWidth = columnElements[0]?.getBoundingClientRect().width || 0; // Get width of the first column
    const days = columnElements.length; // Total number of days in the week view

    // Repeat the slots for each day
    for (let day = 0; day < days; day++) {
      const leftPosition = 2 + day * columnWidth; // Calculate left position for each day

      laneSlots.forEach((slot) => {
        const element = slot as HTMLElement; // Explicitly cast to HTMLElement
        const time = element.getAttribute('data-time'); // Get the "data-time" value

        if (time) {
          const formattedTime = this.formatTimeObject(time); // Format time (e.g., 14:30:00 → 2:30 PM)

          // Create the slot-hover div dynamically for each slot
          const hoverDiv = document.createElement('div');
          hoverDiv.className = 'slot-hover absolute z-10 rounded-4px h-full';
          hoverDiv.style.width = `${columnWidth - 5}px`; // Set the width dynamically
          hoverDiv.style.left = `${leftPosition}px`; // Set the left position dynamically
          hoverDiv.style.border = '1px solid transparent'; // Initial transparent border
          hoverDiv.style.transition = 'border-color 0.3s ease-in-out'; // Smooth hover effect
          hoverDiv.style.opacity = "0";
          hoverDiv.innerHTML = `
            <div id="eventID_undefined" data-testid="calendar-slot-card" class="event-card">
              <div class="event-card-body gap-x-1 flex flex-col flex-wrap">
                <div class="event-card-subheading flex items-center">
                  <div class="time-stamp awd-text--xs awd-tc-grey--600 flex items-baseline clip-exceed-text" data-testid="event-card-timestamp">
                    <div class="start-time" data-testid="event-card-start-time" style="cursor: pointer;">
                      <span class="hour-wrapper">${formattedTime.hour}</span>
                      <span class="separator-wrapper">:</span>
                      <span class="minute-wrapper">${formattedTime.minute}</span>
                      <span class="awd-text--xxs meridiem-wrapper">${formattedTime.meridiem}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;

          // Append the slot-hover div to the current slot
          element.appendChild(hoverDiv);

          // Add hover effect to the slot-hover element
          hoverDiv.addEventListener('mouseenter', () => {
            hoverDiv.style.opacity = "1";
          });

          hoverDiv.addEventListener('mouseleave', () => {
            hoverDiv.style.borderColor = 'transparent'; // Remove hover border
            hoverDiv.style.opacity = "0";
          });
        }
      });
    }
  }

  formatTimeObject(time: string) {
    const [hour, minute] = time.split(':');
    const isPM = parseInt(hour) >= 12;
    const formattedHour = (parseInt(hour) % 12) || 12;
    return {
      hour: formattedHour,
      minute: minute,
      meridiem: isPM ? 'PM' : 'AM',
    };
  }

  toggleDropdownCategory() {
    this.dropdownTypeOpen = !this.dropdownTypeOpen;
  }


  toggleStaffDropdown() {
    this.dropdownStaffOpen = !this.dropdownStaffOpen;
  }

  selectStaff(staff: any) {
    this.selectedStaff = staff;
    this.dropdownStaffOpen = false; // Close the dropdown after selection
  }

  // Toggle service dropdown
  toggleServiceDropdown() {
    this.dropdownServiceOpen = !this.dropdownServiceOpen;
  }
  // Select a category from the dropdown
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.dropdownTypeOpen = false; // Close the dropdown after selection
  }


  // Close the popup
  closePopup() {
    this.showPopup = false;
  }

  toggleDropdown(): void {
    this.editingField.repeats = !this.editingField.repeats;
  }

  selectRepeatOption(option: string): void {
    this.popupData.repeats = option;
    this.toggleDropdown(); // Close dropdown after selection
  }

  selectAppointmentType(type: string) {
    this.popupData.appointmentType = type;
    this.dropdownTypeOpen = false; // Close the dropdown
    // this.resetPopupData(); // Reset fields based on the new type
  }

  // Listen for clicks outside the calendar
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
  
    const isInsideDropdown =
      targetElement.closest('.dropdown-calendar') || // Calendar dropdown
      targetElement.closest('.popup-label') || // Label that triggers dropdown
      targetElement.closest('.time-dropdown-open') || // Time dropdown
      targetElement.closest('.popup-info-item'); // Repeat dropdown
  
    if (!isInsideDropdown) {
      this.editingField.date = false; // Close date dropdown
      this.editingField.repeats = false; // Close repeat dropdown
      this.daysOfWeek.forEach((day) => {
        day.dropdownOpen.start = false;
        day.dropdownOpen.end = false;
      }); // Close all time dropdowns
    }
  }

  // Generate 15-minute time slots for 24 hours
  generateTimeSlots(): void {
    for (let i = 0; i < 24 * 60; i += 15) {
      const hours = Math.floor(i / 60).toString().padStart(2, '0');
      const minutes = (i % 60).toString().padStart(2, '0');
      this.timeSlots.push(`${hours}:${minutes}`);
    }
  }

  toggleStartEndDropdown(type: 'start' | 'end', open: boolean, day: any) {
    // Close all dropdowns for all days
    this.daysOfWeek.forEach(d => {
      if (d !== day) {
        d.dropdownOpen.start = false;
        d.dropdownOpen.end = false;
      }
    });

    // Close the other dropdown if it's open for the selected day
    if (type === 'start') {
      day.dropdownOpen.end = false; // Close the end dropdown
    } else {
      day.dropdownOpen.start = false; // Close the start dropdown
    }

    // Open or close the clicked dropdown
    day.dropdownOpen[type] = open;
  }
 

  selectService(service: any) {
    this.selectedService = service; // Set the selected service
    this.serviceDuration = service.duration; // Set the service duration in minutes
    this.popupData.serviceId = service.id; // Save the service ID in popupData
  
    // Update the `end` time based on `start` time and service duration
    const startParts = this.formatTimeTo24(this.daysOfWeek[0].start).split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);
    
    const endDate = new Date(startDate.getTime() + this.serviceDuration * 60 * 1000);
    const formattedEndTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    this.daysOfWeek[0].end = formattedEndTime; // Update the end time dynamically
  
    // Fetch professionals related to the selected service
    this.myBizService.getProfessionalByServiceId(service.id).subscribe(
      (professionals: any[]) => {
        this.staffList = professionals; // Update staff list
      },
      (error) => {
        console.error('Error fetching professionals:', error);
      }
    );
  
    this.dropdownServiceOpen = false; // Close the dropdown
  }
  
  selectTime(type: string, selectedTime: string, day: any) {
    if (type === 'start') {
      day.start = selectedTime;
      day.dropdownOpen.start = false; // Close the dropdown after selecting a time
  
      // Dynamically adjust `end` time if a service is selected
      if (this.selectedService) {
        const startParts = this.formatTimeTo24(selectedTime).split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0, 0);
        
        const endDate = new Date(startDate.getTime() + this.serviceDuration * 60 * 1000);
        const formattedEndTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        day.end = formattedEndTime; // Update the end time
      }
    } else if (type === 'end') {
      day.end = selectedTime;
      day.dropdownOpen.end = false; // Close the dropdown after selecting a time
    }
  }
  
  // Format date for display
  getFormattedDate(dateString: string): string {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return format(date, 'd MMMM, yyyy'); // Example: 17 December, 2024
  }

  saveEvent() {
    const startDate = new Date(this.popupData.date);
    const startTimeParts = this.formatTimeTo24(this.daysOfWeek[0].start).split(':'); // [hour, minute]
    startDate.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]), 0, 0);

    const endDate = new Date(this.popupData.date);
    const endTimeParts = this.formatTimeTo24(this.daysOfWeek[0].end).split(':'); // [hour, minute]
    endDate.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 0, 0);

    const formatLocalToISO = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const newEvent = {
      title: this.popupData.eventName || 'New Event',
      start: formatLocalToISO(startDate),
      end: formatLocalToISO(endDate),
      color: '#66c2a5',
      repeats: this.popupData.repeats,
      guests: this.popupData.guests,
      location: this.popupData.location,
      notes: this.popupData.notes,
    };

    // Add the new event to the array
    this.events = [...this.events, newEvent];

    // Update FullCalendar's events property
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events, // Rebind the updated events array
    };

    // Reset popup and close
    this.resetPopupData();
    this.showPopup = false;
  }


  resetPopupData() {
    this.popupData = {
      eventName: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      repeats: 'Does not repeat',
      guests: '',
      location: '',
      notes: '',
    };
    this.daysOfWeek = [
      { start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
    ];
  }

  formatTimeTo24(time: string): string {
    // Convert time like "10:00 AM" or "5:00 PM" to "10:00" or "17:00"
    const [timePart, meridiem] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  handleSaveEvent() {
    // Format start and end times into 24-hour format
    const startDate = new Date(this.popupData.date);
    const startTimeParts = this.formatTimeTo24(this.daysOfWeek[0].start).split(':');
    startDate.setHours(parseInt(startTimeParts[0]), parseInt(startTimeParts[1]), 0, 0);

    const endDate = new Date(this.popupData.date);
    const endTimeParts = this.formatTimeTo24(this.daysOfWeek[0].end).split(':');
    endDate.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 0, 0);

    // Construct booking data payload
    const bookingData = {
      booking_id: this.popupData.booking_id || "", // Null for create, ID for update
      professional_id: this.selectedStaff.id, // Replace with actual professional ID
      business_id: 'BUS123', // Replace with actual business ID
      service_id: this.selectedService.id, // Replace with actual service ID
      event_name: this.popupData.eventName || '', // Add default or empty value
      customer_id: this.selectedGuest.customer_id || '', // Add default or empty value
      booking_date: this.popupData.date, // Date of booking
      start_time: `${startTimeParts[0]}:${startTimeParts[1]}`, // 24-hour format time
      end_time: `${endTimeParts[0]}:${endTimeParts[1]}`, // 24-hour format time
      guests: this.popupData.guests || '', // Default to empty if not provided
      location: this.popupData.location || 'Default Location', // Default location if not provided
      notes: this.popupData.notes || '', // Notes for the booking
      status: this.popupData.status || 'Confirmed', // Default status
      platform: this.getPlatform() || '', // Default platform
      recurrence:  'None', // Default platform
    };

    // Call service to add or update booking
    this.myBizService.addUpdateBooking(bookingData).subscribe(
      (response: any) => {
        if (response.success) {
          this.getBookings(); // Refresh bookings after success
          this.snackBar.open('Booking Confirmed : ' + response.bookings[0].bookingId, '', {
            duration: 3000,  // Snackbar will disappear after 3 seconds
            panelClass: ['custom-snackbar']  // Updated class name
          });
          console.log('Booking saved successfully:', response.message);
        } else {
          console.error('Error saving booking:', response.error);
        }
      },
      (error) => {
        console.error('Error details:', error); // Log the full error object in the console for debugging
        
        const errorMessage = error?.error || 'An unknown error occurred'; // Extract the error message or use a default message
      
        this.snackBar.open(errorMessage, '', {
          duration: 3000,  // Snackbar will disappear after 3 seconds
          panelClass: ['custom-snackbar']  // Custom styling class for the snackbar
        });
      }
      
    );

    // Close popup and reset data
    this.showPopup = false;
    this.resetPopupData();
  }


  getPlatform(): string {
    const userAgent = navigator.userAgent || navigator.vendor;
  
    if (/android/i.test(userAgent)) {
      return 'Android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'iOS';
    }
    if (/Macintosh|Windows|Linux/.test(userAgent)) {
      return 'Web';
    }
    return 'Unknown';
  }
  
  
}
