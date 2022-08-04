import { Injectable } from '@nestjs/common';

import { initializeApp } from 'firebase/app';

import { getStorage, uploadBytes, ref, deleteObject } from 'firebase/storage';

import { IFile } from '../interfaces/firebase.interfase';

import { configFirebase } from './config';

@Injectable()
export class AdminFirebase {
  private readonly MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
  };

  private readonly firebase = initializeApp(configFirebase);

  /*
   * UPLOAD ONE FILE FROM FIREBAS
   */
  async uploadImage(file: IFile): Promise<string> {
    const name = file.originalname.split(' ').join('_'); // delete all space
    const extention = this.MIME_TYPES[file.mimetype];

    const fileName = name + Date.now() + '.' + extention; // generate new file name

    const storage = getStorage(this.firebase);

    const storageRef = ref(storage, fileName);

    const uploadFile = await uploadBytes(storageRef, file.buffer)
      .then((event) => {
        return event.metadata.name;
      })
      .catch((err) => {
        return err;
      });

    // const mountainImagesRef = ref(
    //   storage,
    //   `https://firebasestorage.googleapis.com/v0/b/excel-tosa.appspot.com/o/${fileName}`,
    // );
    return uploadFile;
  }

  /*
   * DELETE ONE FILE FROM FIREBASE
   */
  async deleteFile(nameFile: string): Promise<string> {
    const storage = getStorage(this.firebase);

    const storageRef = ref(storage, nameFile);

    const deleteFile = await deleteObject(storageRef)
      .then(() => {
        return `File ${nameFile} was deleted successfully`;
      })
      .catch(() => {
        return `File ${nameFile} was not deleted... probleme`;
      });

    return deleteFile;
  }
}
