import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {
  MdButtonModule, MdCardModule, MdIconModule, MdListModule, MdProgressBarModule,
  MdToolbarModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MdCardModule,
    MdButtonModule,
    MdToolbarModule,
    MdIconModule,
    FlexLayoutModule,
    MdListModule,
    MdProgressBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
