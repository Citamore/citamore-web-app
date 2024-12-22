import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MyBizService } from '../my-biz-page/my-biz-service.service';
import { forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-manage-services',
  templateUrl: './manage-services.component.html',
  styleUrls: ['./manage-services.component.scss'],
  standalone:false,
})
export class ManageServicesComponent  implements OnInit {
  isDescriptionExpanded: boolean = false;
  menuOpen = false;
  dropdownAddService = false;
  selectedIndex: number | null = null;
  dropdownPosition = { top: '0px', left: '0px' };
  selectedType: string = 'SERVICE'; // Store selected type
  categories:any[]= [];
  services:any[] = [];
  isModalOpen = false;
  
  constructor(  private myBizService : MyBizService) { }

  ngOnInit() {
    this.loadCategories('BUS123');
  }

  loadCategories(businessId: string): void {
    this.myBizService.getCategoriesByBusinessId(businessId).subscribe((categories: any[]) => {
      this.categories = categories;
      this.loadServices(this.categories); // Load services for all categories
    });
  }
  
  loadServices(categories: any[]): void {
    this.services = []; // Ensure services array is cleared before loading new data
  
    const serviceRequests = categories.map((category: any) =>
      this.myBizService.getServicesByCategoryId(category.id).pipe(
        tap((services: any[]) => {
          // Append services dynamically to avoid overwriting
          this.services = [...this.services, ...services];
        })
      )
    );
   console.log(this.services)
    // Use forkJoin to wait for all service requests to complete
    if (serviceRequests.length > 0) {
      forkJoin(serviceRequests).subscribe({
        next: () => {
          console.log('All services loaded:', this.services);
        },
        error: (error) => {
          console.error('Error loading services:', error);
        }
      });
    } else {
      console.warn('No categories found to load services.');
    }
  }
  
   // Filter categories based on the selected type (Service or Class)
   getFilteredCategories() {
    return this.categories.filter(category => category.type === this.selectedType);
  }

  getServicesByCategory(category: string) {
    return this.services;
  }

  // Toggle the expanded description
  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  toggleAddDropdown(event: MouseEvent,) {
    this.dropdownAddService = !this.dropdownAddService;
    const buttonElement = (event.target as HTMLElement).closest('button');
    if (buttonElement) {
    const buttonRect = buttonElement.getBoundingClientRect();  // Get the button's position
    this.dropdownPosition = {
      top: `0px`,  // Position dropdown below the button
      left: `163px`,  // Position dropdown to the right of the button
    };
  }
  }

   // This method will be triggered when a card is dropped in a new position
   drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // Reorder the item within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transfer the item between different containers (if applicable)
      transferArrayItem(event.previousContainer.data,
                         event.container.data,
                         event.previousIndex,
                         event.currentIndex);
    }
  }

   // Method to close the modal
   closeModal() {
    this.isModalOpen = false;
  }

  // Method to save the service (handle the event from the modal)
  saveService(serviceData: any) {
    console.log('Saved service:', serviceData);
    // Handle saving logic here (e.g., call API, update the list, etc.)
    this.closeModal(); // Close the modal after saving
  }

    trackByCardId(index: number, card: any): number {
      return card.id;
    }

    toggleMenu(event: MouseEvent, index: number) {
      // If the same card is clicked, toggle the dropdown, otherwise open the dropdown for the clicked card
      if (this.selectedIndex === index) {
        this.menuOpen = !this.menuOpen;
      } else {
        this.selectedIndex = index;
        this.menuOpen = true;
      }
  
      const cardElement = (event.target as HTMLElement).closest('.flex');
      if (cardElement) {
        const cardRect = cardElement.getBoundingClientRect();  // Get the card's position
        const screenWidth = window.innerWidth;
  
        // Check if there's enough space on the right to display the dropdown
        const isRightSideAvailable = cardRect.right + 200 < screenWidth;
        this.dropdownPosition = {
          top: `${cardRect.bottom + window.scrollY}px`,  // Position dropdown below the card
          left: isRightSideAvailable ? `${cardRect.right + window.scrollX}px` : `${cardRect.left + window.scrollX - 200}px`,  // Move to the left if no space on the right
        };
      }
    }

    // Set selected type and close dropdown
  setType(type: string) {
    this.selectedType = type;
    this.isModalOpen = true;
    this.dropdownAddService = false;  // Close the dropdown
  }
  

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    // Close 'Add' dropdown if clicked outside
    if (this.dropdownAddService && !document.querySelector('.absolute.z-50.add-dropdown')?.contains(event.target as Node)) {
      this.dropdownAddService = false;
    }
  
    // Close 'Menu' dropdown if clicked outside
    if (this.menuOpen && !document.querySelector('.absolute.z-50.menu-dropdown')?.contains(event.target as Node)) {
      this.menuOpen = false;
    }
  }
  
}
