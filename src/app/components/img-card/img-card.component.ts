import {Component, Input} from '@angular/core';
import {StorageService} from "../../services/storage.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Image} from "../../models/image.model";

@Component({
    selector: 'app-img-card',
    templateUrl: './img-card.component.html',
    styleUrls: ['./img-card.component.scss']
})
export class ImgCardComponent {

    @Input() imageFile!: Image;

    constructor(private storage: StorageService,
                private toast: MatSnackBar) {
    }

    deleteFileUpload(fileUpload: Image): void {
        const result = confirm("Are you sure to delete?");
        if (result) {
            this.storage.deleteFile(fileUpload);
            this.toast.open('Success - Image deleted!',
                '', {panelClass: 'toast-success'});
        }
    }
}
