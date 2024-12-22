import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Papa } from 'ngx-papaparse'; // For CSV parsing
import { COUNTRY_CODES } from '../shared/common.constants';
import { MyBizService } from '../my-biz-page/my-biz-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-manage-customers',
  standalone: false,
  templateUrl: './manage-customers.component.html',
  styleUrls: ['./manage-customers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCustomersComponent implements OnInit {
  primaryPhone = {
    selectedCode: '+1',
    selectedFlag: 'Canada',
    searchQuery: '',
    number: '',
  };
  isEditMode: boolean = false

  customers: any[] = [];
  newCustomer = {
    businessId: 'BUS123',
    name: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    city: '',
    postal_code: '',
    province: '',
    country: '',
    profileImage: '',
    notes: ''
  };
  countryCodes = COUNTRY_CODES;
  selectedCountryCode = "+1"; // Default selected code
  dropdownCCOpen = false; // Toggle dropdown visibility
  searchQuery = ""; // For filtering country codes
  editingField: { [key: string]: boolean } = {};
  selectedTab: string = 'about'; // Default to 'about' tab
  customerGroups: { [key: string]: any[] } = {};
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  selectedCustomer: any | null = null;
  showAppointmentPopup: boolean = false;
  isAddCustomerModalOpen: boolean = false;
  dropdownOpen: boolean = false; // To control the dropdown visibility
  selectedCategory: string | null = null; // Store the selected category
  selectedDate: any;   // To hold the selected date
  selectedTime: string = '';  // To hold the selected time in the time picker
  showImportModal: boolean = false; // Flag to show modal
  csvData: any[] = []; // Store CSV data after it's loaded
  selectedCountryName: string = 'Canada';
  isDeleteModalOpen: boolean = false; // Track delete modal state

  // State for dropdown visibility
  dropdownAdditionalFieldsOpen = false;

  // List of options for additional fields
  // Options for additional fields with icons
  additionalFieldOptions = [
    { label: 'Website', icon: 'language' },
    { label: 'Instagram', icon: 'camera' },
    { label: 'Facebook', icon: 'facebook' },
    { label: 'X', icon: 'alternate_email' },
    { label: 'LinkedIn', icon: 'linkedin' },
    { label: 'YouTube', icon: 'play_circle' },
  ];
  // List to store added fields
  additionalFields: { label: string; icon: string; value: string }[] = [];

  additionalPhoneFields: {
    selectedCode: string;
    selectedFlag: string | null;
    searchQuery: string;
    number: string;
  }[] = [];

  additionalEmails: { email: string }[] = [];

  searchedLocations: { description: string; place_id: string }[] = []; // Holds search results

  constructor(private papa: Papa, private myBizService: MyBizService, private snackBar: MatSnackBar) {
  }


  ngOnInit(): void {
    this.isEditMode = false;
    // Sort customers alphabetically by name
    this.customers.sort((a, b) => a.name.localeCompare(b.name));

    // Set the first customer (in alphabetical order) as selected by default
    if (this.customers.length > 0) {
      this.selectedCustomer = this.customers[0];
    }

    this.fetchCustomers();
  }

  fetchCustomers(): void {
    this.myBizService.getCustomersByBusinessId('BUS123').subscribe(
      (response: any[]) => {
        // Ensure unique customers by customer_id
        this.customers = [
          ...new Map(response.map((customer) => [customer.customer_id, customer])).values(),
        ];

        // Parse JSON fields if necessary
        this.customers.forEach((customer) => {
          if (customer.handles) {
            try {
              customer.handles = JSON.parse(customer.handles);
            } catch (error) {
              console.error('Error parsing handles for customer:', customer, error);
              customer.handles = {}; // Default to an empty object
            }
          }
          if (customer.additional_emails) {
            try {
              customer.additional_emails = JSON.parse(customer.additional_emails);
            } catch (error) {
              console.error('Error parsing additional_emails for customer:', customer, error);
              customer.additional_emails = []; // Default to an empty array
            }
          }
          if (customer.additional_phones) {
            try {
              customer.additional_phones = JSON.parse(customer.additional_phones);
            } catch (error) {
              console.error('Error parsing additional_phones for customer:', customer, error);
              customer.additional_phones = []; // Default to an empty array
            }
          }
        });

        // Debugging step: Check parsed customers
        console.log('Parsed Customers:', this.customers);

        // Group customers after ensuring data integrity
        this.groupCustomers();

        // Set the first customer (in alphabetical order) as selected by default
        if (this.customers.length > 0) {
          this.selectedCustomer = this.customers[0];
        }
      },
      (error) => {
        console.error('Error fetching customers:', error);
      }
    );
  }


  addEmailField(): void {
    this.additionalEmails.push({ email: '' });
  }

  saveEmailField(index: number): void {
    this.editingField['email_' + index] = false;
  }

  removeEmailField(index: number): void {
    this.additionalEmails.splice(index, 1);
    delete this.editingField['email_' + index];
  }


  // Save the primary email
  savePrimaryEmail(): void {
    this.editingField['email'] = false;
  }

  getLocations(query: string): void {
    if (query.trim().length > 2) {
      const address = { query: query }
      this.myBizService.getSearchedAddress(address).subscribe(
        (locations) => {
          this.searchedLocations = locations.map((result: any) => ({
            description: result.description,
            place_id: result.placeId,
          }));
          console.log(this.searchedLocations)
        },
        (error) => {
          console.error('Error fetching locations:', error);
          this.searchedLocations = [];
        }
      );
    } else {
      this.searchedLocations = [];
    }
  }

  onLocationClick(location: { description: string; place_id: string },event: Event): void {
    event.preventDefault(); 
    event.stopPropagation();
    // Use the Google Place Details API to fetch address details
    this.myBizService.getPlaceDetails(location.place_id).subscribe(
      (placeDetails) => {
        const addressComponents = placeDetails;

        // Extract data for the required fields
        this.newCustomer.address = placeDetails.address;
        this.newCustomer.city = placeDetails.city || '';
        this.newCustomer.postal_code = placeDetails.postal || '';
        this.newCustomer.province = placeDetails.province || '';
        this.newCustomer.country = placeDetails.country || '';
        this.searchedLocations = []; // Clear suggestions
        this.editingField['address'] = false;
      },
      (error) => {
        console.error('Error fetching place details:', error);
      }
    );
  }

  // Toggle dropdown visibility
  toggleAdditionalFieldsDropdown(): void {
    this.dropdownAdditionalFieldsOpen = !this.dropdownAdditionalFieldsOpen;
  }

  // Add an additional field
  addAdditionalField(option: { label: string; icon: string }): void {
    this.additionalFields.push({ ...option, value: '' });
    this.dropdownAdditionalFieldsOpen = false; // Close the dropdown
  }

  // Remove an additional field
  removeAdditionalField(index: number): void {
    this.additionalFields.splice(index, 1);
  }

  // Add a new phone number field
  // Add a new phone number field
  addPhoneNumberField(): void {
    const index = this.additionalPhoneFields.length;
    this.additionalPhoneFields.push({
      selectedCode: '+1', // Default to +1
      selectedFlag: null, // Leave the flag empty initially
      searchQuery: '',
      number: '',
    });
    this.editingField[`phoneDropdown_${index}`] = false; // Initialize dropdown state
  }

  // Remove a phone number field
  removePhoneNumberField(index: number): void {
    this.additionalPhoneFields.splice(index, 1);
    delete this.editingField[`phoneDropdown_${index}`]; // Clean up the dropdown state
  }

  // Toggle dropdown for a specific phone field
  toggleDropdownForField(indexOrKey: number | 'primary'): void {
    if (indexOrKey === 'primary') {
      this.editingField['phoneDropdown_primary'] = !this.editingField['phoneDropdown_primary'];
    } else {
      this.editingField[`phoneDropdown_${indexOrKey}`] = !this.editingField[`phoneDropdown_${indexOrKey}`];
    }
  }

  // Select a country code for a specific phone field
  selectCountryCodeForField(indexOrKey: number | 'primary', country: { name: string; code: string; flag: string }): void {
    if (indexOrKey === 'primary') {
      this.primaryPhone.selectedCode = country.code;
      this.primaryPhone.selectedFlag = country.flag;
      this.editingField['phoneDropdown_primary'] = false;
    } else {
      this.additionalPhoneFields[indexOrKey].selectedCode = country.code;
      this.additionalPhoneFields[indexOrKey].selectedFlag = country.flag;
      this.editingField[`phoneDropdown_${indexOrKey}`] = false;
    }
  }

  // Filter country codes
  filterCountryCodes(query: string = ''): { name: string; code: string; flag: string }[] {
    return this.countryCodes.filter((country) =>
      country.name.toLowerCase().includes(query.toLowerCase())
    );
  }


  groupCustomers(): void {
    // Debugging step: Check customers array
    console.log('Customers before grouping:', this.customers);

    this.customerGroups = {}; // Reset groups to avoid duplicates or overwrites

    // Use a Set to track unique customer IDs
    const processedCustomerIds = new Set();

    this.customers.forEach((customer) => {
      if (!processedCustomerIds.has(customer.customer_id)) {
        processedCustomerIds.add(customer.customer_id); // Track processed customers

        const firstLetter = customer.name.charAt(0).toUpperCase(); // Get the first letter of the name
        if (!this.customerGroups[firstLetter]) {
          this.customerGroups[firstLetter] = [];
        }
        this.customerGroups[firstLetter].push(customer);
      }
    });

    // Debugging step: Check grouped customers
    console.log('Grouped Customers:', this.customerGroups);
  }



  editCustomer(customer: any): void {
    this.isEditMode = true;
    this.isAddCustomerModalOpen = true; // Open the modal
    this.newCustomer = { ...customer }; // Pre-fill the form fields with customer data
    this.newCustomer.email = customer.primary_email;
    // Handle pre-filling phone fields
    const phoneLength = 10; // Standard phone number length
    const number = customer.primary_phone.slice(-phoneLength); // Extract the last 10 digits as the phone number
    const countryCode = customer.primary_phone.replace(number, ''); // Extract the remaining part as the country code
    this.primaryPhone.selectedCode = countryCode.trim(); // Trim whitespace for clean code
    this.primaryPhone.number = number;
    // Handle additional phone fields
    this.additionalPhoneFields = customer.additional_phones
      ? customer.additional_phones.map((phone: any) => ({
        selectedCode: phone.country_code,
        number: phone.number,
        searchQuery: '',
      }))
      : [];

    // Handle additional emails
    this.additionalEmails = customer.additional_emails
      ? customer.additional_emails.map((email: string) => ({ email }))
      : [];

    // Handle additional fields (handles)
    this.additionalFields = customer.handles
      ? Object.entries(customer.handles).map(([label, value]) => ({
        label,
        value: String(value), // Ensure the value is a string
        icon: this.getIconForLabel(label), // Add default or mapped icon
      }))
      : [];
  }


  // Helper function to provide default icons
  getIconForLabel(label: string): string {
    const iconMap: { [key: string]: string } = {
      Website: 'language',
      Instagram: 'camera',
      Facebook: 'facebook',
      X: 'alternate_email',
      LinkedIn: 'linkedin',
      YouTube: 'play_circle',
    };

    return iconMap[label] || 'help'; // Default to 'help' if no matching icon is found
  }




  // Trigger delete confirmation modal
  confirmDelete(customer: any): void {
    this.myBizService.deleteCustomer(customer.customer_id).subscribe(
      () => {
        // Remove the deleted customer from the local list
        this.fetchCustomers();
        this.selectedCustomer = null;
        this.isDeleteModalOpen = false; // Close the delete modal
        this.snackBar.open(customer.name + 'Deleted Successfully', '', {
          duration: 3000,
          panelClass: ['custom-snackbar']
        });
      },
      (error) => {
        console.error('Error deleting customer:', error);
      }
    );
  }

  // Cancel deletion
  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.selectedCustomer = this.selectedCustomer;
  }

  // Delete the customer
  deleteCustomer(customerId: string): void {
    this.isDeleteModalOpen = true;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '';
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }

  openCustomerModal(customer: any) {
    this.selectedCustomer = customer;
  }

  closeModal() {
    this.selectedCustomer = null;
  }

  addContact(){
    this.isEditMode = false;
    this.isAddCustomerModalOpen = true;
  }

  openAddCustomerModal() {
    this.isAddCustomerModalOpen = true;
  }

  closeAddCustomerModal() {
    this.isAddCustomerModalOpen = false;
    this.newCustomer = {
      businessId: 'BUS123',
      name: '',
      phone: '',
      email: '',
      company: '',
      address: '',
      city: '',
      postal_code: '',
      province: '',
      country: '',
      profileImage: '',
      notes: ''
    };
  }


  // Mock function to save customer (replace with actual implementation)
  saveCustomer(): void {
    const savedCustomer = {
      ...this.newCustomer,
      primary_phone: this.primaryPhone.selectedCode && this.primaryPhone.number
        ? `${this.primaryPhone.selectedCode}${this.primaryPhone.number}`
        : '', // Ensure it is non-empty if both parts are valid
      additional_phones: this.additionalPhoneFields.map(phone => ({
        selectedCode: phone.selectedCode,
        number: phone.number,
      })),
      additional_emails: this.additionalEmails.map(email => email.email),
      additional_fields: this.additionalFields.map(field => ({
        label: field.label,
        value: field.value,
      })),
    };
  
    const payload = {
      business_id: this.newCustomer.businessId || "",
      name: this.newCustomer.name,
      primary_email: this.newCustomer.email,
      primary_phone: this.primaryPhone.selectedCode + this.primaryPhone.number,
      address: this.newCustomer.address,
      city: this.newCustomer.city,
      province: this.newCustomer.province,
      country: this.newCustomer.country,
      postal_code: this.newCustomer.postal_code,
      company: this.newCustomer.company,
      notes: this.newCustomer.notes || '',
      handles: this.isEditMode
        ? JSON.stringify(
            this.additionalFields.reduce((handles: any, field: any) => {
              handles[field.label] = field.value;
              return handles;
            }, {})
          )
        : this.additionalFields.reduce((handles: any, field: any) => {
            handles[field.label] = field.value;
            return handles;
          }, {}),
      additional_emails: this.isEditMode
        ? JSON.stringify(this.additionalEmails.map(email => email.email))
        : this.additionalEmails.map(email => email.email),
      additional_phones: this.isEditMode
        ? JSON.stringify(
            this.additionalPhoneFields.map(phone => ({
              country_code: phone.selectedCode,
              number: phone.number,
            }))
          )
        : this.additionalPhoneFields.map(phone => ({
            country_code: phone.selectedCode,
            number: phone.number,
          })),
    };
  
    if (this.isEditMode) {
      // Edit customer
      if (!this.selectedCustomer) {
        console.error('No customer selected for editing.');
        return;
      }
  
      this.myBizService.editCustomer(this.selectedCustomer.customer_id, payload).subscribe(
        (response: any) => {
          if (response) {
            this.snackBar.open('Customer Updated Successfully', '', {
              duration: 3000,
              panelClass: ['custom-snackbar'],
            });
            this.fetchCustomers(); // Refresh customer list
            console.log('Customer updated successfully:', response.message);
          } else {
            console.error('Error updating customer:', response.error);
          }
        },
        (error) => {
          console.error('Error details:', error);
          const errorMessage = error?.error || 'An unknown error occurred';
          this.snackBar.open(errorMessage, '', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
          });
        }
      );
    } else {
      // Add new customer
      this.myBizService.addCustomer(payload).subscribe(
        (response: any) => {
          if (response) {
            this.snackBar.open('Customer Added Successfully', '', {
              duration: 3000,
              panelClass: ['custom-snackbar'],
            });
            this.fetchCustomers(); // Refresh customer list
            console.log('Customer saved successfully:', response.message);
          } else {
            console.error('Error saving customer:', response.error);
          }
        },
        (error) => {
          console.error('Error details:', error);
          const errorMessage = error?.error || 'An unknown error occurred';
          this.snackBar.open(errorMessage, '', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
          });
        }
      );
    }
  
    console.log('Customer saved:', savedCustomer);
  
    // Reset and close the modal
    this.closeAddCustomerModal();
  }
  



  // Placeholder for profile image upload logic
  uploadProfileImage() {
    console.log('Profile image upload clicked');
  }


  // Filter customers based on search query
  filterCustomers() {
    // If search is empty, show all customers and group them
    if (this.searchQuery.trim() === '') {
      this.groupCustomers(); // Reset grouping when there's no search query
    } else {
      // Filter customers based on the search query
      const filteredCustomers = this.customers.filter((customer) =>
        customer.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      // Group filtered customers
      this.groupFilteredCustomers(filteredCustomers);
    }
  }

  // Method to group filtered customers
  groupFilteredCustomers(filteredCustomers: any) {
    this.customerGroups = {}; // Reset customer groups
    filteredCustomers.forEach((customer: any) => {
      const firstLetter = customer.name.charAt(0).toUpperCase();
      if (!this.customerGroups[firstLetter]) {
        this.customerGroups[firstLetter] = [];
      }
      this.customerGroups[firstLetter].push(customer);
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  // Open the appointment modal
  openAppointmentModal() {
    this.showAppointmentPopup = true;
  }

  // Close the appointment modal
  closeAppointmentModal() {
    this.showAppointmentPopup = false;
  }

  // Toggle dropdown visibility
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Select a category from the dropdown
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.dropdownOpen = false; // Close the dropdown after selection
  }

  // Open Import Modal
  openImportModal(): void {
    this.showImportModal = true;
  }

  // Close Import Modal
  closeImportModal(): void {
    this.showImportModal = false;
  }

  toggleCCDropdown(event: Event): void {
    event.stopPropagation(); // Prevent triggering the phone input activation
    this.dropdownCCOpen = !this.dropdownCCOpen;
    this.editingField['countryCode'] = true; // Activate the dropdown editing mode
    this.editingField['phone'] = false; // Deactivate the phone input editing mode
  }

  editField(field: string): void {
    this.dropdownCCOpen = false; // Close the dropdown if open
    for (const key in this.editingField) {
      this.editingField[key] = false;
    }
    this.editingField[field] = true; // Activate only the clicked field
  }

  // Getter for the selected country's flag
  get selectedCountryFlag(): string | undefined {
    const country = this.countryCodes.find(
      (c) => c.code === this.selectedCountryCode && c.name === this.selectedCountryName
    );
    return country?.flag;
  }


  selectCountryCode(country: { name: string; code: string; flag: string }): void {
    this.selectedCountryCode = country.code;
    this.selectedCountryName = country.name; // Store the name to differentiate between countries with the same code
    this.dropdownCCOpen = false; // Close the dropdown
    this.editingField['countryCode'] = false; // Reset the editing state for the country code
  }


  saveField(field: string): void {
    this.editingField[field] = false; // Deactivate editing mode for the given field
  }

  // Handle file input change (selecting CSV file)
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.papa.parse(file, {
        complete: (result) => {
          console.log('CSV Data:', result);
          this.csvData = result.data; // Store CSV data
        },
        header: true, // Treat the first row as headers
      });
    }
  }

  // Remove customer from the CSV table
  removeCustomer(index: number): void {
    this.csvData.splice(index, 1);
  }

  // Import CSV data into customer list
  importData(): void {

    const customersWithBusinessId = this.csvData.map((customer: any) => ({
      ...customer,
      businessId: 'BUS123', // Replace with the appropriate business ID
    }));

    this.myBizService.addCustomerInBulk(customersWithBusinessId).subscribe(
      (response: any) => {
        if (response) {
          this.snackBar.open(response.message, '', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
          });
          this.fetchCustomers(); // Refresh customer list
          console.log('Customer saved successfully:', response.message);
        } else {
          console.error('Error saving customer:', response.error);
        }
      },
      (error) => {
        console.error('Error details:', error);
        const errorMessage = error?.error || 'An unknown error occurred';
        this.snackBar.open(errorMessage, '', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
      }
    );
    this.groupCustomers();
    // Close the modal
    this.closeImportModal();
  }


  // Export Customer Data to CSV
  exportData(): void {
    const customersData = this.customers.map(customer => ({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      company: customer.company,
      location: customer.location,
    }));

    const csv = this.papa.unparse(customersData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv'; // File name for the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); // Clean up after download
  }
}
