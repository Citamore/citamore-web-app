import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessSetupComponent } from './business-setup.component';
import { MyBizPageComponent } from '../my-biz-page/my-biz-page.component';

const routes: Routes = [
  { path: 'business', component: BusinessSetupComponent },  // Route inside AboutModule
  { path: 'business-page', component: MyBizPageComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { }
