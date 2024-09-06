import { Component, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/users';
import { ProfileUserComponent } from '../profile-user/profile-user.component';

@Component({
  selector: 'app-direct-chat',
  standalone: true,
  imports: [ProfileUserComponent],
  templateUrl: './direct-chat.component.html',
  styleUrl: './direct-chat.component.scss'
})
export class DirectChatComponent {
  firestore: Firestore = inject(Firestore);
  public usersSubscription!: Subscription;
  allUsers: UserProfile[] = [];
  currentUser: UserProfile = {
    uid: '',
  };
  profileIsOpen: boolean = false;

  constructor(public userService: UserService) {}

  async ngOnInit() {
    this.usersSubscription = this.userService.users$.subscribe(users => {
      this.allUsers = users;

      let filteredUser = this.allUsers.find((user) => {
        return user.uid === 'AVMklDakbn3jph5hNNyf';
      });
      if (filteredUser) {
        this.currentUser = filteredUser;
      }
    });
  }

  openProfile(){
    this.profileIsOpen = true;
  }

  closeProfile(){
    this.profileIsOpen = false;
  }
}
