import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  displayedColumns = ['rank', 'name', 'totalBet', 'totalWins'];
  dataSource: LeaderboardUser[] = [];
  fetchedData: ResultLeaderboard[] = [];

  constructor(
    private router: Router,
    private betsService: BetsService,
  ) { }

  async ngOnInit() {
    this.fetchedData = await this.betsService.getStreams();
    let rank = 1;
    const elements: LeaderboardUser[] = [];
    this.fetchedData.forEach(data => {
      elements.push({
        rank,
        name: data.userName,
        totalBet: data.totalBet,
        totalWins: data.totalWon,
      });
      rank++;
    });
    this.dataSource = elements;
    console.log(this.dataSource);
  }

  linkToUser(row) {
    this.router.navigate(['/user', row.name]);
  }
}

@Injectable({
  providedIn: 'root'
})
export class BetsService {
  private streamBaseUrl = `${environment.baseUrl}/bets`;

  constructor(
    private http: HttpClient
  ) { }

  async getStreams(): Promise<any[]> {
    const url = this.streamBaseUrl;
    try {
      return await this.http.get<any[]>(url).toPromise<any[]>();
    } catch {
      return Promise.resolve([]);
    }
  }
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  totalBet: number;
  totalWins: number;
}

interface ResultLeaderboard {
  _id: any;
  totalBet: number;
  totalWon: number;
  userName: string;
}
