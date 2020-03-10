import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreamsComponent } from './streams/streams.component';
import { HomeComponent } from './home/home.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { StoreComponent } from './store/store.component';
import { UserComponent } from './user/user.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'streams', component: StreamsComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'store', component: StoreComponent },
  { path: 'user/:username', component: UserComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
