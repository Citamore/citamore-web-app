import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-business-setup',
  templateUrl: './business-setup.component.html',
  styleUrls: ['./business-setup.component.scss'],
  standalone:false,
})
export class BusinessSetupComponent  implements OnInit {
  isExpanded: boolean = true;
  section: any;
  constructor() { }

  ngOnInit() {
    this.section = 'customers';
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  getSection(section:any){
    this.section = section
    console.log(section)
  }
}
