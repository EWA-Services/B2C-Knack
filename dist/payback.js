function formatDate(stringDate) {
    var dateArray = stringDate.split('/');
    var date = new Date(+dateArray[2], dateArray[1] - 1, +dateArray[0]);

    var year = date.getFullYear();

    var month = date.toLocaleString('default', {
        month: 'long'
    });

    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

    return `${month} ${day}, ${year}`;
}


var information = {};

$("#view_142 .kn-table").find('.kn-detail').each(function () {
    var classes = $(this).attr('class').split(' ');
    var label = $(this).find('.kn-detail-label span span').text();

    var detailKey = classes.find(cls => cls.includes('field'));
    var detailVal = $(this).find('.kn-detail-body span span').text();

    if (detailKey === 'field_59' || detailKey === 'field_23')
        detailVal = $(this).find('.kn-detail-body span span span').text();

    var statusClass  = "";
    if(detailKey === 'field_23')
        statusClass = $(this).find('.kn-detail-body span span span').attr('class');

    information[detailKey] = {
        "label": label,
        "value": detailVal,
        ...(detailKey === 'field_23') && {"class": statusClass},
    };
});

var formatted_date = formatDate(information.field_24.value.substring(0, 10));
var information_container = $('#view_141 .information-container');

var details = "";

for (const detail in information) {

    var value = information[detail].value;
    if (detail === 'field_24') {
        var formatted_date = formatDate(value.substring(0, 10));
        var time = value.substring(10, value.length);
        value = formatted_date.concat(' at', time);
    }

    var row = `
        <div class="ti-content-row ${detail}">
            <span class="ti-row-label">${information[detail].label}</span>
            <span class="ti-row-value">${value || '-'}</span>
        </div>
    `
    
    details += row;
}

var template = `<div class="ti-content">${details}</div>`;
information_container.append(template);

// Payback amount placeholder

var payback_amount = $("#view_142 .kn-detail.field_64 .kn-detail-body span span").text();
$("#view_143 .bank-account-payback .amount-to-pay .value").text(payback_amount);