import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessSetupComponent } from './business-setup/business-setup.component';
import { MyBizPageComponent } from './my-biz-page/my-biz-page.component';

const routes: Routes = [
  { path: '', component: BusinessSetupComponent },  // Set default route to BusinessSetupComponent
  { path: 'business', component: BusinessSetupComponent } , // Ensure the path is correct
  { path: 'business-page', component: MyBizPageComponent }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
