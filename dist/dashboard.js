requests_check = function (cutoff_day, payday, max_nb_requests, max_per_request, days_to_request) {

  // condition1 : between cutoff date and payroll date
  // Update: changed to xx days before payroll day until cutoff day
  if (cutoff_day == "-" || payday == "-") {
    var cond1 = false;
  } else {
    // var cond1_cutoff = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) <= new Date(cutoff_day.split("/")[2], cutoff_day.split("/")[1] - 1, cutoff_day.split("/")[0]);
    // var cond1_payroll = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) > new Date(payday.split("/")[2], payday.split("/")[1] - 1, payday.split("/")[0]);
    // var cond1 = cond1_cutoff || cond1_payroll;
    var payday_asdate = new Date(payday.split("/")[2], payday.split("/")[1] - 1, payday.split("/")[0]);
    var cutoff_asdate = new Date(cutoff_day.split("/")[2], cutoff_day.split("/")[1] - 1, cutoff_day.split("/")[0])
    var today_asdate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    var limit_inf = payday_asdate;
    limit_inf.setDate(limit_inf.getDate() - days_to_request);
    var cond1 = today_asdate >= limit_inf && today_asdate <= cutoff_asdate;
    var limit_inf_formatted = limit_inf.getDate() + "/" + (limit_inf.getMonth()+1) + "/" + limit_inf.getFullYear()
  }

  // condition2: total number of requests per month
  var past_requests = {};
  $("#view_52 .kn-report-content table tbody tr").each(function () {
    var day = $(this).find(".kn-pivot-group").text().trim();
    var count = parseInt($(this).find(".kn-pivot-calc:eq(1)").text().trim());
    past_requests[day] = count;
  })
  
  var nb_requests = 0;
  for (var key of Object.keys(past_requests)) {
    if ((new Date(2022, key.split("/")[1]-1, key.split("/")[0]) <= new Date(payday.split("/")[2], payday.split("/")[1] - 1, payday.split("/")[0])) && (new Date(2022, key.split("/")[1]-1, key.split("/")[0]) > new Date(last_payday.split("/")[2], last_payday.split("/")[1] - 1, last_payday.split("/")[0]))) {
      var nb_requests = nb_requests + past_requests[key];
    }
  }
  var cond2 = max_nb_requests <= 0 || nb_requests < max_nb_requests;

  // Get requests' count per payback status
  var requests_by_payback = {};
  $("#view_146 table tbody tr").each(function () {
      var status = $(this).find(".kn-pivot-group span").attr("class");
      var count = parseInt($(this).find(".kn-pivot-calc").text().trim());
      requests_by_payback[status] = count;
  })
  // requests_by_payback = {not-paid: 1, paid: 0, uploaded: 1}

  // condition3: payslips uploaded
  var cond3 = requests_by_payback["collection-failed"] == 0 &&
              requests_by_payback["collection-failed-re"] == 0 &&
              requests_by_payback["not-paid"] == 0 &&
              requests_by_payback["partially-paid"] == 0;

  // condition4: payslips verified
  // var cond4 = requests_by_payback["uploaded"] == 0;

  // condition5: max allowed per request is 0
  var cond5 = max_per_request != 0;

  // compiling all
  if (cond1 && cond2 && cond3 && cond4 && cond5) {
    return { status : true };
  } else if (cond5 == false) {
    return { status : false, error : "Advances are not allowed at the moment." };
  } else if (cond3 == false) {
    return { status : false, error : "Please pay back the advance you have received to be able to submit a new request." };
  } /* else if (cond4 == false) {
    return { status : false, error : "Please wait until your payslips are approved to be able to submit a new request." };
  } */ else if (cond1 == false) {
    return { status : false, error : "Salary advances are only available starting " + days_to_request + " days before your next payday. You can withdraw again starting from " + limit_inf_formatted };
  } else if (cond2 == false) {
    return { status : false, error : "You have reached the maximum number of advance requests for this month. You can request a new advance after you received your next salary." };
  }
};

// Payoff and Cutoff Dates

var current_month = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1));
var last_month_date_tmp = new Date((new Date()).setMonth((new Date()).getMonth()-1));
var last_month = last_month_date_tmp.getFullYear() + "-" + ((last_month_date_tmp.getMonth() + 1) < 10 ? "0" + (last_month_date_tmp.getMonth() + 1) : (last_month_date_tmp.getMonth() + 1));
var payday = "-";
var last_payday = "-"
var cutoff_day = "-";
var last_cutoff_day = "-";

