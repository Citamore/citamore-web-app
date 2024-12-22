import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { MyBizService } from './my-biz-service.service';

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-my-biz-page',
  templateUrl: './my-biz-page.component.html',
  styleUrls: ['./my-biz-page.component.scss'],
  standalone: false
})
export class MyBizPageComponent implements OnInit, AfterViewInit {
  isMobileView: boolean = false;
  currentStep: 'services' | 'professional' | 'time' | 'review' = 'services';
  currentStepIndex: number = 0;
  businessName = '';
  averageRating = 0;
  totalReviews = 2729;
  status = 'Open until 6:00 p.m.';
  isOpen = true;
  showModal = false;
  showServicesModal = false;
  showUpButton = false;
  @ViewChildren('categorySection') categorySections!: QueryList<ElementRef>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('scrollableModal') scrollableModal!: ElementRef;
  selectedDateIndex = 0;
  selectedSlot: string | null = null;
  nextAvailableDate = new Date();
  slotLength: number = 15;
  showExitConfirmation: boolean = false; // Flag to display confirmation modal
 
  // Business description
  businessDescription = "";
  distance: string = '';
  duration: string = '';

  // Reviews
  reviews:any[] = [];
  statusMessage: string = '';

  // Address
  businessAddress = "";
  mapUrl!: SafeResourceUrl;

  // Opening hours
  openingHours: { name: string; hours: string; open: boolean }[] = [];

  // Steps in order
  steps: ('services' | 'professional' | 'time' | 'review')[] = ['services', 'professional', 'time', 'review'];

  availableDates : any[] = [];

  availableSlots:any[]=[];

  images = [
    { url: 'assets/images/test.jpg', alt: 'Main Image' },
    { url: 'assets/images/test.jpg', alt: 'Gallery Image 1' },
    { url: 'assets/images/test.jpg', alt: 'Gallery Image 2' },
    { url: 'assets/images/test.jpg', alt: 'Gallery Image 3' },
    { url: 'assets/images/test.jpg', alt: 'Gallery Image 4' }
  ];

  // Categories and Services Data
  categories:any[] = [];


  professionals: any[] = [];

  services :any[]= [];

 filteredServices: any[] = []
  // Group services by category
  groupedServices: any
  selectedServices: any[] = [];
  selectedCategory = this.categories[0];
  currentCategoryIndex = 0;

  selectedProfessional: any = null; 
  today = new Date();
  maxDate = new Date(new Date().setMonth(this.today.getMonth() + 4));
  visibleDates: Date[] = [];
  selectedDate: Date = new Date();
  currentMonthYear = this.getMonthYearString(this.today);
  errorMessage: string = '';

  constructor(private snackBar: MatSnackBar, 
    private sanitizer: DomSanitizer,
    private myBizService : MyBizService) {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${encodeURIComponent(this.businessAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    );
    this.checkMobileView();
    this.groupServicesByCategory();
    this.generateVisibleDates();
    this.generateSlots();
  }


  ngOnInit(): void {
    //this.loadBusinessData('BUS123');
    this.generateVisibleDates();
    this.groupServicesByCategory();
    this.loadBusinessDetails('BUS123'); 
    this.loadOpeningHours('BUS123'); // Replace with the actual business ID
    this.loadCategoriesAndServices('BUS123');
    this.loadProfessionals('BUS123');
  }

  loadBusinessDetails(businessId: string): void {
    this.myBizService.getBusinessById(businessId).subscribe((response: any) => {
      this.businessName = response.name;
      this.averageRating = response.average_rating;
      this.totalReviews = response.total_reviews;
      this.businessDescription = response.description;
      this.businessAddress = response.address + ' , ' + response.city + ' , ' + response.postal + ' , ' + response.country;
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://maps.google.com/maps?q=${encodeURIComponent(this.businessAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
      );
      this.getUserLocation();
    });
  }

