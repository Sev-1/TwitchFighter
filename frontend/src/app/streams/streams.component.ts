import { Component, OnInit, SecurityContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IStream } from 'src/app/streams/models/stream.model'
import { mockStreams } from 'src/app/streams/models/stream.mock'
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.css']
})
export class StreamsComponent implements OnInit {
  streams: IStream[];

  constructor(
    private sanitizer: DomSanitizer
  ) { 
    this.sanitizer = sanitizer;
    this.streams = mockStreams;
  }

  async ngOnInit() {
    this.streams.forEach(stream => {
      stream.href = "https://www.twitch.tv/" + stream.twitchUserName;
      stream.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(stream.streamUrl);
      stream.safeHref = this.sanitizer.bypassSecurityTrustResourceUrl(stream.href);
      console.log("Url " + stream.streamUrl + " -- safe url: " + stream.safeUrl);
      console.log("href of " + stream.href + " -- safe url: " + stream.safeHref);
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private streamBaseUrl: string = `${environment.baseUrl}/streams`;

  constructor(
    private http: HttpClient
  ) { }

  async getStreams() : Promise<IStream[]>{
    const url = this.streamBaseUrl;
    try {
      return await this.http.get<IStream[]>(url).toPromise<IStream[]>();
    } catch {
      return Promise.resolve([]);
    }
  }
}