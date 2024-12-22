import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusinessSetupComponent } from './business-setup.component';
import { ManageServicesComponent } from '../manage-services/manage-services.component';
import { AddEditServicesComponent } from '../add-edit-services/add-edit-services.component';
import { BrowserAnimationsModule, NoopAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BusinessRoutingModule } from './business.routing.module';
import { ManageCustomersComponent } from '../manage-customers/manage-customers.component';
import { ManageCalenderComponent } from '../manage-calender/manage-calender.component';
import { ManageCouponsComponent } from '../manage-coupons/manage-coupons.component';
import { ManageIntegrationsComponent } from '../manage-integrations/manage-integrations.component';
import { ManageMypageComponent } from '../manage-mypage/manage-mypage.component';
import { ManagePaymentsComponent } from '../manage-payments/manage-payments.component';
import { ManageSettingsComponent } from '../manage-settings/manage-settings.component';
import { ManagemyBillingComponent } from '../managemy-billing/managemy-billing.component';
import { ManagemyNotificationsComponent } from '../managemy-notifications/managemy-notifications.component';
import { ManagemyReportsComponent } from '../managemy-reports/managemy-reports.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CustomCalendarComponent } from '../custom-calendar/custom-calendar.component';
import { MyBizPageComponent } from '../my-biz-page/my-biz-page.component';


@NgModule({
  declarations: [
    BusinessSetupComponent,
    ManageServicesComponent, 
    AddEditServicesComponent, 
    ManageCustomersComponent,
    ManageCalenderComponent,
    ManageCouponsComponent,
    ManageIntegrationsComponent,
    ManageMypageComponent,
    ManagePaymentsComponent,
    ManageSettingsComponent,
    ManagemyBillingComponent,
    ManagemyNotificationsComponent,
    ManagemyReportsComponent,
    CustomCalendarComponent,
    MyBizPageComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatSnackBarModule,
    BusinessRoutingModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule,
    ImageCropperComponent,
    ModalModule.forRoot()  ,
    FullCalendarModule,
  ],
  exports:[
    BusinessSetupComponent,
    ManageServicesComponent,
    AddEditServicesComponent,
    ManageCustomersComponent,
    ManageCalenderComponent,
    ManageCouponsComponent,
    ManageIntegrationsComponent,
    ManageMypageComponent,
    ManagePaymentsComponent,
    ManageSettingsComponent,
    ManagemyBillingComponent,
    ManagemyNotificationsComponent,
    ManagemyReportsComponent,
    CustomCalendarComponent,
    MyBizPageComponent
  ],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManageBusinessModule { }
