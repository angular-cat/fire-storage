import {Injectable} from '@angular/core';
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {AngularFireDatabase, AngularFireList} from "@angular/fire/compat/database";
import {Image} from "../models/image.model";
import {finalize, Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private basePath = 'images/';

    constructor(private firebase: AngularFireDatabase,
                private storage: AngularFireStorage) {
    }

    pushFileToStorage(fileUpload: Image, description: string): Observable<number | undefined> {

        let safeName = fileUpload.imgFile.name.replace(/([^a-z0-9.]+)/gi, ''); // stripped of spaces and special chars
        let timestamp = Date.now(); // ex: '1598066351161'
        const uniqueSafeName = timestamp + '_' + safeName;
        const filePath = this.basePath + uniqueSafeName;
        const storageRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, fileUpload.imgFile);

        uploadTask.snapshotChanges().pipe(
            finalize(() => {
                storageRef.getDownloadURL().subscribe(downloadURL => {
                    fileUpload.imgURL = downloadURL;
                    fileUpload.imgName = uniqueSafeName;
                    fileUpload.imgDescription = description;
                    this.saveFileData(fileUpload);
                });
            })
        ).subscribe();

        return uploadTask.percentageChanges();
    }

    private saveFileData(fileUpload: Image): void {
        this.firebase.list(this.basePath).push(fileUpload);
    }

    getFiles(): AngularFireList<Image> {
        return this.firebase.list(this.basePath);
    }

    deleteFile(fileUpload: Image): void {
        this.deleteFileDatabase(fileUpload.key)
            .then(() => {
                this.deleteFileStorage(fileUpload.imgName);
            })
            .catch(error => console.log(error));
    }

    private deleteFileDatabase(key: string): Promise<void> {
        return this.firebase.list(this.basePath).remove(key);
    }

    private deleteFileStorage(name: string): void {
        const storageRef = this.storage.ref(this.basePath);
        storageRef.child(name).delete();
    }
}
