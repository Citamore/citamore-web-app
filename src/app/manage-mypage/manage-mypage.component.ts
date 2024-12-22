import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CropperPosition, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { COUNTRY_CODES, TIME_INTERVALS } from '../shared/common.constants';

@Component({
  selector: 'app-manage-mypage',
  templateUrl: './manage-mypage.component.html',
  standalone:false,
  styleUrls: ['./manage-mypage.component.scss']
})
export class ManageMypageComponent {
  gallery: string[] = []; // Store the uploaded image URLs
  maxImages: number = 10; 
  businessName: string = '';
  serviceIndustry: string = 'Photography';
  about: string = '';
  brandBanner: string | null = null; // Display cropped image
  brandLogo: string | null = null;
  showCropper: boolean = false;
  imageChangedEvent: any = ''; // Holds file event for cropping
  croppedImage: any = ''; // Holds the cropped image (Base64 string)
  companyLogo: string | null = null; // The original company logo
  dropdownIndustryOpen: boolean = false; // Flag to toggle dropdown visibility
  lastCropperPosition: CropperPosition | null = null;  // Stores the last cropper position for recropping
  lastCroppedImage: any; // Stores the last cropped image
  timeIntervals = TIME_INTERVALS;
  dropdownTimeOpen: "start" | "end" | null = null;
  viewMode: 'web' | 'mobile' = 'web'; // Default to web view

  // Using ViewChild to reference the modal and image cropper
  @ViewChild("imageCropper") imageCropper!: ImageCropperComponent;
  @ViewChild("logoModal") public logoModal!: ModalDirective;
  @ViewChild("inputFile") public inputFile!: ElementRef;

  brandColors: string[] = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#A633FF'];
  buttonShape: string = 'pill';
  theme: string = 'system';

  primaryEmail: string = '';
  primaryPhone: string = '';
  selectedCountryCode = '+1';    // Default country code (United States)

  address: string = '';
  city: string = '';
  province: string = '';
  zip: string = '';
  country: string = '';
  currency: string = 'USD';

