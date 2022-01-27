function formatDate(stringDate) {
    let dateArray = stringDate.split('/');
    let date = new Date(+dateArray[2], dateArray[1] - 1, +dateArray[0]);

    let year = date.getFullYear();

    let month = date.toLocaleString('default', {
        month: 'long'
    });

    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

    return `${month} ${day}, ${year}`;
}


var information = {};

$("#view_114 .kn-table").find('.kn-detail').each(function () {
    let classes = $(this).attr('class').split(' ');
    let label = $(this).find('.kn-detail-label span span').text();

    let detailKey = classes.find(cls => cls.includes('field'));
    let detailVal = $(this).find('.kn-detail-body span span').text();

    if (detailKey === 'field_59' || detailKey === 'field_23')
        detailVal = $(this).find('.kn-detail-body span span span').text();

    let statusClass  = "";
    if(detailKey === 'field_23')
        statusClass = $(this).find('.kn-detail-body span span span').attr('class');

    information[detailKey] = {
        "label": label,
        "value": detailVal,
        ...(detailKey === 'field_23') && {"class": statusClass},
    };
});

var formatted_date = formatDate(information.field_24.value.substring(0, 10));
var information_container = $('#view_117 .information-container');

var details = "";

for (const detail in information) {

    let value = information[detail].value;
    if (detail === 'field_24') {
        let formatted_date = formatDate(value.substring(0, 10));
        let time = value.substring(10, value.length);
        value = formatted_date.concat(' at', time);
    }

    let row = `
        <div class="ti-content-row">
            <span class="ti-row-label">${information[detail].label}</span>
            <span class="ti-row-value">${value || '-'}</span>
        </div>
    `
    
    details += row;
}

var template = `<div class="ti-content">${details}</div>`;
information_container.append(template);

