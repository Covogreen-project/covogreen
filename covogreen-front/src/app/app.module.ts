import 'rxjs/add/operator/map';
import 'rxjs/Rx';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule, Http, RequestOptions } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import {
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MATERIAL_SANITY_CHECKS,
    MatSliderModule,
    MatFormFieldModule
} from '@angular/material';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing/app-routing.module';

import { SelectModule } from 'ng-select';

import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';

import {AuthentificationService} from '../services/authentification.service';
import {GuardService} from '../services/guard.service';
import {GuardAdminService} from '../services/guard-admin.service';
import {UserService} from '../services/user.service';
import {CarService} from '../services/car.service';
import {AdminService} from '../services/admin.service';
import { RechercheTrajetService } from '../services/recherche-trajet.service';

import { UserComponent } from './user/user.component';
import { NewuserComponent } from './user/newuser.component';

import { AdminComponent } from './admin/admin.component';
import { RechercheFormComponent } from './recherche-form/recherche-form.component';
import { RecherchePageComponent } from './recherche-page/recherche-page.component';

import { NewCarComponent } from './car/newcar.component';
import {CreateJourneyComponent} from './journey/create-journey/create-journey.component';
import { TestComponent } from './test/test.component';
import { AdminUserComponent } from './admin-user/admin-user.component';
import { AdminUserDetailComponent } from './admin-user-detail/admin-user-detail.component';


@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpModule,
        JsonpModule,
        SelectModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSliderModule,
        MatFormFieldModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        UserComponent,
        NewuserComponent,
        AdminComponent,
        NewCarComponent,
        CreateJourneyComponent,
        RechercheFormComponent,
        RecherchePageComponent,
        NewCarComponent,
        TestComponent,
        AdminUserComponent,
        AdminUserDetailComponent
    ],
    providers: [
        AuthentificationService,
        GuardService,
        GuardAdminService,
        UserService,
        CarService,
        AdminService,
        {
            provide: MATERIAL_SANITY_CHECKS,
            useValue: false
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
