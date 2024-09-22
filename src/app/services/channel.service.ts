import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Channel } from '../models/channels';
import { UserProfile } from '../models/users';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { MessageService } from './message.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  private channelSubject = new BehaviorSubject<any[]>([]);
  channels: any[] = [];

  constructor(private route: ActivatedRoute, public messageService: MessageService) {
    this.subChannelList();
  }

  async createNewChannel(
    newChannel: any,
    chosen: UserProfile[],
    currentUserId: string
  ) {
    let data: Channel = {
      name: newChannel.name,
      description: newChannel.description,
      usersIds: [currentUserId],
      uid: '',
      createdBy: currentUserId,
    };

    chosen.forEach((user: any) => {
      data.usersIds.push(user.uid);
    });

    const ref = collection(this.firestore, 'channels');
    const querySnapshot = await addDoc(ref, data);
    const uid = querySnapshot.id;
    await setDoc(querySnapshot, { ...data, uid });
    alert('channel created');
  }

  get channels$() {
    return this.channelSubject.asObservable();
  }

  subChannelList() {
    const docRef = collection(this.firestore, 'channels');
    return onSnapshot(docRef, (list) => {
      this.channels = [];
      list.forEach((doc) => {
        this.channels.push(doc.data());
      });
      this.channelSubject.next(this.channels);
    });
  }

  async addUser(currChannelID: string, selectedUsers: UserProfile[]) {
    const docRef = doc(this.firestore, 'channels', currChannelID);
    selectedUsers.forEach(async (user) => {
      await updateDoc(docRef, {
        usersIds: arrayUnion(user.uid),
      });
    });
  }

  updateChannel(uid: string, type: string, data: any) {
    console.log(data);
    if (type == 'name') {
      const docRef = doc(this.firestore, 'channels', uid);
      updateDoc(docRef, {
        name: data.name,
      });
    } else if (type == 'description') {
      const docRef = doc(this.firestore, 'channels', uid);
      updateDoc(docRef, {
        description: data.description,
      });
    }
  }

  leaveChannel(uid: string, currentUserId: string) {
    const docRef = doc(this.firestore, 'channels', uid);
    updateDoc(docRef, {
      usersIds: arrayRemove(currentUserId),
    });
  }

  private routeSub: Subscription = new Subscription;
  private channelSubscription: Subscription = new Subscription;
  currentChannelId: string = '';
  allChannels: any[] = [];
  currentChannel: Channel = {} as Channel;


  getChannel() {
    const childRoute = this.route.snapshot.firstChild?.firstChild;

    if (childRoute) {
      this.currentChannelId = childRoute.params['id']; // Abrufen der Kanal-ID

      this.channelSubscription = this.channels$.subscribe(channels => {
        this.allChannels = channels;

        let filteredChannel = this.allChannels.find((channel) => {
          return channel.uid === this.currentChannelId;
        });
        if (filteredChannel) {
          this.currentChannel = filteredChannel;
        }
      });
    };
  }


}

