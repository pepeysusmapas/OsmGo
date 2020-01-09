import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterByTagsContent',
    pure: false
})


export class FilterByTagsContentPipe implements PipeTransform {

    replaceCharSpe(text: string) {
        if (!text){
            return
        }
        return text.replace(/[û]/gi, 'u')
            .replace(/[áàâ]/gi, 'a')
            .replace(/[éèêë]/gi, 'e')
            .replace(/[íîï]/gi, 'i')
            .replace(/[óô]/gi, 'o')
            .replace(/ç/g, 'c')
    }


    transform(items, args: string[], searchText: string) {
        const patt = new RegExp(searchText, 'i');
        const [language, countryCode] = args;
        return items.filter(item => {
            // By Key
            if (patt.test(item['key'])) {
                return true;
            } else if (patt.test(this.replaceCharSpe(item['key']))) {
                return true;
            }

            // By label ()
            if (item.lbl){
                let it = item.lbl[language] ? item.lbl[language] : item.lbl['en']
                if (patt.test(it)) {
                    return true;
                } else if (patt.test(this.replaceCharSpe(it))) {
                    return true;
                }
            }

            if (item.terms){
                let it = item.terms[language] ? item.terms[language] : item.terms['en']
                if (patt.test(it)) {
                    return true;
                } else if (patt.test(this.replaceCharSpe(it))) {
                    return true;
                }
            }
        });

    }
}
