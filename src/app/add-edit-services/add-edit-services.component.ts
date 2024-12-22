import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-edit-services',
  templateUrl: './add-edit-services.component.html',
  styleUrls: ['./add-edit-services.component.scss'],
  standalone:false,
})
export class AddEditServicesComponent  implements OnInit {
  panelState = 'void'; 
  serviceForm!: FormGroup;
  @Input() isModalOpen: boolean = false;
  @Input() selectedType: any;
  @Input() categories:any;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() saveServiceEvent = new EventEmitter<any>();
  dropdownOpen = false;
  selectedOption: string | null = null;
  serviceImage: File | null = null;
  isHidden: boolean = false;  // Tracks the visibility of the service
  dropdownStaffOpen = false;
  dropdownLocationOpen = false;
  options = [
    { name: 'Option 1', selected: false },
    { name: 'Option 2', selected: false },
    { name: 'Option 3', selected: false },
    { name: 'Option 4', selected: false },
  ];

  locations = [
    { id: 1, name: 'TAR', selected: false },
    { id: 2, name: 'Google', selected: false },
    { id: 3, name: 'Zoom', selected: false },
  ];

  staffs = [
      { id: 1, name: 'John Doe', imageUrl: 'assets/images/staff/staff1.jpg' ,selected: false},
      { id: 2, name: 'Jane Smith', imageUrl: 'assets/images/staff/staff2.jpg' ,selected: false},
  ];

  serviceData: any = { title: '', cost: '', duration: '', description: '' };
  selectedStaff: string[] = [];
  selectedLocation:  string[] = [];
  constructor(private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.serviceForm = this.fb.group({
      title: [''],  // Always required
      serviceImage: [''],  // Always required
      buffer: ['', [Validators.min(1)]],  // Not required initially
      seats: ['', [Validators.min(1)]],  // Not required initially
      category: [''],  // Initially required, but will be updated dynamically
      cost: ['', [Validators.min(1)]],  // Always required
      duration: ['', [Validators.min(1)]],  // Always required
      description: ['', Validators.maxLength(500)],  // Optional
      isHidden: [false],  // Optional
      staff: this.fb.array([]),  // For storing selected staff ids (required)
      location: this.fb.array([]),  // For storing selected location ids (required)
    });
  
    this.setInitialValues();
    this.updateValidatorsBasedOnType(this.selectedType);
  }
  
