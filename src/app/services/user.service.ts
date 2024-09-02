import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  onSnapshot,
} from '@angular/fire/firestore';
import { UserProfile } from '../models/users';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);
  data = {
    address: {
      city: 'Köln',
      street: 'straße 2',
    },
    color: '#000000',
    displayName: 'Tester',
    email: 'test@gmail.com',
    name: {
      firstName: 'tester',
      lastName: 'testing',
    },
    password: 'test123',
    profileImage: '',
    uid: '',
  };

  users: UserProfile[] = [];
  unsubUsers;
  private usersSubject = new BehaviorSubject<UserProfile[]>([]);

  constructor() {
    this.unsubUsers = this.subUsersList();
  }

  async addUser() {
    const docRef = collection(this.firestore, 'users');
    const querySnapshot = await addDoc(docRef, this.data);
    await setDoc(querySnapshot, { ...this.data, uid: querySnapshot.id });
  }

  async getAllUsers() {
    let allUsers: UserProfile[] = [];
    const docRef = collection(this.firestore, 'users');
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      allUsers.push(userData);
    });

    console.log(allUsers);
    return allUsers;
  }

  async updateUser(user: {}, userId: string) {
    const userRef = doc(collection(this.firestore, 'users'), userId);
    await updateDoc(userRef, user);
  }

  get users$() {
    return this.usersSubject.asObservable();
  }

  subUsersList() {
    const docRef = collection(this.firestore, 'users');
    return onSnapshot(docRef, (list) => {
      this.users = [];
      list.forEach(user => {
        this.users.push(this.setUserObject(user.data()));
      })
      this.usersSubject.next(this.users);
    });
  }

  setUserObject(obj: any): UserProfile {
    return {
      address: {
        city: obj.address.city,
        street: obj.address.street,
      },
      email: obj.email,
      name: obj.name,
      active: obj.active,
      password: obj.password,
      profileImage: obj.profileImage,
      uid: obj.uid,
    }
  }
}
