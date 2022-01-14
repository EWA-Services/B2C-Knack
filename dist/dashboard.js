requests_check = function (cutoff_day, nb_requests, max_nb_requests) {
  // condition1 : cutoff date
  if (cutoff_day == "-") {
    var cond1 = false;
  } else {
    var cond1 = new Date() <= new Date(cutoff_day.split("/")[2], cutoff_day.split("/")[1] - 1, cutoff_day.split("/")[0]);
  }

  // condition2: total number of requests per month
  var cond2 = max_nb_requests <= 0 || nb_requests < max_nb_requests;

  // compiling all
  if (cond1 && cond2) {
    return true;
  } else {
    return false;
  }
};

// Payoff and Cutoff Dates
var current_month = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1));
var payday = "-";
var cutoff_day = "-";

var months = $("#view_96 .kn-table tbody td.field_88 span");
var paydays = $("#view_96 .kn-table tbody td.field_76 span");
var cutoffs = $("#view_96 .kn-table tbody td.field_82 span");

$.each(months, function(i,v) {
  if (v.textContent.trim() == current_month) {
    payday = paydays[i].textContent.trim() || "-";
    cutoff_day = cutoffs[i].textContent.trim() || "-";
  }
});


// Withdrawable Amount and Other Conditions
var base_salary = parseFloat($("#view_51 .field_44 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_51 .field_44 .kn-detail-body").text().replace(/,/g, ""));
var requested_amount = parseFloat($("#view_52 .kn-pivot-calc:eq(0)").text().replace(/,/g, "") == "" ? 0 : $("#view_52 .kn-pivot-calc:eq(0)").text().replace(/,/g, ""));
var requested_transactions = parseInt($("#view_52 .kn-pivot-calc:eq(1)").text().replace(/,/g, "") == "" ? 0 : $("#view_52 .kn-pivot-calc:eq(1)").text().replace(/,/g, ""));

var max_number_requests = parseFloat($("#view_68 .field_91 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_68 .field_91 .kn-detail-body").text().replace(/,/g, ""));
var withdrawable_threshold = parseFloat($("#view_68 .field_89 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_68 .field_89 .kn-detail-body").text().replace(/,/g, ""));

var current_date = new Date();
var mtd = current_date.getDate() - 1;
var tot = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0).getDate();

var balance = (base_salary * mtd) / tot;
var available_amount = balance - requested_amount;

// Compiling the HTML

var check = requests_check(cutoff_day, requested_transactions, max_number_requests);

var html = '<section id="custom-view-scene1">' +
  '<div class="payday-wrapper">' +
  '<div>' +
  '<div class="payday-label">Next Payday</div>' +
  '<div class="payday-value">' + payday + '</div>' +
  '<span class="cutoff-message"><i>Cut-off at ' + cutoff_day + '</i></span>' +
  '</div>' +
  '<img src="https://ewa-services.com/ewa/images/ico-calendar.svg"/>' +
  '</div>' +
  '<div class="max-withdrawable">' +
  '<div class="max-withdrawable-label">Maximum Withdrawable Amount</div>' +
  '<div class="max-amount-button">' +
  '<span>' + (Math.round((available_amount * withdrawable_threshold)*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>' +
//'<a' + (check === true ? ' href="' + window.location.pathname + '#request"' : ' style="pointer-events:none;" class="disabled"') + '>Withdraw</a>' +
  '<a href="' + window.location.pathname + "#request\"" + '>Withdraw</a>' +
  '</div>' +
  '</div>' +
  '</section>';

$(html).insertBefore($("#kn-scene_1"));