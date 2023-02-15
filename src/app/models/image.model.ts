export class Image {
    key!: string;
    imgName!: string;
    imgURL!: string;
    imgDescription!: string;
    imgFile: File;

    constructor(file: File) {
        this.imgFile = file;
    }
}