  daysOfWeek = [
    { day: 'Monday', enabled: true, start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
    { day: 'Tuesday', enabled: true, start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
    { day: 'Wednesday', enabled: true, start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
    { day: 'Thursday', enabled: true, start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
    { day: 'Friday', enabled: true, start: '10:00 AM', end: '5:00 PM', dropdownOpen: { start: false, end: false } },
    { day: 'Saturday', enabled: false, start: '', end: '', dropdownOpen: { start: false, end: false } },
    { day: 'Sunday', enabled: false, start: '', end: '', dropdownOpen: { start: false, end: false } }
  ];
  

  countryCodes = COUNTRY_CODES;
  timezone: string = 'Canada-Toronto';
  website: string = '';
  instagram: string = '';
  facebook: string = '';
  twitter: string = '';
  originalImage: File | null = null; // Store the original image file
  searchQuery: string = ''; // Search query input by user

  // List of industries
  industries: string[] = [
    'Photography', 'Salon', 'Spa', 'Massage', 'Legal', 'Medical', 'Mentor', 
    'Nail Salon', 'Pet Services', 'Non-Profit organization', 'Personal use', 
    'Landscaping', 'Massage Therapy', 'Massage Clinics', 'Fitness', 'Consulting', 
    'Interior Design', 'Event Planning', 'Music', 'Business Coaching'
  ];
  
  constructor(private sanitizer: DomSanitizer,private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    let time = 0;
    while (time < 24 * 60) {
      let hours = Math.floor(time / 60);
      let minutes = time % 60;
      let formattedTime = `${String(hours > 12 ? hours - 12 : hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
      this.timeIntervals.push(formattedTime);
      time += 15; // Increment by 15 minutes
    }
  }
  ngOnInit(): void {
    this.croppedImage = '';
   }
 
   // ngAfterViewInit for modal configuration and initialization
   ngAfterViewInit(): void {
     this.logoModal.config = { backdrop: "static", keyboard: false };
     this.logoModal.hide();  // Initially hide the modal
   }
 
   // Open the image cropper modal
   openCropper(): void {
     this.logoModal.show();
   }
 
   // This is called when the image is cropped
   imageCropped(event: ImageCroppedEvent) {
     // Check if event.blob exists
     if (event.blob) {
       // Create an object URL from the Blob
       this.croppedImage = URL.createObjectURL(event.blob);
     }
   }
   
 
   // Called when the image is loaded
   imageLoaded() {
     this.logoModal.show(); // Show the modal with the image cropper
   }
 
   // Placeholder function for cropper ready state (not used in this example)
   cropperReady() {
     console.log('Cropper is ready');
   }
 
   // Placeholder for handling load image failure
   loadImageFailed() {
     console.error('Failed to load image');
   }
 
   // Handles the file input change
   onFileChange(event: any) {
     this.imageChangedEvent = event;  // Save the file change event for cropping
     this.showCropper = true;  // Show the cropper
   }
 
   // This function is called when the user presses the 'Crop' button
   crop() {
     // Perform the cropping action
     this.imageCropper.crop();
   
     // Get the current cropper position (if needed for re-cropping)
     this.lastCropperPosition = this.getCurrentCropperPosition();
   
     // Extract the current image source (either Base64 or Blob URL) from the nativeElement
     this.lastCroppedImage = this.imageCropper.sourceImage.nativeElement;
   
     // Use currentSrc to get the cropped image source (Blob URL or Base64 string)
     this.croppedImage = this.lastCroppedImage.currentSrc;
   
     console.log("Cropped Image:", this.croppedImage);
   
     // Manually trigger change detection to ensure the view is updated
     this.cdRef.detectChanges();  // Force Angular to check the view for updates
   
     // Hide the modal after cropping
     this.logoModal.hide();
   }
   
   // Cancel crop and reset the image and position
   cancelCrop() {
     if (this.lastCroppedImage) {
       this.imageCropper.sourceImage = this.lastCroppedImage;  // Reset the image to the last cropped one
     }
 
     if (this.lastCropperPosition !== null) {
       // Only assign if lastCropperPosition is not null
       this.imageCropper.cropper = this.getLastCropperPosition() ?? undefined; // Reset cropper position
     }
 
     this.logoModal.hide();  // Close the modal
   }
 
   // Get the current cropper position
   getCurrentCropperPosition(): CropperPosition | null {
     if (this.imageCropper && this.imageCropper.cropper) {
       return {
         x1: this.imageCropper.cropper.x1,
         x2: this.imageCropper.cropper.x2,
         y1: this.imageCropper.cropper.y1,
         y2: this.imageCropper.cropper.y2
       };
     }
     return null;  // Return null if cropper is not ready
   }
 
   // Get the last cropper position
   getLastCropperPosition(): CropperPosition | undefined {
     if (this.lastCropperPosition) {
       return {
         x1: this.lastCropperPosition.x1,
         x2: this.lastCropperPosition.x2,
         y1: this.lastCropperPosition.y1,
         y2: this.lastCropperPosition.y2
       };
     }
     return undefined;  // Return undefined if last position is not available
   }
 
   // Function to recrop the image
   reCrop() {
     this.logoModal.show();  // Show the modal again for recropping
   }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.brandLogo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onGalleryUpload(event: any): void {
    const files = event.target.files;
  
    // Check how many images are being added
    const newImages = Array.from(files);
  
    if (this.gallery.length + newImages.length > this.maxImages) {
      this.snackBar.open('You can upload a maximum of 10 images.', '', {
        duration: 3000,  // Snackbar will disappear after 3 seconds
        panelClass: ['custom-snackbar']  // Updated class name
      });      
      return;
    }
  
    // Only add the images up to the max allowed
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i] as Blob; // Cast to Blob
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.gallery.push(e.target.result); // Add image to gallery
      };
      reader.readAsDataURL(file); // Works with Blob type
    }
  }
  

  // Delete an image from the gallery
  deleteImage(index: number): void {
    this.gallery.splice(index, 1);
  }

  // Toggle Days of Week
  // Handle enabling/disabling business hours for each day
  toggleDay(day: any) {
    if (day.enabled) {
      // Set default times when enabled
      day.start = '10:00 AM'; // Set start time to 10:00 AM
      day.end = '5:00 PM'; // Set end time to 5:00 PM
    } else {
      // Clear times when disabled
      day.start = '';
      day.end = '';
    }
  }
  // Get dynamic styles for the preview
  getPreviewStyles() {
    return {
      'background-color': this.theme === 'dark' ? '#333' : '#fff',
      'color': this.theme === 'dark' ? '#fff' : '#000',
      'border-radius': this.buttonShape === 'pill' ? '50px' : '5px',
    };
  }

 // Filtered industries based on search query
 filteredIndustries() {
  if (this.searchQuery === '') {
    return this.industries; // Show all industries if search query is empty
  }
  return this.industries.filter(industry => 
    industry.toLowerCase().includes(this.searchQuery.toLowerCase())
  );
}

// Filter industries based on search query
filterIndustries() {
  if (this.searchQuery === '') {
    this.dropdownIndustryOpen = true; // Show all industries when search is empty
  }
}

// Toggle the dropdown visibility
toggleIndustryDropdown(open: boolean) {
  this.dropdownIndustryOpen = open;
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

selectTime(type: string, selectedTime: string, day: any) {
  if (type === 'start') {
    day.start = selectedTime;
    day.dropdownOpen.start = false;  // Close the dropdown after selecting a time
  } else if (type === 'end') {
    day.end = selectedTime;
    day.dropdownOpen.end = false;  // Close the dropdown after selecting a time
  }
}


// Select industry handler and update serviceIndustry
selectIndustry(industry: string) {
  this.serviceIndustry = industry; // Update the serviceIndustry
  this.searchQuery = industry; // Set the searchQuery to selected industry
  this.dropdownIndustryOpen = false; // Close the dropdown after selection
}

 // Handle clicking outside the input and dropdown to close the dropdown
 @HostListener('document:click', ['$event'])
 onContainerClick(event: MouseEvent) {
   // Select the time dropdowns and inputs
   const dropdowns = document.querySelectorAll('.time-dropdown');
   const inputs = document.querySelectorAll('input');
 
   // Close the dropdown if clicked outside any dropdown
   dropdowns.forEach((dropdown) => {
     if (!dropdown.contains(event.target as Node)) {
       // Close the dropdown for the day that is open
       this.daysOfWeek.forEach(day => {
         day.dropdownOpen.start = false;
         day.dropdownOpen.end = false;
       });
     }
   });
 
   // Close the dropdown if clicked outside the input or the dropdown
   inputs.forEach((input) => {
     if (!input.contains(event.target as Node)) {
       // Handle input click logic here if needed
     }
   });
 }
 
 
  // Method to copy Monday's values to all other days
  copyMondayValues() {
    const monday = this.daysOfWeek.find(day => day.day === 'Monday');

    if (monday) {
      // Copy Monday's start time, end time, and enabled status to all days
      this.daysOfWeek.forEach(day => {
        day.start = monday.start;
        day.end = monday.end;
        day.enabled = monday.enabled;
      });
    }
  }
 
}
