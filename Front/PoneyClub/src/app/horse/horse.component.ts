import { Component, OnInit } from '@angular/core';
import { IHorse } from '../_classes/ihorse';
import { HorseService } from '../services/api/horse.service';
import { User } from '../_classes';
import { AuthenticationService } from '../services/authentification.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertComponent} from "../_alert/alert.component";
import {AlertService} from "../services/alert.service";

@Component({
  selector: 'app-horse',
  templateUrl: './horse.component.html',
  styleUrls: ['./horse.component.css']
})
export class HorseComponent implements OnInit {

  horse: IHorse = {
    id: 0,
    name: ''
  }
  newHorse: IHorse = {
    id: 0,
    name: ''
  }
  horses: IHorse[] = [];
  currentUser: User = null;
  newHorsePanel = false;
  submitted = false;
  horseFormCreation: FormGroup;
  horseFormUpdate: FormGroup;

  constructor(private horseService: HorseService, private authenticationService: AuthenticationService, private alertService: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.currentUserValue;
    this.submitted = false;
    this.horseFormCreation = this.formBuilder.group({
      horseNameCreation: ['', Validators.required],
    });
    this.horseFormUpdate = this.formBuilder.group({
      horseNameUpdate: ['', Validators.required],
    });
    this.horseService.getHorses().subscribe(
      data => {
        this.horses = data;
        this.alertService.success('All horse refreshed');
        this.alertService.clearAfter(1500);
      },
      error => {
        console.log("An error occured while retrieving horses");
      }
    )
  }

  addHorse() {
    this.newHorse.id = 0;
    this.newHorse.name = '';
    this.newHorsePanel = true;
    // this.submitted = false;
  }

  createHorse() {
    this.submitted = true;

    if(this.horseFormCreation.invalid){
      return;
    }
    this.horseService.createHorse(this.newHorse.name, this.currentUser.id).subscribe(
      data => {
        this.horse = data;
        this.horses.push(this.horse);
        this.newHorsePanel = false;
        this.horseFormCreation.reset();
        this.alertService.success("Horse created success");
        this.alertService.clearAfter( 2000);
      },
      error => {
        console.log("An error has occured while creating horse");
      }
    )
    this.submitted = false;
  }

  deleteHorse(horse: IHorse) {
    this.horseService.deleteHorse(horse, this.currentUser.id).subscribe(
      data => {
        let horseIndex = this.horses.indexOf(horse);
        this.horses.splice(horseIndex, 1);
        this.alertService.success("Horse delete success");
        this.alertService.clearAfter(1500);
      },
      error => {
        console.log("error while deleting horse");
      }
    )
  }

  updateHorse(horse: IHorse){
    if(this.horseFormUpdate.get('horseNameUpdate')){
      return;
    }
    if (horse.id != 0) {
      this.horseService.updateHorse(horse, this.currentUser.id).subscribe (
        data => {
          this.alertService.success("Horse name updated");
          this.alertService.clearAfter(3000);
        },
        error => {
          console.log("Error occured while updating horse name");
        }
      )
    }
  }

  get fC() { return this.horseFormCreation.controls; }

}