  loadOpeningHours(businessId: string): void {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // Define the order
  
    this.myBizService.getOpeningHours(businessId).subscribe(
      (response) => {
        const unorderedHours = Object.entries(response.openingHours).map(([day, details]: any) => ({
          name: day,
          hours: details.is_open ? details.hours : 'Closed',
          open: details.is_open
        }));
  
        // Sort the opening hours based on the defined daysOrder
        this.openingHours = daysOrder.map((day) => {
          const dayData = unorderedHours.find((item) => item.name === day);
          return dayData || { name: day, hours: 'Closed', open: false }; // Default to 'Closed' if not found
        });
        this.updateStatus();
      },
      (error) => {
        console.error('Error fetching opening hours:', error);
      }
    );
  }

  getUserLocation(): void {
    // Check if the user's location is already stored in sessionStorage
    const savedLocation = sessionStorage.getItem('userLocation');
  
    if (savedLocation) {
      // If location is stored, use it to calculate the distance
      const { latitude, longitude } = JSON.parse(savedLocation);
      const origin = `${latitude},${longitude}`;
      const destination = this.businessAddress; // Replace with the business address
      this.getDistanceFromMeToBusiness(origin, destination);
    } else if ('geolocation' in navigator) {
      // If location is not stored, fetch it from the browser
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const origin = `${latitude},${longitude}`;
          const destination = this.businessAddress; // Replace with the business address
  
          // Store the location in sessionStorage
          sessionStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
  
          // Use the location to calculate the distance
          this.getDistanceFromMeToBusiness(origin, destination);
        },
        (error) => {
          console.error('Error getting location:', error);
          this.errorMessage = 'Unable to fetch your location.';
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by your browser.';
    }
  }
  getDistanceFromMeToBusiness(origin : string, destination :string){

    this.myBizService.getDistance(origin, destination).subscribe({
      next: (data) => {
        this.distance = data.distance;
        this.duration = data.duration;
      },
      error: (error) => {
        console.error('Error fetching distance:', error);
      }
    });
  }
  updateStatus() {
    const today = new Date();
    const currentDayIndex = today.getDay(); // Sunday = 0, Monday = 1, etc.
    const currentTime = today.getHours() * 60 + today.getMinutes(); // Time in minutes since midnight
  
    // Map the days of the week in order
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
  
    // Ensure all days have a valid structure
    const orderedOpeningHours = daysOfWeek.map(dayName => {
      const day = this.openingHours.find((entry: any) => entry.name === dayName);
      return day
        ? { name: dayName, hours: day.hours || '', open: day.open }
        : { name: dayName, hours: 'Closed', open: false };
    });
  
    const todayHours = orderedOpeningHours[currentDayIndex];
  
    if (todayHours.open && todayHours.hours !== 'Closed') {
      const [startTime, endTime] = todayHours.hours
        .split(' - ')
        .map(time => {
          const [hours, minutes] = time.replace(/AM|PM/g, '').split(':').map(Number);
          const isPM = time.includes('PM') && hours !== 12;
          return hours * 60 + minutes + (isPM ? 720 : 0); // Convert to minutes and adjust for PM
        });
  
      if (currentTime >= startTime && currentTime < endTime) {
        // Business is open
        this.isOpen = true;
        this.statusMessage = `Open until ${todayHours.hours.split(' - ')[1]}`;
      } else if (currentTime < startTime) {
        // Business is closed but will open later today
        this.isOpen = false;
        this.statusMessage = `Closed now, opens today at ${todayHours.hours.split(' - ')[0]}`;
      } else {
        // Business is closed for the day
        this.isOpen = false;
        const nextOpenDay = this.findNextOpenDay(currentDayIndex, orderedOpeningHours);
        if (nextOpenDay) {
          const nextOpenHours = orderedOpeningHours[nextOpenDay];
          const nextOpenTime = nextOpenHours.hours.split(' - ')[0];
          const nextOpenDayName = nextOpenHours.name;
          const dayLabel = nextOpenDay === (currentDayIndex + 1) % 7 ? 'tomorrow' : `on ${nextOpenDayName}`;
          this.statusMessage = `Closed now, opens ${dayLabel} at ${nextOpenTime}`;
        } else {
          this.statusMessage = `Closed now`; // No open days in the week
        }
      }
    } else {
      // Business is closed today
      this.isOpen = false;
      const nextOpenDay = this.findNextOpenDay(currentDayIndex, orderedOpeningHours);
      if (nextOpenDay) {
        const nextOpenHours = orderedOpeningHours[nextOpenDay];
        const nextOpenTime = nextOpenHours.hours.split(' - ')[0];
        const nextOpenDayName = nextOpenHours.name;
        const dayLabel = nextOpenDay === (currentDayIndex + 1) % 7 ? 'tomorrow' : `on ${nextOpenDayName}`;
        this.statusMessage = `● Closed now, opens ${dayLabel} at ${nextOpenTime}`;
      } else {
        this.statusMessage = `● Closed now`; // No open days in the week
      }
    }
  }
  