var months = $("#view_96 .kn-table tbody td.field_88 span");
var paydays = $("#view_96 .kn-table tbody td.field_76 span");
var cutoffs = $("#view_96 .kn-table tbody td.field_82 span");

$.each(months, function(i,v) {
  if (v.textContent.trim() == current_month) {
    payday = paydays[i].textContent.trim() || "-";
    cutoff_day = cutoffs[i].textContent.trim() || "-";
  } else if (v.textContent.trim() == last_month) {
    last_payday = paydays[i].textContent.trim() || "-";
    last_cutoff_day = cutoffs[i].textContent.trim() || "-";
  }
});

if (last_payday == "-") {
  var current_payday_tmp = new Date(payday.split("/")[2], payday.split("/")[1]-1, payday.split("/")[0]);
  var last_payday_tmp = new Date(current_payday_tmp.setMonth(current_payday_tmp.getMonth()-1));
  var last_payday = (last_payday_tmp.getDate() < 10 ? "0" + last_payday_tmp.getDate() : last_payday_tmp.getDate()) + "/" + (last_payday_tmp.getMonth() < 9 ? "0" + (last_payday_tmp.getMonth()+1) : (last_payday_tmp.getMonth()+1)) + "/" + last_payday_tmp.getFullYear();
}


// Withdrawable Amount and Other Conditions

var base_salary = parseFloat($("#view_51 .field_44 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_51 .field_44 .kn-detail-body").text().replace(/,/g, ""));
var requested_amount = parseFloat($("#view_52 .kn-pivot-calc:eq(0)").text().replace(/,/g, "") == "" ? 0 : $("#view_52 .kn-pivot-calc:eq(0)").text().replace(/,/g, ""));
// var requested_transactions = parseInt($("#view_52 .kn-pivot-calc:eq(1)").text().replace(/,/g, "") == "" ? 0 : $("#view_52 .kn-pivot-calc:eq(1)").text().replace(/,/g, ""));

var max_number_requests = parseFloat($("#view_68 .field_91 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_68 .field_91 .kn-detail-body").text().replace(/,/g, ""));
var withdrawable_threshold = parseFloat($("#view_68 .field_89 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_68 .field_89 .kn-detail-body").text().replace(/,/g, ""));

var max_per_request = parseFloat($("#view_51 .kn-detail.field_105 .kn-detail-body span span").text().replace(/,/g, "") == "" ? 0 : $("#view_51 .kn-detail.field_105 .kn-detail-body span span").text().replace(/,/g, ""));
var days_to_request = parseInt($("#view_51 .kn-detail.field_149 .kn-detail-body span span").text().replace(/,/g, "") == "" ? 0 : $("#view_51 .kn-detail.field_149 .kn-detail-body span span").text().replace(/,/g, ""));

var current_date = new Date();
var mtd = current_date.getDate() - 1;
var tot = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0).getDate();

var balance = (base_salary * mtd) / tot;
var available_amount = balance - requested_amount;

// Compiling the HTML

var check = requests_check(cutoff_day, payday, max_number_requests, max_per_request, days_to_request);

var html = '<section id="custom-view-scene1">' +
  '<div class="payday-wrapper">' +
  '<div>' +
  '<div class="payday-label">Next Payday</div>' +
  '<div class="payday-value">' + payday + '</div>' +
  '<span class="cutoff-message"><i>Cut-off at ' + cutoff_day + '</i></span>' +
  '</div>' +
  '<img src="https://root.ewa-services.com/ewa/images/ico-calendar.svg"/>' +
  '</div>' +
  '<div class="max-withdrawable">' +
  '<div class="max-withdrawable-label">Maximum Withdrawable Amount</div>' +
  '<div class="max-amount-button">' +
  '<span>' + (check["status"] === true ? (Math.round((Math.min(max_per_request, available_amount * withdrawable_threshold))*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0) + '</span>' +
  '<a' + (check["status"] === true ? ' href="' + window.location.pathname + '#request"' : ' style="pointer-events:none;" class="disabled"') + '>Withdraw</a>' +
  // '<a href="' + window.location.pathname + "#request\"" + '>Withdraw</a>' +
  '</div>' +
  (check["status"] === true ? "" : "<p class='error-message'>" + check["error"] + "</p>") +
  '</div>' +
  '</section>';

$(html).insertBefore($("#kn-scene_1"));