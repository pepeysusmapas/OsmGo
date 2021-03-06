import { Component, OnInit } from '@angular/core';
import { TagsService } from '../../services/tags.service';
import { TaginfoService } from '../../services/taginfo.service';
import { MatDialog } from '@angular/material';
import { DialogModifyPresetsAppComponent } from '../dialog-modify-presets/dialog-modify-presets';
import { DialogIconComponent } from '../dialog-icon/dialog-icon.component';
import { DialogAddPrimaryValueComponent } from '../dialog-add-primary-value/dialog-add-primary-value.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { SettingPkeyComponent } from '../setting-pkey/setting-pkey.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  selectedTagKey = undefined;
  currentSprite;
  selectedTagValueConfig = undefined;
  selectedPresetConfig;
  selectedPresetId;
  orderKey = 'key';
  orderType = 'asc'
  isDeleteConfirm = false;

  newDefaultValue = { key:null, value: null}

  constructor(
    public tagsService: TagsService,
    public taginfoService: TaginfoService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.tagsService.language =this.route.snapshot.paramMap.get("language")
    this.tagsService.country =this.route.snapshot.paramMap.get("country")

    if (!this.tagsService.language || !this.tagsService.country){
      this.router.navigate(['/']);
      return
    }


    this.tagsService.tagsConfig$(this.tagsService.language,this.tagsService.country ).subscribe(data => {
      // this.tagsService.tagsConfig = data;

      this.selectedTagKey = 'shop';
    });
  }

  deleteTag(key, value){
   
    this.tagsService.deleteTag(key, value).subscribe( deleted => {
      this.tagsService.tagsConfig[key].values = this.tagsService.tagsConfig[key].values.filter( f => f.key !== value);
    });

    this.isDeleteConfirm = false;
  }

  selectKeyTagChange(e) {
    this.selectedTagValueConfig = undefined;
    this.selectedPresetConfig = undefined;
    this.selectedPresetId = undefined;
  }

  tagValueConfigChange(t) {
    this.selectedTagValueConfig = t;
  }

  presetSelect(preset) {
    this.selectedPresetId = preset;
  }


  openPresetsDialog(typeModif: string, primaryKey: string, primaryValue: string, presets = null): void {
   
    const dialogRef = this.dialog.open(DialogModifyPresetsAppComponent, {
      height: '80%',
      width: '80%',
      data: { type: typeModif, presets: presets, primaryKey: primaryKey, primaryValue: primaryValue }
    });

    dialogRef.afterClosed()
    .subscribe();
  }

  deletePresetFromTag(primaryKey: string, primaryValue: string, presets ){
    let currentTag =  this.tagsService.tagsConfig[primaryKey].values.find( e => e.key === primaryValue)
    if (currentTag){
      console.log('id', presets._id);
      console.log(currentTag.presets)
      const idIndex = currentTag.presets.indexOf(presets._id)
      if (!idIndex){
        return;
      }
      currentTag.presets.splice(idIndex, 1);
      this.tagsService.updatePrimaryTag(primaryKey, primaryValue, currentTag)
        .subscribe();
    }

    // currentTag.presets.splice(1,presets._id)

  }

  openDialogIconsSelector(primaryKey: string, primaryValue: string) {
    const dialogRef = this.dialog.open(DialogIconComponent, {
      height: '80%',
      width: '80%',
      data: { primaryKey: primaryKey, primaryValue: primaryValue }

    });

    dialogRef.afterClosed().subscribe(result => {
    
    });
  }

  openDialogAddPrimaryValue(primaryKey: string) {
    const dialogRef = this.dialog.open(DialogAddPrimaryValueComponent, {
      height: '80%',
      width: '80%',
      data: { primaryKey: primaryKey }

    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openDialogSettingsPkey(primaryKey){
    const dialogRef = this.dialog.open(SettingPkeyComponent, {
      height: '80%',
      width: '80%',
      data: { primaryKey: primaryKey }

    });

    dialogRef.afterClosed().subscribe(result => {
    
    });

  }

  primaryTagHasChanged(e) {
    this.tagsService.updatePrimaryTag(this.selectedTagKey, this.selectedTagValueConfig.key, this.selectedTagValueConfig)
      .subscribe();
  }

  getCountPrimaryKey(key, value) {
    if (!this.tagsService.aggStats || !this.tagsService.aggStats[key]) {
      return 0;
    }
    const statFinded = this.tagsService.aggStats[key].values.filter(el => el.value === value);
    if (!statFinded || !statFinded[0]) {
      return 0;
    } else {
      return ((statFinded[0]['count'] / this.tagsService.aggStats[key].sum) * 100).toFixed(3);
    }
  }

  toOsmPage(key, value) {
    window.open(`https://wiki.openstreetmap.org/wiki/Tag:${key}=${value}`, '_blank');
  }


  changeOrder(key){
    this.orderKey = key;
    if (this.orderKey === key){
      this.orderType = ( this.orderType  === 'asc' ) ? 'desc' : 'asc'
    }
  }

  deleteDefaultValue(item){

    this.selectedTagValueConfig.default_values = this.selectedTagValueConfig.default_values.filter( i => i.key !== item.key);
    this.tagsService.updatePrimaryTag(this.selectedTagKey, this.selectedTagValueConfig.key, this.selectedTagValueConfig)
    .subscribe();
    
  }

  addDefaultValue(newItem){
    if (!this.selectedTagValueConfig.default_values ){
      this.selectedTagValueConfig.default_values  = [];
    }
    this.selectedTagValueConfig.default_values = [...this.selectedTagValueConfig.default_values, newItem];
    this.newDefaultValue = { key: null, value: null}

    this.tagsService.updatePrimaryTag(this.selectedTagKey, this.selectedTagValueConfig.key, this.selectedTagValueConfig)
    .subscribe();
  }

  optionChangeOrder(index, newIndex){
    this.array_move(this.selectedTagValueConfig.presets, index,newIndex);
    this.primaryTagHasChanged(null) 
    // this.updatePreset(this.selectedPreset)
  }


  array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
};
}
