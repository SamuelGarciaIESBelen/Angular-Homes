import { Component, inject, AfterViewInit, OnDestroy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service';
import { HousingLocation } from '../housinglocation';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-details',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements AfterViewInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  housingService = inject(HousingService);
  housingLocation: HousingLocation | undefined;
  private map: L.Map | undefined;
  
  formData = JSON.parse(localStorage.getItem("formData") ?? "{}");
  
  applyForm = new FormGroup({
    firstName: new FormControl("", Validators.required),
    lastName: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, Validators.email]),
  });
  
  constructor() {
    const housingLocationId = parseInt(this.route.snapshot.params['id'], 10);
    
    this.housingService.getHousingLocationById(housingLocationId).then((housingLocation) => {
      this.housingLocation = housingLocation;
      this.initializeMap();
    });

    if (localStorage.getItem("formData")) {
      this.applyForm.setValue(JSON.parse(localStorage.getItem("formData") ?? "{}"));
    }
  }
  
  ngAfterViewInit(): void {
    if (this.housingLocation) {
      this.initializeMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap(): void {
    if (this.housingLocation && this.housingLocation.coordinates) {
      const latitude = this.housingLocation.coordinates.latitude;
      const longitude = this.housingLocation.coordinates.longitude;

      if (!this.map) {
        this.map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          minZoom: 17,
          maxZoom: 22,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
      }

      L.marker([latitude, longitude]).addTo(this.map);
    }
  }
  
  submitApplication() {
    if (this.applyForm.valid) {
      this.housingService.submitApplication(
        this.applyForm.value.firstName ?? '',
        this.applyForm.value.lastName ?? '',
        this.applyForm.value.email ?? '',
      );
      localStorage.setItem("formData", JSON.stringify(this.applyForm.value));
    }
  }
}