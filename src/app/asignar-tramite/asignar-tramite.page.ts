import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';


@Component({
  selector: 'app-new-task',
  templateUrl: './asignar-tramite.html',
  styleUrls: ['./asignar-tramite.page.scss'],
})
export class NewTaskPage implements OnInit {

  validations_form: FormGroup;
  image: any;

  validation_messages = {
    'dinero': [
      { type: 'required', message: 'El dinero es obligatorio.' },
    
      
    ],
    'description': [      
      { type: 'minlength', message: 'La descripcion debe tener al menos 25 caracteres.' }
    ],

    'tramitador': [
      { type: 'required', message: 'El tramitador ha sido asignado' },
    
      
    ],
  }
    
  


  constructor(
    private imagePicker: ImagePicker,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public router: Router,
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private webview: WebView
  ) { }


  

  ngOnInit() {
    this.resetFields();
    this.validations_form = this.formBuilder.group({
      description: new FormControl('', Validators.compose([

        Validators.minLength(25),
       
      ])),
      dinero: new FormControl('', Validators.compose([
        
        Validators.required
      ])),
    });
   
  }



  resetFields(){
    this.image = "./assets/imgs/default_image.jpg";
    this.validations_form = this.formBuilder.group({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      dinero: new FormControl('', Validators.required),
      direccion: new FormControl('', Validators.required)

      

    });
  }

  onSubmit(value){
    let data = {
      title: value.title,
      description: value.description,
      dinero: value.dinero,
            
      image: this.image
    }
    this.firebaseService.createTask(data)
    .then(
      res => {
        this.router.navigate(["/home"]);
      }
    )
  }

  openImagePicker(){
    this.imagePicker.hasReadPermission()
    .then((result) => {
      if(result == false){
        // no callbacks required as this opens a popup which returns async
        this.imagePicker.requestReadPermission();
      }
      else if(result == true){
        this.imagePicker.getPictures({
          maximumImagesCount: 1
        }).then(
          (results) => {
            for (var i = 0; i < results.length; i++) {
              this.uploadImageToFirebase(results[i]);
            }
          }, (err) => console.log(err)
        );
      }
    }, (err) => {
      console.log(err);
    });
  }

  async uploadImageToFirebase(image){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    const toast = await this.toastCtrl.create({
      message: 'Image was updated successfully',
      duration: 3000
    });
    this.presentLoading(loading);
    let image_src = this.webview.convertFileSrc(image);
    let randomId = Math.random().toString(36).substr(2, 5);

    //uploads img to firebase storage
    this.firebaseService.uploadImage(image_src, randomId)
    .then(photoURL => {
      this.image = photoURL;
      loading.dismiss();
      toast.present();
    }, err =>{
      console.log(err);
    })
  }

  async presentLoading(loading) {
    return await loading.present();
  }

}
