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
    let searchInputCont = $('#transaction-search-bar .search-input-cont');
    let clearInput = $('#transaction-search-bar #clear');

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
    let transactions = [];

    $("#view_61 .kn-list-content .kn-list-item-container, #view_62 .kn-list-content .kn-list-item-container").each(function () {
        let transaction = {};

        $(this).find('.kn-detail').each(function () {
            let classes = $(this).attr('class').split(' ');
            let label = $(this).find('.kn-detail-label span span').text();

            let detailKey = classes.find(cls => cls.includes('field'));
            let detailVal = $(this).find('.kn-detail-body span span').text();

            if (detailKey === 'field_59' || detailKey === 'field_23')
                detailVal = $(this).find('.kn-detail-body span span span').text();

            let statusClass  = "";
            if(detailKey === 'field_23')
                statusClass = $(this).find('.kn-detail-body span span span').attr('class');

            transaction[detailKey] = {
                "label": label,
                "value": detailVal,
                ...(detailKey === 'field_23') && {"class": statusClass},
            };
        });

        transactions.push(transaction);
    });

    return transactions;
}

// Parses and returns formatted date
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

// Creates content detail rows
function createDetailRows(transaction) {
    let detailRows = "";
    for (const detail in transaction) {

        if (detail === 'field_64') continue;

        let value = transaction[detail].value;
        if (detail === 'field_24') {
            let formattedDate = formatDate(value.substring(0, 10));
            let time = value.substring(10, value.length);

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

        let row = `
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
    let transactions = parseTransactions();

    let transactionsCont = $('.transaction-list-container');

    transactions.forEach(transaction => {

        let formattedDate = formatDate(transaction.field_24.value.substring(0, 10));

        let transactionTemplate = `
            <div class="transaction-item ${getStatusClass(transaction.field_23.class)}">
                <div class="ti-header">
                    <div class="ti-header-tgl">
                        <span class="ti-withdrawal-date">${formattedDate}</span>

                        <span class="btn-toggle material-icons">
                            expand_more
                        </span>
                    </div>

                    <div class="ti-header-amount">
                        <span class="ti-amount">${transaction.field_18.value}</span>

                        ${setStatusIcon(transaction.field_23.class)}
                    </div>
                </div>

                <div class="ti-contnet hidden-detail">
                    ${createDetailRows(transaction)}
                </div>
            </div>
        `
        transactionsCont.append(transactionTemplate);
    });
}

// Setup event handlers
function setupEventHandlers() {
    $('.transaction-item .btn-toggle').click(function () {
        let ti = $(this).parents('.transaction-item');

        $(this).toggleClass('selected')
        $(ti).find('.ti-contnet').toggleClass('hidden-detail');

        $('html, body').animate({
            scrollTop: $(ti).offset().top + ($(ti).height() / 3)
        }, 1000);
    });

    $('#transaction-search-bar input').keyup(function () {
        let searchBar = $(this).parents('.custom-search-bar');
        let searchInputCont = $(searchBar).find('.search-input-cont');
        let clearInput = $(searchBar).find('#clear');
        let searchString = $(this).val().trim();

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
        let searchBar = $(this).parents('.custom-search-bar');
        let input = $(searchBar).find('input.form-input');

        $(input).val('');
        resetSearchBar();
    });

}

// Main method: creates transaction list  and calls the event handlers
function loadCustomTrasactionView() {
    createTransactionList();
    setupEventHandlers();
}