import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import { Channel } from '../../../models/channels';
import { UserProfile } from '../../../models/users';
import { UtilityService } from '../../../services/utility.service';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './channel-edit.component.html',
  styleUrl: './channel-edit.component.scss',
})
export class ChannelEditComponent implements OnInit {
  private usersSubscription!: Subscription;
  private channelSubscription!: Subscription;
  channel: Channel = {} as Channel;
  channelCreatedBy: UserProfile = {} as UserProfile;
  editName: boolean = false;
  editDescription: boolean = false;
  updateChannel: any = {
    name: '',
    description: '',
  };
  currentUserID: string = '';

  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    public channelService: ChannelService,
    public utilityService: UtilityService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      if (id) {
        this.channelSubscription = this.channelService.channels$
          .pipe(
            map((channels) => channels.find((channel) => channel.uid === id))
          )
          .subscribe((currChannel) => {
            if (currChannel) {
              this.channel = currChannel;
              this.updateChannel.name = currChannel.name;
              this.updateChannel.description = currChannel.description;
              this.usersSubscription = this.userService.users$
                .pipe(
                  map((users) =>
                    users.find((user) => user.uid == currChannel.createdBy)
                  )
                )
                .subscribe((user) => {
                  if (user) {
                    this.channelCreatedBy = user;
                  }
                });
            }
          });
      }
    });

    this.route.parent?.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      if (id) {
        this.currentUserID = id;
      }
    });
  }

  close() {
    this.utilityService.closeComponent('channel-edit');
    this.editName = false;
    this.editDescription = false;
  }

  leaveChannel() {
    this.utilityService.closeComponent('channel-edit');
    this.channelService.leaveChannel(this.channel.uid, this.currentUserID);
  }

  edit(type: string) {
    if (type == 'name') {
      this.editName = true;
    }
    if (type == 'description') {
      this.editDescription = true;
    }
  }
  save(type: string) {
    if (type == 'name') {
      this.editName = false;
      this.channelService.updateChannel(
        this.channel.uid,
        type,
        this.updateChannel
      );
    }
    if (type == 'description') {
      this.editDescription = false;
      this.channelService.updateChannel(
        this.channel.uid,
        type,
        this.updateChannel
      );
    }
  }
}
