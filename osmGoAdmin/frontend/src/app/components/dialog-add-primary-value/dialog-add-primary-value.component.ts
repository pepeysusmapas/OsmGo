import { Component, OnInit, Inject } from '@angular/core';
import { TagsService } from '../../services/tags.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as _ from 'lodash';

@Component({
  selector: 'app-dialog-add-primary-value',
  templateUrl: './dialog-add-primary-value.component.html',
  styleUrls: ['./dialog-add-primary-value.component.css']
})
export class DialogAddPrimaryValueComponent implements OnInit {
  diffs = [];
  newPvalue = undefined;
  pKey = undefined;
  constructor(
    public tagsService: TagsService,
    public dialogRef: MatDialogRef<DialogAddPrimaryValueComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {

    this.pKey = this.data.primaryKey;
  }

  ngOnInit() {
    if (this.tagsService.aggStats && this.tagsService.aggStats[this.data.primaryKey]) {
      const listAggPValues = this.tagsService.aggStats[this.data.primaryKey].values.map(val => val.value);
      const listOsmGoPValues = this.tagsService.tagsConfig[this.data.primaryKey].values.map(val => val.key);
      const diffsPvalues = _.difference(listAggPValues, listOsmGoPValues);
      const diffs = diffsPvalues.map(pValue => {
        return this.tagsService.aggStats[this.data.primaryKey].values.filter(val => val.value === pValue)[0];
      });
      this.diffs = _.orderBy(diffs, ['count'], ['desc']);
    }
  }

  selectValue(val) {
    const defaultColor = this.tagsService.tagsConfig[this.data.primaryKey].values[0].markerColor;
    this.newPvalue = {
      key: val.value, lbl: val.value, lbl_alt: '', icon: '', markerColor: defaultColor,
      alert: '', presets: []
    };
  }

  pushNewPValue(pKey, newPvalue) {

    this.tagsService.postNewPvalue$(pKey, newPvalue).subscribe(res => {
      this.tagsService.tagsConfig[pKey].values = [...this.tagsService.tagsConfig[pKey].values, res]
      this.dialogRef.close(res);
    });

  }

  toOsmPage(key, value) {
    window.open(`https://wiki.openstreetmap.org/wiki/Tag:${key}=${value}`, '_blank');
  }


}
