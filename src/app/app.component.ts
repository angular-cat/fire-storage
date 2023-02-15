import {Component, OnInit} from '@angular/core';
import {StorageService} from "./services/storage.service";
import {map} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Image} from "./models/image.model";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

    selectedFile?: File;
    fileName: File | undefined;
    currentFileUpload?: Image;
    imageForm!: FormGroup;
    fileUploads?: any[];
    percentage = 0;
    isProgress: boolean = false;
    isLoading: boolean = true;

    constructor(private storage: StorageService,
                private formBuilder: FormBuilder,
                private toast: MatSnackBar) {
    }

    ngOnInit(): void {
        this.loadImages();
        this.buildCategoryForm();
    }

    loadImages() {
        this.isLoading = true;
        this.storage.getFiles().snapshotChanges().pipe(
            map(changes =>
                changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
            )
        ).subscribe(fileUploads => {
            this.fileUploads = fileUploads;
            this.isLoading = false;
        });
    }

    private buildCategoryForm(): void {
        this.imageForm = this.formBuilder.group({
            imgDescription: ['', {
                validators: [
                    Validators.required, Validators.minLength(3), Validators.maxLength(15)]
            }],
        });
    }

    get imgDescription() {
        return this.imageForm.controls['imgDescription'];
    }

    selectFile(event: any): void {
        this.selectedFile = event.target.files.item(0);
        if (this.selectedFile) {
            if (!this.validateFile(this.selectedFile.name)) {
                this.toast.open('Selected file format is not supported!',
                    '', {panelClass: 'toast-error'});
                this.selectedFile = undefined;
                this.fileName = undefined;
                return
            }
        }
    }

    upload(): void {
        this.isProgress = true
        if (this.selectedFile) {
            this.currentFileUpload = new Image(this.selectedFile);
            this.storage.pushFileToStorage(this.currentFileUpload, this.imgDescription.value).subscribe(
                percentage => {
                    this.percentage = Math.round(percentage ? percentage : 0);
                    if (this.percentage === 100) {
                        this.closeForm();
                        this.toast.open('Success You add image to firebase!',
                            '', {panelClass: 'toast-success'});
                    }
                },
                error => {
                    this.closeForm();
                    this.toast.open(error,
                        '', {panelClass: 'toast-error'});
                }
            );
        }
    }

    validateFile(name: String) {
        let ext = name.substring(name.lastIndexOf('.') + 1);
        const allImages: Array<string> = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
        return allImages.indexOf(ext) > -1
    }

    closeForm() {
        this.isProgress = false;
        this.selectedFile = undefined;
        this.fileName = undefined;
        this.imageForm.reset();
    }
}