  updateValidatorsBasedOnType(selectedType: string) {
    const bufferControl = this.serviceForm.get('buffer');
    const seatsControl = this.serviceForm.get('seats');
    const categoryControl = this.serviceForm.get('category');
    const staffControl = this.serviceForm.get('staff');
    const locationControl = this.serviceForm.get('location');
  
    // Clear all validators before applying new ones
    bufferControl?.clearValidators();
    seatsControl?.clearValidators();
    categoryControl?.clearValidators();
  
    // Apply conditional validators based on selectedType
    if (selectedType === 'category') {
      // Only category is required when selectedType is 'category'
      categoryControl?.setValidators([Validators.required]);
    } else if (selectedType === 'class') {
      // For 'class', seats is required, buffer is optional
      seatsControl?.setValidators([Validators.required, Validators.min(1)]);
      bufferControl?.setValidators([Validators.min(1)]); // Optional
    } else if (selectedType === 'service') {
      // For 'service', buffer is required, seats is optional
      bufferControl?.setValidators([Validators.required, Validators.min(1)]);
      seatsControl?.setValidators([Validators.min(1)]); // Optional
    }
  
    // Update the validators after changing them
    bufferControl?.updateValueAndValidity();
    seatsControl?.updateValueAndValidity();
    categoryControl?.updateValueAndValidity();
    staffControl?.updateValueAndValidity();
    locationControl?.updateValueAndValidity();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedType']) {
      this.updateValidatorsBasedOnType(this.selectedType);
    }
  }

  setType(type: string) {
    this.selectedType = type;  // Update the selectedType in the child component
    this.updateValidatorsBasedOnType(type);  // Call the method to update validators based on selected type
  }

  setInitialValues() {
    const staffArray = this.serviceForm.get('staff') as FormArray;
    const locationArray = this.serviceForm.get('location') as FormArray;

    this.staffs.forEach(staff => {
      if (staff.selected) {
        staffArray.push(this.fb.control(staff.id));  // Add selected staff id to the FormArray
      }
    });

    this.locations.forEach(location => {
      if (location.selected) {
        locationArray.push(this.fb.control(location.id));  // Add selected location id to the FormArray
      }
    });
  }

  // Method to close the modal
  closeModal() {
    this.closeModalEvent.emit();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleLocationsDropdown() {
    this.dropdownLocationOpen = !this.dropdownLocationOpen;
  }

   // Toggle dropdown visibility
   toggleStaffDropdown() {
    this.dropdownStaffOpen = !this.dropdownStaffOpen;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.serviceForm.get('serviceImage')?.setValue(file);
      this.serviceImage = file;
      console.log('Selected image:', this.serviceImage);
    }
  }

    // Select an option and close the dropdown
    selectOption(option: string) {
      this.selectedOption = option;
      this.serviceForm.get('category')?.setValue(option);
      this.dropdownOpen = false; // Close dropdown after selection
    }

  selectStaff(staffId: number, event: any) {
    const staffArray = this.serviceForm.get('staff') as FormArray;
    const staff = this.staffs.find(staff => staff.id === staffId);

    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      staffArray.push(this.fb.control(staffId));  // Add staff id if checked
      if (staff && !this.selectedStaff.includes(staff.name)) {
        this.selectedStaff.push(staff.name);  // Add staff name to the selectedStaff array
      }
    } else {
      const index = staffArray.controls.findIndex(control => control.value === staffId);
      if (index !== -1) {
        staffArray.removeAt(index);  // Remove staff id if unchecked
        if (staff) {
          const staffIndex = this.selectedStaff.indexOf(staff.name);
          if (staffIndex !== -1) {
            this.selectedStaff.splice(staffIndex, 1);  // Remove staff name from the selectedStaff array
          }
        }
      }
    }
  }

  selectLocation(locationId: number, event: any) {
    const locationArray = this.serviceForm.get('location') as FormArray;
    const isChecked = (event.target as HTMLInputElement).checked;  // Cast the event.target to HTMLInputElement to access 'checked'
    const location = this.locations.find(location => location.id === locationId);
    if (isChecked) {
      locationArray.push(this.fb.control(locationId));  // Add staff id if checked
      if (location && !this.selectedLocation.includes(location.name)) {
        this.selectedLocation.push(location.name);  // Add staff name to the selectedStaff array
      }
    } else {
      const index = locationArray.controls.findIndex(control => control.value === locationId);
      if (index !== -1) {
        locationArray.removeAt(index);  // Remove staff id if unchecked
        if (location) {
          const locationIndex = this.selectedLocation.indexOf(location.name);
          if (locationIndex !== -1) {
            this.selectedLocation.splice(locationIndex, 1);  // Remove staff name from the selectedStaff array
          }
        }
      }
    }
  }


  // Method to save the service data
  saveService() {
    if (this.serviceForm.invalid) {
      // Mark all controls as touched to trigger validation error messages
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        
        if (control instanceof FormArray) {
          control.controls.forEach(innerControl => {
            innerControl.markAsTouched();  // Mark each control in FormArray as touched
          });
        } else {
          control?.markAsTouched();  // Mark the control as touched
        }
      });
      this.snackBar.open('Please fill in all required fields.', '', {
        duration: 3000,  // Snackbar will disappear after 3 seconds
        panelClass: ['custom-snackbar']  // Updated class name
      });          
      return;
    }
  
    // Proceed with the save logic if the form is valid
    console.log('Form is valid. Proceed with save operation');
  }

}
