import { Injectable } from '@nestjs/common';

import { initializeApp } from 'firebase/app';

import { getStorage, uploadBytes, ref } from 'firebase/storage';

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

  async uploadImage(file: IFile): Promise<string> {
    const name = file.originalname.split(' ').join('_'); // delete all space
    const extention = this.MIME_TYPES[file.mimetype];

    const fileName = name + Date.now() + '.' + extention; // generate new file name

    const storage = getStorage(this.firebase);

    const storageRef = ref(storage, fileName);

    const upload = await uploadBytes(storageRef, file.buffer)
      .then(() => {
        return fileName;
      })
      .catch((err) => {
        return err;
      });

    return upload;
  }
}
