// Searchs transaction list
function searchTransactions(queryString) {
    $('.transaction-item').each(function () {
        if ($(this).text().search(new RegExp(queryString, "i")) < 0) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}

//  Resets the search bar state if there's not input
function resetSearchBar() {
    var searchInputCont = $('#transaction-search-bar .search-input-cont');
    var clearInput = $('#transaction-search-bar #clear');

    if (!$(clearInput).hasClass('hidden')) $(clearInput).addClass('hidden');

    $(searchInputCont).removeClass('search-offset');
    searchTransactions('');
}

// Sets the transaction item status class
function getStatusClass(statusClass) {
    switch (statusClass) {
        case "paid-out":
            return "status-payed";
        case "in-progress":
            return "status-pending";
        default:
            return "status-rejected";
    }
}

// Sets the transaction icon based on transaction status
function setStatusIcon(statusClass) {
    switch (statusClass) {
        case "paid-out":
            return `<span class="material-icons status-icon status-payed">done</span>`;
        case "in-progress":
            return `<span class="material-icons status-icon status-pending">hourglass_bottom</span>`;
        default:
            return `<span class="material-icons status-icon status-error">do_not_disturb_on</span>`;
    }
}

// Parses transaction list from form
function parseTransactions() {
    var transactions = [];

    $("#view_61 .kn-list-content .kn-list-item-container, #view_62 .kn-list-content .kn-list-item-container").each(function () {
        var transaction = {};

        $(this).find('.kn-detail').each(function () {
            var classes = $(this).attr('class').split(' ');
            var label = $(this).find('.kn-detail-label span span').text();

            var detailKey = classes.find(cls => cls.includes('field'));
            var detailVal = $(this).find('.kn-detail-body span span').text();

            if (detailKey === 'field_59' || detailKey === 'field_23' || detailKey === 'field_148')
                detailVal = $(this).find('.kn-detail-body span span span').text();

            var statusClass  = "";
            if(detailKey === 'field_23')
                statusClass = $(this).find('.kn-detail-body span span span').attr('class');

            var paybackClass  = "";
            if(detailKey === 'field_148')
                paybackClass = $(this).find('.kn-detail-body span span span').attr('class');

            transaction[detailKey] = {
                "label": label,
                "value": detailVal,
                ...(detailKey === 'field_23') && {"class": statusClass},
                ...(detailKey === 'field_148') && {"class": paybackClass},
            };
        });

        var edit_link = $(this).find('.kn-details-link a').attr('href');
        transaction["edit"] = edit_link;

        transactions.push(transaction);
    });

    return transactions;
}

// Parses and returns formatted date
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

// Creates content detail rows
function createDetailRows(transaction) {
    var detailRows = "";
    for (const detail in transaction) {

        if (detail === 'field_64' || detail === 'edit') continue;
        if (detail === 'field_148' && transaction['field_23'].class != 'paid-out') continue;

        var value = transaction[detail].value;
        if (detail === 'field_24') {
            var formattedDate = formatDate(value.substring(0, 10));
            var time = value.substring(10, value.length);

            value = formattedDate.concat(' at', time);
        }

        /* if (detail === "field_95") {
            let speed = value.split('-');

            value = `
                <span class='withdrawal-speed'>
                    <span class='ws-title'>${speed[0]}</span>
                    <span class='ws-desc'>${speed[1]}<span>
                </span>
            `
        } */

        var row = `
            <div class="ti-content-row">
                <span class="ti-row-label">
                    ${transaction[detail].label}
                </span>

                <span class="ti-row-value ${detail === 'field_23' && getStatusClass(transaction[detail].class)}">
                    ${value || '-'}
                </span>
            </div>
        `

        detailRows += row;
    }
    return detailRows;
}

// Creates the transaction list 
function createTransactionList() {
    var transactions = parseTransactions();
    var transactionsCont = $('.transaction-list-container');

    if (!(transactionsCont === undefined)) {
        
        transactions.forEach(transaction => {

            var formattedDate = formatDate(transaction.field_24.value.substring(0, 10));
            
            var collection_failed_display = transaction.field_148.class == "collection-failed" && transaction.field_23.class == "paid-out" ? "" : "display: none;";
            var collection_failed_re_display = transaction.field_148.class == "collection-failed-re" && transaction.field_23.class == "paid-out" ? "" : "display: none;";
            var not_paid_display = transaction.field_148.class == "not-paid" && transaction.field_23.class == "paid-out" ? "" : "display: none;";
            var overpaid_display = transaction.field_148.class == "overpaid" && transaction.field_23.class == "paid-out" ? "" : "display: none;";
            var paid_display = transaction.field_148.class == "paid" && transaction.field_23.class == "paid-out" ? "" : "display: none;";
            var partially_paid_display = transaction.field_148.class == "partially-paid" && transaction.field_23.class == "paid-out" ? "" : "display: none;";

            var transactionTemplate = `
                <div class="transaction-item ${getStatusClass(transaction.field_23.class)}">
                    <div class="ti-header">
                        <div class="ti-header-tgl">
                            <span class="ti-withdrawal-date">${formattedDate}</span>
                            <span class="btn-toggle material-icons">expand_more</span>
                        </div>

                        <div class="ti-header-amount">
                            <span class="ti-amount">${transaction.field_18.value}</span>

                            <a class="collection-failed" style="${collection_failed_display}">Collection Failed</a>
                            <a class="collection-failed-re" style="${collection_failed_re_display}">Collection Failed</a>
                            <a class="not-paid" style="${not_paid_display}">Not Paid</a>
                            <a class="overpaid" style="${overpaid_display}">Overpaid</a>
                            <a class="paid" style="${paid_display}">Paid</a>
                            <a class="partially-paid" style="${partially_paid_display}">Partially Paid</a>

                            ${setStatusIcon(transaction.field_23.class)}
                        </div>
                    </div>

                    <div class="ti-contnet hidden-detail">
                        ${createDetailRows(transaction)}
                    </div>
                </div>`

            transactionsCont.append(transactionTemplate);
        });
    }
}

// Setup event handlers
function setupEventHandlers() {
    $('.transaction-item .btn-toggle').click(function () {
        var ti = $(this).parents('.transaction-item');

        $(this).toggleClass('selected')
        $(ti).find('.ti-contnet').toggleClass('hidden-detail');

        $('html, body').animate({
            scrollTop: $(ti).offset().top + ($(ti).height() / 3)
        }, 1000);
    });

    $('#transaction-search-bar input').keyup(function () {
        var searchBar = $(this).parents('.custom-search-bar');
        var searchInputCont = $(searchBar).find('.search-input-cont');
        var clearInput = $(searchBar).find('#clear');
        var searchString = $(this).val().trim();

        if (searchString !== "") {
            $(clearInput).removeClass('hidden');

            if (!$(searchInputCont).hasClass('search-offset'))
                $(searchInputCont).addClass('search-offset');

            searchTransactions(searchString);

        } else {
            resetSearchBar();
        }
    });

    $('#transaction-search-bar #clear').click(function () {
        var searchBar = $(this).parents('.custom-search-bar');
        var input = $(searchBar).find('input.form-input');

        $(input).val('');
        resetSearchBar();
    });

}

// Main method: creates transaction list and calls the event handlers
function loadCustomTrasactionView() {
    createTransactionList();
    setupEventHandlers();
}