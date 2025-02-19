import { Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HousingService } from '../housing.service';
import { HousingLocation } from '../housinglocation';

@Component({
  selector: 'app-form-houses',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./form-houses.component.html",
  styles: ``
})
export class FormHousesComponent {

  private housingService:  HousingService = inject(HousingService);
  listaCasas: HousingLocation[] = [];

  constructor() {
    this.housingService.getAllHousingLocationsHTTP().subscribe(casas => this.listaCasas = casas);
  }
  
  createForm = new FormGroup({
    name: new FormControl("", Validators.required),
    city: new FormControl("", Validators.required),
    state: new FormControl("", Validators.required),
    units: new FormControl("", [Validators.required, Validators.min(1)]),
    wifi: new FormControl(""),
    laundry: new FormControl(""),
    security: new FormArray([]),
  });

  submit() {
    if (this.createForm.valid) {
      let wifiValue: boolean = false;
      let laundryValue: boolean = false;

      if (this.createForm.value.wifi) { wifiValue = true }
      if (this.createForm.value.laundry) { laundryValue = true }

      const newHome = {
        id: this.listaCasas.length,
        name: this.createForm.value.name!,
        city: this.createForm.value.city!,
        state: this.createForm.value.state!,
        photo: "",
        availableUnits: Number(this.createForm.value.units!),
        wifi: wifiValue,
        laundry: laundryValue,
        coordinates: { latitude: 0, longitude: 0 },
        security: this.createForm.value.security ?? [],
      }

      this.housingService.addHousingLocation(newHome).subscribe(() => this.listaCasas.push(newHome))
      this.createForm.reset();
    }
  }
}