  // Helper method to find the next open day
  findNextOpenDay(currentDayIndex: number, openingHours: any[]): number | null {
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDay = openingHours[nextDayIndex];
      if (nextDay.open && nextDay.hours !== 'Closed') {
        return nextDayIndex;
      }
    }
    return null;
  }
  
  
  loadCategoriesAndServices(businessId : string): void {
    this.myBizService.getCategoriesByBusinessId(businessId).subscribe((categories: any[]) => {
      this.categories = categories;
      if (categories.length > 0) {
        this.selectedCategory = categories[0];
      }
      categories.forEach((category) => {
        this.myBizService.getServicesByCategoryId(category.id).subscribe((services: any[]) => {
          this.services = [...this.services, ...services];
          this.groupServicesByCategory();
        });
      });
    });
  }

  loadProfessionals(businessId : string): void {
    this.myBizService.getProfessionalsByBusinessId(businessId).subscribe((response: any[]) => {
      this.professionals = response;
      this.selectedProfessional = this.professionals.length ? this.professionals[0] : null;
    });
  }
  
  ngOnDestroy() {
    window.removeEventListener('resize', this.checkMobileView.bind(this));
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 640; // Tailwind's 'sm' breakpoint
  }

  getGoogleMapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.businessAddress)}`;
  }
  
  navigateToStep(index: number): void {
    if (index > this.currentStepIndex) {
      // Restrict access to future steps
      //alert('Please complete the current step before proceeding.');
      return;
    }

    // Allow navigation to current or previous steps
    this.currentStepIndex = index;
    this.currentStep = this.steps[index];
  }

  getStepLabel(step: string): string {
    switch (step) {
      case 'services': return 'Services';
      case 'professional': return 'Professional';
      case 'time': return 'Time';
      default: return '';
    }
  }

  // Go Back to Previous Step
  goBack(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.currentStep = this.steps[this.currentStepIndex];
    }else{
      this.showServicesModal = false;
    }
  }

  // Reset to Initial Step
  resetToFirstStep(): void {
    this.currentStepIndex = 0;
    this.currentStep = 'services';
    this.clearSelections(); // Clear all selections when resetting
  }

  generateAvailableSlots() {
    if (!this.selectedProfessional || !this.selectedDate) return;
  
    const { schedule, daysOff, bookedSlots, buffer_time } = this.selectedProfessional;
  
    // Parse schedule JSON and find the schedule for the selected day
    const dayOfWeek = new Date(this.selectedDate).toLocaleString('en-US', { weekday: 'long' });
    const dailySchedule = schedule.find((s: any) => JSON.parse(s.schedule)[dayOfWeek]);
    const workingHours = dailySchedule ? JSON.parse(dailySchedule.schedule)[dayOfWeek] : 'Off';
  
    if (workingHours === 'Off' || daysOff.includes(this.selectedDate.toISOString().split('T')[0])) {
      this.availableSlots = [];
      return;
    }
  
    // Extract start and end times
    const [start, end] = workingHours.split('-');
    let startTime = this.parseTime(start.trim());
    const endTime = this.parseTime(end.trim());
  
    const slots: string[] = [];
    const serviceDurationMs = this.calculateTotalDuration() * 60000; // Service duration in ms
    const bufferMs = buffer_time * 60000;
  
    // Current time logic
    const currentDate = new Date();
    const currentTimestamp =
      new Date(this.selectedDate).toDateString() === currentDate.toDateString()
        ? currentDate.getTime()
        : startTime;
  
    // Align start time to the next slot interval
    startTime = this.alignToSlotInterval(startTime);
  
    while (startTime + serviceDurationMs <= endTime) {
      // Skip slots that end before the current time
      if (startTime + serviceDurationMs <= currentTimestamp) {
        startTime += this.slotLength * 60000; // Increment by slot length
        continue;
      }
  
      // Check if the current slot conflicts with booked slots
      const isConflict = bookedSlots.some((slot: any) => {
        if (slot.date !== this.selectedDate.toISOString().split('T')[0]) return false; // Skip slots from other dates
  
        const bookedStart = this.parseTime(slot.startTime);
        const bookedEnd = this.parseTime(slot.endTime);
  
        // Calculate session end time with buffer
        const sessionEnd = startTime + serviceDurationMs;
  
        // Slot is invalid if:
        // 1. The session overlaps with a booked slot.
        // 2. The session overlaps with the buffer after a booked slot.
        if (
          (startTime >= bookedStart && startTime < bookedEnd) || // Starts during booked slot
          (sessionEnd > bookedStart && startTime < bookedEnd) || // Ends during booked slot
          (startTime < bookedEnd + bufferMs && sessionEnd >= bookedStart) || // Overlaps buffer
          (sessionEnd === bookedStart) // Ends exactly at the start of a booking
        ) {
          return true;
        }
  
        return false;
      });
  
      if (!isConflict) {
        slots.push(this.formatTime(startTime));
      }
  
      // Increment startTime by slot length (15 minutes)
      startTime += this.slotLength * 60000;
    }
  
    this.availableSlots = slots;
  }
  
  
  alignToSlotInterval(timestamp: number): number {
    const intervalMs = this.slotLength * 60000; // Slot length in milliseconds
    return Math.ceil(timestamp / intervalMs) * intervalMs;
  }
  

 parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}


  confirmGoBack() {
    const currentIndex = this.steps.indexOf(this.currentStep);
    if (currentIndex > 0) {
      this.currentStep = this.steps[currentIndex - 1];
    }
    this.showExitConfirmation = false;
  }

  closeModal() {
    this.showExitConfirmation = false;
  }

  closeServicesModal() {
    this.showExitConfirmation = true;
  }

  confirmCloseModal() {
    this.clearSelections(); // Clear all selections
    this.showExitConfirmation = false;
    this.showServicesModal = false;
  }

  // Clear Selected Services and Professional
  clearSelections() {
    this.selectedServices = [];
    this.selectedProfessional = [];
  }

  closeAll() {
    this.currentStep = 'services';
    this.showExitConfirmation = false;
  }

  // Go to Next Step
  goToNextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.currentStep = this.steps[this.currentStepIndex];
    }
  }

  ngAfterViewInit() {
    new Swiper('.swiper-container', {
      loop: false,
      slidesPerView: 1, // One slide per view on small screens
      spaceBetween: 20, // Adds spacing between slides
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        768: {
          slidesPerView: 2, // Show 2 images on medium screens
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3, // Show 3 images on large screens
          spaceBetween: 30,
        },
      },
    });

    setTimeout(() => {
      this.addScrollListener();
      this.observeCategorySections();
    }, 0); // Small delay ensures DOM is ready
  }

  observeCategorySections() {
    setTimeout(() => {
      if (this.scrollContainer) {
        const observerOptions = {
          root: this.scrollContainer.nativeElement, // Explicitly set the scrollable container
          rootMargin: '-50% 0px -50% 0px', // Trigger when the section is halfway visible
          threshold: 0.2, // Section is 20% visible
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = this.categorySections
                .toArray()
                .findIndex((section) => section.nativeElement === entry.target);

              if (index !== -1) {
                this.currentCategoryIndex = index;
              }
            }
          });
        }, observerOptions);

        // Observe each section
        this.categorySections.forEach((section) => {
          observer.observe(section.nativeElement);
        });
      }
    });
  }

  get visibleServices() {
    return this.services
      .filter(s => s.category_id === this.selectedCategory.id)
      .slice(0, 6);
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
  }

  scrollToCategory(index: number) {
    const target = this.categorySections.toArray()[index];
    if (target) {
      target.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      this.currentCategoryIndex = index; // Ensure immediate highlight
    }
  }
  toggleService(service:any) {
    const index = this.selectedServices.indexOf(service);
    if (index > -1) {
      this.selectedServices.splice(index, 1); // Remove the service if already selected
    } else {
      this.selectedServices.push(service); // Add the service if not already selected
      this.showServicesModal = true; // Open the modal when a service is selected
    }
  }


  isSelected(service: any): boolean {
    return this.selectedServices.includes(service);
  }

  calculateTotal(): number {
    return this.selectedServices.reduce((sum, s) => sum + s.price, 0);
  }

  openSericesModal() {
    this.showServicesModal = true;
  }

  selectPopupCategory(category:any) {
    this.selectedCategory = category;
  }

  groupServicesByCategory() {
    this.groupedServices = this.categories.reduce((acc: any, category: any) => {
      acc[String(category.id)] = this.services.filter((s: any) => s.category_id === category.id);
      return acc;
    }, {});
  }
  
  addScrollListener() {
    if (this.scrollContainer) {
      const scrollableElement = this.scrollContainer.nativeElement;
      scrollableElement.addEventListener('scroll', () => {
        this.checkCategoryInView(scrollableElement);
      });
    } else {
      console.error('scrollContainer is undefined');
    }
  }

  checkCategoryInView(container: HTMLElement) {
    const categoryHeaders = container.querySelectorAll('h2');
    categoryHeaders.forEach((header, index) => {
      const rect = header.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= 150) {
        this.currentCategoryIndex = index;
      }
    });
  }

  openModal() {
    this.showModal = true;
    this.showUpButton = false;

    // Listen for scroll events
    setTimeout(() => {
      const modal = this.scrollableModal.nativeElement;
      modal.addEventListener('scroll', () => {
        this.showUpButton = modal.scrollTop > 200; // Show button after 200px scroll
      });
    });
  }

  getStars(): number[] {
    return Array(Math.floor(this.averageRating)).fill(0);
  }

  scrollToTop() {
    const modal = this.scrollableModal.nativeElement;
    modal.scrollTo({ top: 0, behavior: 'smooth' });
  }

  proceedToNextStep() {
    const currentIndex = this.steps.indexOf(this.currentStep);
    if (currentIndex < this.steps.length - 1) {
      if (this.currentStep === 'services' && this.selectedServices.length === 0) {
        this.snackBar.open('Please select at least one service to proceed.', '', {
          duration: 3000,  // Snackbar will disappear after 3 seconds
          panelClass: ['custom-snackbar']  // Updated class name
        });
        return;
      }
      if (this.currentStep === 'professional' && !this.selectedProfessional) {
        this.snackBar.open('Please select a professional to proceed.', '', {
          duration: 3000,  // Snackbar will disappear after 3 seconds
          panelClass: ['custom-snackbar']  // Updated class name
        });
        return;
      }
      if (this.currentStep === 'time' && !this.selectedSlot) {
        // alert('Please select a time slot.');
        this.snackBar.open('Please select a time slot.', '', {
          duration: 3000,  // Snackbar will disappear after 3 seconds
          panelClass: ['custom-snackbar']  // Updated class name
        });
        return;
      }
      this.currentStep = this.steps[currentIndex + 1];
      this.currentStepIndex++;
      if(this.currentStepIndex === 2){
        this.generateAvailableSlots();
      }
    }
  }

  confirmBooking() {
    this.snackBar.open('Booking.', '', {
      duration: 3000,  // Snackbar will disappear after 3 seconds
      panelClass: ['custom-snackbar']  // Updated class name
    });
    this.clearSelections(); // Clear selections after confirmation
    this.showServicesModal = false; // Close the modal
  }

  selectProfessional(pro: any) {
    this.selectedProfessional = pro;
  }

  // Simulate logic for fully booked days
  get isFullyBooked(): boolean {
    const unavailableDays = [18, 19]; // Simulated unavailable dates
    return unavailableDays.includes(this.availableDates[this.selectedDateIndex].day);
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
  }

  goToNextAvailable() {
    this.selectedDateIndex = 0;
    this.availableSlots = ['4:20 p.m.', '5:00 p.m.', '5:40 p.m.'];
  }

  openCalendar() {
    console.log('Calendar modal opened.');
  }

  // Generate visible dates (7 days starting from today)
  generateVisibleDates(startDate: Date = new Date()) {
    this.visibleDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.visibleDates.push(date);
    }
    this.currentMonthYear = this.getMonthYearString(this.visibleDates[0]);
  }

  // Format month and year string
  getMonthYearString(date: Date): string {
    const options = { year: 'numeric', month: 'long' } as Intl.DateTimeFormatOptions;
    return date.toLocaleDateString('en-US', options);
  }

  // Handle Next and Prev navigation
  navigateDates(direction: 'next' | 'prev') {
    const newStartDate = new Date(this.visibleDates[0]);

    if (direction === 'next') {
      newStartDate.setDate(newStartDate.getDate() + 7);
      if (newStartDate > this.maxDate) return; // Do not go past 4 months
    } else if (direction === 'prev') {
      newStartDate.setDate(newStartDate.getDate() - 7);
      if (newStartDate < this.today) return; // Do not go before today
    }

    this.generateVisibleDates(newStartDate);
  }

  // Check if a date is available
  isDateAvailable(date: Date): boolean {
    if (!this.selectedProfessional) return true;
  
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = date.toISOString().split('T')[0];
  
    // Extract and parse the schedule safely
    const scheduleArray = this.selectedProfessional.schedule || [];
    const parsedSchedule = scheduleArray.length > 0
      ? JSON.parse(scheduleArray[0].schedule || '{}')
      : {};
  
    const daysOff = this.selectedProfessional.daysOff || [];
  
    return parsedSchedule[day] !== "Off" && !daysOff.includes(dateString);
  }
  
  // Select a date
  selectDate(index: number) {
    this.selectedDateIndex = index;
    this.selectedDate = this.visibleDates[index];
    this.generateAvailableSlots();
  }

  // Generate available slots (example: 9 AM to 5 PM, every 30 minutes)
  // Generate available slots
  generateSlots() {
    if (!this.selectedProfessional) {
      this.availableSlots = [];
      return;
    }

    const dateString = this.selectedDate.toISOString().split('T')[0];
    const day = this.selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const professional = this.selectedProfessional;

    if (!professional.schedule[day]) {
      this.availableSlots = [];
      return;
    }

    const { start, end } = professional.schedule[day];
    const buffer = professional.bufferTime || 0;

    let current = this.parseTime(start);
    const endMinutes = this.parseTime(end);
    const slots: string[] = [];

    while (current < endMinutes) {
      const slotStart = this.formatTime(current);
      const slotEnd = this.formatTime(current + 15);

      const isBooked = professional.bookedSlots.some(
        (slot:any) =>
          slot.date === dateString &&
          this.parseTime(slot.startTime) <= current &&
          this.parseTime(slot.endTime) > current
      );

      if (!isBooked) slots.push(`${slotStart} - ${slotEnd}`);

      current += 15 + buffer;
    }

    this.availableSlots = slots;
  }


  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  formatSelectedDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',  // Valid values are 'long', 'short', or 'narrow'
      day: 'numeric',   // Valid values are 'numeric' or '2-digit'
      month: 'long'     // Valid values are 'long', 'short', or 'narrow'
    };
    return date.toLocaleDateString('en-US', options);
  }


  // Disable Prev button
  isPrevDisabled(): boolean {
    return this.visibleDates[0] <= this.today;
  }

  // Calculate total duration of all selected services
  calculateTotalDuration(): number {
    return this.selectedServices.reduce((total, service) => total + service.duration, 0);
  }

  // Calculate end time based on start slot and total duration
  calculateEndTime(startSlot: string): string {
    const [hours, minutesPart] = startSlot.split(':');
    const [minutes, period] = [parseInt(minutesPart.substring(0, 2)), minutesPart.slice(-2)];

    let startHours = parseInt(hours);
    if (period === 'PM' && startHours !== 12) startHours += 12;
    if (period === 'AM' && startHours === 12) startHours = 0;

    const totalMinutes = startHours * 60 + minutes + this.calculateTotalDuration();
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    // Format time to 12-hour format with AM/PM
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const formattedHours = endHours % 12 === 0 ? 12 : endHours % 12;
    const formattedMinutes = endMinutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes} ${endPeriod}`;
  }


  goToNextAvailableDate() {
    let nextDate = new Date(this.selectedDate);
  
    while (true) {
      // Increment the selected date by one day
      nextDate.setDate(nextDate.getDate() + 1);
  
      const dayOfWeek = nextDate.toLocaleString('en-US', { weekday: 'long' });
  
      // Check if it's a working day and not a day off
      const { schedule, daysOff, bookedSlots, buffer_time } = this.selectedProfessional;
  
      // Find the schedule for the next working day
      const dailySchedule = schedule.find((s: any) => JSON.parse(s.schedule)[dayOfWeek]);
      const workingHours = dailySchedule ? JSON.parse(dailySchedule.schedule)[dayOfWeek] : 'Off';
  
      if (workingHours === 'Off' || daysOff.includes(nextDate.toISOString().split('T')[0])) {
        // Skip non-working days and days off
        continue;
      }
  
      // Parse start and end times for the working hours
      const [start, end] = workingHours.split('-');
      const startTime = this.parseTime(start.trim());
      const endTime = this.parseTime(end.trim());
  
      // Generate available slots for the next working day
      const slots: string[] = [];
      const serviceDurationMs = this.calculateTotalDuration() * 60000; // Service duration in ms
      const bufferMs = buffer_time * 60000;
  
      let currentTime = startTime;
  
      while (currentTime + serviceDurationMs <= endTime) {
        // Check if the current slot conflicts with booked slots
        const isConflict = bookedSlots.some((slot: any) => {
          if (slot.date !== nextDate.toISOString().split('T')[0]) return false; // Skip slots from other dates
  
          const bookedStart = this.parseTime(slot.startTime);
          const bookedEnd = this.parseTime(slot.endTime);
  
          // Calculate session end time with buffer
          const sessionEnd = currentTime + serviceDurationMs;
  
          // Slot is invalid if:
          if (
            (currentTime >= bookedStart && currentTime < bookedEnd) || // Starts during booked slot
            (sessionEnd > bookedStart && currentTime < bookedEnd) || // Ends during booked slot
            (currentTime < bookedEnd + bufferMs && sessionEnd >= bookedStart) // Overlaps buffer
          ) {
            return true;
          }
  
          return false;
        });
  
        if (!isConflict) {
          slots.push(this.formatTime(currentTime));
        }
  
        // Increment currentTime by slot length (15 minutes)
        currentTime += this.slotLength * 60000;
      }
  
      // If valid slots are found for the day, set the next available date and stop
      if (slots.length > 0) {
        this.nextAvailableDate = new Date(nextDate); // Store as Date
        this.availableSlots = slots; // Update available slots
        const nextDateIndex = this.visibleDates.findIndex(
          (date) => date.toDateString() === this.nextAvailableDate.toDateString()
        );
      
        if (nextDateIndex !== -1) {
          this.selectedDateIndex = nextDateIndex; // Update the selected date index
        } else {
          // If the next available date is not within visibleDates, regenerate visibleDates
          this.generateVisibleDates(this.selectedDate);
          this.selectedDateIndex = this.visibleDates.findIndex(
            (date) => date.toDateString() === this.selectedDate.toDateString()
          );
        }
        break;
      }
    }
  }
  

  shouldShowBottomBar(): boolean {
    switch (this.currentStep) {
      case 'services':
        return this.selectedServices.length > 0; // Show when at least one service is selected
      case 'professional':
        return this.selectedProfessional !== null; // Show when a professional is selected
      case 'time':
        return this.selectedSlot !== null; // Show when a time slot is selected
      default:
        return false; // Hide for other steps (e.g., 'review')
    }
  }

}
