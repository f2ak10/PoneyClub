import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../_classes';
import { Icourse } from '../_classes/icourse';
import { ICoursePlace } from '../_classes/icourseplace';
import { IError } from '../_classes/ierror';
import {AlertService} from '../services/alert.service';
import { CoursePlaceService } from '../services/api/course-place.service';
import { CourseService } from '../services/api/course.service';
import { AuthenticationService } from '../services/authentification.service';
import { DateTimePipe } from '../share/pipe/date-time.pipe';
import { UserService } from '../services/api/user.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
})
export class CourseComponent implements OnInit {

  public course: Icourse = {
    id: 0,
    title: '',
    startDateTime: '',
    endDateTime: '',
    levelStudying: '',
    maxStudent: 0,
    availablePlaces: 0,
    teacher: null,
  };
  private newCourse: Icourse = {
    id: 0,
    title: '',
    startDateTime: '',
    endDateTime: '',
    levelStudying: '',
    maxStudent: 0,
    availablePlaces: 0,
    teacher: null,
  };
  private userAll: User = {
    id: 0,
    firstName: 'All',
    lastName: 'teachers',
    email: '',
    password: '',
    mobile: '',
    licenceNum: '',
    role: '', 
    statut: '',
    token: ''
  };
  private selectedCourse: Icourse;
  public courses: Icourse[] = [];
  public currentUser: User = null;
  public bCourseAdd = false;
  public submitted = false;
  public startDateTime: string = null;
  public endDateTime: string = null;
  public courseForm: FormGroup;
  public coursePlaces: ICoursePlace[] = [];
  public selectedCoursePlaces: ICoursePlace[] = [];
  private localError: IError;
  teachers: User[] = [];
  private selectedTeacher: User = null;
  private selectedLevel: number = 0;
  levels = [1, 2, 3, 4, 5, 6, 7, 8];
  level= null;

  constructor(private courseService: CourseService, private coursePlaceService: CoursePlaceService,
     private authenticationService: AuthenticationService,
     private formBuilder: FormBuilder, private alertService: AlertService,
     private userService: UserService) { }

  public ngOnInit(): void {
    this.currentUser = this.authenticationService.currentUserValue;
    this.submitted = false;
    this.courseForm = this.formBuilder.group({
      title: ['', Validators.required],
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      level: ['', [Validators.required, Validators.min(1), , Validators.max(8)]],
      maxStudent: ['', [Validators.required, Validators.min(1), , Validators.max(10)] ],
    });
    this.getCourses();
    this.getUserPlanning();
    this.getTeachers();
  }

  getUserPlanning() {
    this.coursePlaceService.getUserPlanning(this.authenticationService.currentUserValue.email).subscribe(
      (data) => {
        this.coursePlaces = data;
      },
      (error) => {
        this.localError = error;
        this.alertService.error(this.localError.error);
      });
  }

  getCourses() {
    this.courseService.getCourses().subscribe(
      (data) => {
        this.courses = data;
        for (const course of this.courses) {
          this.courseService.getAvailablePlaces(course.id).subscribe(
            data => {
              course.availablePlaces = data;
              this.alertService.success('Course refresh successfull');
              this.alertService.clearAfter(1500);
            },
            (error) => {
             this.localError = error;
             this.alertService.error(this.localError.error);
            },
          );
        }
      },
      (error) => {
        this.localError = error;
        this.alertService.error(this.localError.error);
      },
    );
  }

  getTeachers() {
    this.userService.getTeachers().subscribe(
      data => {
        console.log(data);
        this.teachers = data;
        this.teachers.push(this.userAll);
      },
      error => {
        this.localError = error;
        this.alertService.error(this.localError.error);
      }
    )
  }

  addCourse() {
    this.bCourseAdd = true;
    this.newCourse.title = '';
    this.newCourse.startDateTime = '';
    this.newCourse.endDateTime = '';
    this.newCourse.levelStudying = '';
    this.newCourse.maxStudent = null;
    this.newCourse.teacher = null;
    this.startDateTime = '';
    this.endDateTime = '';
  }

  createCourse() {
    this.newCourse.startDateTime = new DateTimePipe().transform(this.startDateTime);
    this.newCourse.endDateTime = new DateTimePipe().transform(this.endDateTime);

    this.submitted = true;

    if (this.courseForm.invalid) {
      return;
    }
    this.courseService.addCourse(this.newCourse, this.currentUser.id).subscribe(
      (data) => {
        this.course = data;
        this.course.availablePlaces = this.course.maxStudent;
        this.courses.push(data);
        this.alertService.success('Course well added');
        this.alertService.clearAfter(1500);
      },
      (error) => {
        this.localError = error;
        this.alertService.error(this.localError.error);
      },
    );
    this.bCourseAdd = false;
    this.submitted = false;
  }

  subscribe(course: Icourse) {
    this.courseService.registerToCourse(this.currentUser, course.id).subscribe (
      (data) => {
        this.coursePlaces.push(data);
        this.alertService.success('Subscription success');
        this.alertService.clearAfter(1500);
      },
      (err) => {
        this.localError = err;
        this.alertService.error(this.localError.error);
      },
    );
  }

  unsubscribe(coursePlace: ICoursePlace) {
    this.coursePlaceService.unsubscribeCourse(coursePlace.id).subscribe (
      (data) => {
        const indexCoursePlace = this.coursePlaces.indexOf(coursePlace);
        this.coursePlaces.splice(indexCoursePlace, 1);
        this.alertService.success('Unsubscribe success');
        this.alertService.clearAfter(1500);
      },
      (err) => {
        this.localError = err;
        this.alertService.error(this.localError.error);
      },
    );
  }

  selectCourse(course: Icourse) {
    this.selectedCourse = course;
    this.coursePlaceService.getTeacherCoursePlaces(this.selectedCourse.teacher.id, this.selectedCourse.id).subscribe(
      (data) => {
        this.selectedCoursePlaces = data;
      },
      (error) => {
        this.localError = error;
        this.alertService.error(this.localError.error);
      },
    );
  }

  selectTeacher(teacher: User) {
    this.selectedTeacher = teacher;
  }

  selectLevel(level: number) {
    this.level = level;
  }

  mapHorseToCourse(coursePlace: ICoursePlace) {
    this.coursePlaceService.mapHorseToCourse(coursePlace).subscribe(
      (data) => {
        this.alertService.success('Horse well mapped');
        this.alertService.clearAfter(1500);
      },
      (error) => {
        this.localError = error;
        this.alertService.error(this.localError.error);
      },
    );
  }

  filter() {
    this.courses = null;
    if (this.selectedTeacher.firstName == 'All' && this.selectedTeacher.lastName == 'teachers') {
      this.getCourses();
    } else {
      this.courseService.findCourseByTeacher(this.selectedTeacher.id).subscribe(
        data => {
          this.courses = data;
        },
        error => {
          this.localError = error;
          this.alertService.error(this.localError.error);
        }
      )
    }
  }

  get f() { return this.courseForm.controls; }

}