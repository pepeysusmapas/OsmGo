import { Component } from '@angular/core';
import { NavController, Platform, LoadingController } from '@ionic/angular';

import { ConfigService } from '../../services/config.service';
import { MapService } from '../../services/map.service';
import { OsmApiService } from '../../services/osmApi.service';
import { TranslateService } from '@ngx-translate/core';
import { TagsService } from 'src/app/services/tags.service';
import { DataService } from 'src/app/services/data.service';
import { IconService } from 'src/app/services/icon.service';


@Component({
  selector: 'page-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsPage {


  constructor(public navCtrl: NavController,
    public configService: ConfigService,
    public mapService: MapService,
    public platform: Platform,
    public tagsService: TagsService,
    public dataService: DataService,
    public iconService : IconService,
    public osmApi: OsmApiService,
    public loadingController: LoadingController) {

  }

  back() {
   this.navCtrl.back();
  }

  mapMarginBufferChange(e) {

    this.configService.setMapMarginBuffer(e.detail.value);
  }

  lockMapHeadingChange(e) {
    this.configService.setLockMapHeading(e.detail.checked);
  }

  followPositionChange(e) {
    this.configService.setFollowPosition(e.detail.checked);
  }

  defaultPrimarykeyWindowsChange(e) {
    this.configService.setDefaultPrimarykeyWindows(e.detail.value);
  }

  isDelayedChange(e) {
    this.configService.setIsDelayed(e.detail.checked);
  }

  filterWayByArea(e) {
    this.configService.setFilterWayByArea(e.detail.checked);
    // value en m²!
    this.mapService.toogleMesureFilter(this.configService.getFilterWayByArea(), 'way_fill', 5000, this.mapService.map);

  }

  filterWayByLength(e) {
    this.configService.setFilterWayByLength(e.detail.checked);
    // value en km!
    this.mapService.toogleMesureFilter(this.configService.getFilterWayByLength(), 'way_line', 0.2, this.mapService.map);
  }

  baseMapChange(e) {
    this.configService.setBaseSourceId(e.detail.value);
    this.mapService.displaySatelliteBaseMap(this.configService.config.baseMapSourceId, false);
  }



  displayOldTagIconChange(e){
    
    this.configService.setOldTagsIcon(e.detail.checked, this.configService.config.oldTagsIcon.year);
    if (e.detail.checked){
      this.mapService.showOldTagIcon(this.configService.config.oldTagsIcon.year);
    } else {
      this.mapService.hideOldTagIcon();
    }
    // this.mapService
  }

  yearOldTagIconChange(e){
    this.configService.setOldTagsIcon(this.configService.config.oldTagsIcon.display, e.detail.value);
    if (this.configService.config.oldTagsIcon.display){
      this.mapService.showOldTagIcon(e.detail.value);
    }
  }

  displayFixmeIconChange(e){
    this.configService.setDisplayFixmeIcon(e.detail.checked);
    if (e.detail.checked){
      this.mapService.showFixmeIcon();
    } else {
      this.mapService.hideFixmeIcon();
    }
  }

  addSurveyDateChange(e){
    this.configService.setAddSurveyDate(e.detail.checked);
  }


  languageUiChange(e){
    const newLlang = e.detail.value;
    this.configService.setUiLanguage(newLlang);
    
  }

  languageTagsChange(e){

    const newLlang = e.detail.value;
    this.configService.setLanguageTags(newLlang);
  }

  countryTagsChange(e){
    const newCountry = e.detail.value;
    this.configService.setCountryTags(newCountry);
   
        this.tagsService.loadTagsAndPresets$(this.configService.config.languageTags, newCountry)
            .subscribe( e => {
            
                console.log('New Config Loaded!')
                let newDataJson =  this.mapService.setIconStyle(this.dataService.getGeojson());
                this.dataService.setGeojson(newDataJson);
               this.mapService.eventMarkerReDraw.emit(newDataJson);
               
                
                
            });
  }

  async generateCahedIcon (){
    const loading = await this.loadingController.create({
      message: '........'
    });
    await loading.present();
    const missingSprites:string[]  = await this.iconService.getMissingSpirtes();
    for ( let missIcon of missingSprites){
      console.log(missIcon);
      let uriIcon = await this.iconService.generateMarkerByIconId(missIcon)
      this.dataService.addIconCache(missIcon, uriIcon)

    }
    loading.dismiss();
  }

  async deleteCache (){
    await this.dataService.clearCache();
      const cachesKeys = await caches.keys()
      for (let key of cachesKeys){
        await caches.delete(key)
      }

      const mainLocation = `${window.location.origin}#/main`
      window.location.replace(mainLocation);
      window.location.reload(true);
  }

  async deleteIconCache(){
    const loading = await this.loadingController.create({
      message: '...'
    });
    let n = await this.dataService.clearIconCache();
    console.log('deleted: ', n)
    loading.dismiss();
   
  }

  async changeIsDevServer(isDev : boolean){
    await this.configService.setIsDevServer(isDev);
    const mainLocation = `${window.location.origin}#/main`
    window.location.replace(mainLocation);
    window.location.reload(true);
  }

  async disableDevMode(e){
    const isDevServer = this.configService.getIsDevServer();
    this.configService.setIsDevMode(false);
    if(isDevServer){
      await this.changeIsDevServer(false);
    }
  }

}
