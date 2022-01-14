// Parses bank accounts 
function parseBankAccounts() {
    let bankAccounts = [];

    $("#view_45 .kn-list-content .kn-list-item-container, #view_69 .kn-list-content .kn-list-item-container").each(function () {
        let bankAccount = {};

        $(this).find('.kn-detail').each(function () {
            let label = $(this).find('.kn-detail-label span span').text();

            let detailKey = label.split(' ').join('');
            let detailVal = $(this).find('.kn-detail-body span span').text();

            if (detailKey === 'AccountBank')
                detailVal = $(this).find('.kn-detail-body span span span').text();

            if (detailKey === 'BankLogo') {
                let img = $(this).find('.kn-detail-body span span span img');
                detailVal = $(img).attr('src');
            }

            bankAccount[detailKey] = {
                "label": label,
                "value": detailVal
            };
        });

        bankAccounts.push(bankAccount);
    });

    return bankAccounts;
}

// create bank account list
function creatBankAccountList() {
    let bankAccounts = parseBankAccounts();

    let bankAccountsList = ``;
    bankAccounts.forEach((bankAccount, index) => {

        let bankAccountTemplate = `
            <div class="bank-account-item bordered">
                <img src="${bankAccount.BankLogo.value}" alt="bank account logo" width="56" height="56" class="img-bank" />
            
                <div class="bci-content">
                    <span class="bci-bank-name">${bankAccount.AccountBank.value}</span>
                    <span class="bci-account">${bankAccount.AccountNumber.value}</span>
                </div>
            </div>
        `
        bankAccountsList += bankAccountTemplate;
    });

    let linkedAccounts = `
        <div class="main-accounts-container">
            <div class="accounts-header">
                <span class="ah-title">Linked Accounts</span>
            </div>

            ${bankAccountsList}
        </div>
    `;

    $('.bank-accounts-container').append(linkedAccounts);

}


// Main function
function loadHomeView() {
    creatBankAccountList();
}