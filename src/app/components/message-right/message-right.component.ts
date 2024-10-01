import { Component, Input, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { ChannelService } from '../../services/channel.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message';
import { BehaviorSubject, map, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/users';
import { ThreadService } from '../../services/thread.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UtilityService } from '../../services/utility.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message-right',
  standalone: true,
  imports: [PickerModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './message-right.component.html',
  styleUrl: './message-right.component.scss',
})
export class MessageRightComponent implements OnInit {
  private _items = new BehaviorSubject<Message>({} as Message);

  @Input() set getMessage(value: Message) {
    this._items.next(value);
  }

  get currentMessage(): Message {
    return this._items.getValue();
  }

  public usersSubscription!: Subscription;
  settingIsOpen: boolean = false;
  editMessageIsOpen: boolean = false;
  allUsers: UserProfile[] = [];
  messageUser: UserProfile = {} as UserProfile;
  currentChannelId: string = '';
  currentUserId: string = '';

  formattedTime?: string;
  formattedCurrMsgTime?: string;
  formattedThreadTime?: string;
  allThreads: any[] = [];

  emojiPickerRight1: boolean = false;
  emojiPickerRight2: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public profileService: ProfileService,
    public channelService: ChannelService,
    public userService: UserService,
    public threadService: ThreadService,
    public utilityService: UtilityService,
    public messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.usersSubscription = this.userService.users$
      .pipe(
        map((users) =>
          users.find((user) => user.uid === this.currentMessage.sentBy)
        )
      )
      .subscribe((currUser) => {
        if (currUser) {
          this.messageUser = currUser;
        }
      });

    this.route.paramMap.subscribe(async (paramMap) => {
      const id = paramMap.get('id');
      if (id && this.currentMessage.uid) {
        this.currentChannelId = id;
        this.allThreads = await this.threadService.getAllThreads(
          this.currentChannelId,
          this.currentMessage.uid
        );
      }
    });

    this.route.parent?.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      if (id) {
        this.currentUserId = id;
      }
    });

    this.formattedCurrMsgTime = this.utilityService.getFormattedTime(
      this.currentMessage.sentAt!
    );
    this.formattedThreadTime = this.utilityService.getFormattedTime(
      this.currentMessage.lastThreadReply!
    );
  }


  openProfile() {
    this.profileService.openMainProfile();
  }

  openSettings() {
    if (this.settingIsOpen) {
      this.settingIsOpen = false;
    } else {
      this.settingIsOpen = true;
    }
  }

  closeSettings() {
    this.settingIsOpen = false;
  }

  editMessage() {
    this.editMessageIsOpen = true;
  }

  closeEditMessage() {
    this.editMessageIsOpen = false;
    this.settingIsOpen = false;
  }

  selectEmoji(event: any, emojiPicker: any){
    this.messageService.giveReaction(event.emoji.native, this.userService.mainUser.uid, this.currentMessage, this.currentChannelId);
    emojiPicker = false;
  }
}
