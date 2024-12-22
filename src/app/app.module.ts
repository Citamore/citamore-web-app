import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageBusinessModule } from './business-setup/manage-business.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FullCalendarModule } from '@fullcalendar/angular';


@NgModule({
  declarations: [
    AppComponent  // Declare AppComponent here
  ],
  imports: [
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,  // Required for animations
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,  // Ensure ReactiveFormsModule is here
    DragDropModule,
    ManageBusinessModule,  // Ensure ManageBusinessModule is imported here
    HttpClientModule,
    AppRoutingModule,
    FullCalendarModule
  ],
  providers: [],
  bootstrap: [AppComponent]  // Bootstrap the AppComponent
})
export class AppModule { }
