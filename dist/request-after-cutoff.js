function hide_error() {
  $(".error-message-custom").hide();
  // $(".validation-message-custom").hide();
};

function calculate_withdrawable (base_salary, requested_amount, withdrawable_threshold) {
  var current_date = new Date();
  var mtd = current_date.getDate() - 1;
  var tot = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0).getDate();
  var balance = (base_salary * mtd) / tot;
  var available_amount = (balance - requested_amount) * withdrawable_threshold;
  return available_amount;
};

amount_requested_checks = function (base_salary, employed_since_days, withdrawable_amount, min_allowed, max_allowed, max_cutoff_allowed, nb_requests, max_nb_requests, input_val) {
  
  var arr = [withdrawable_amount, max_allowed, max_cutoff_allowed, base_salary*0.1];
  var max_allowed_bis = Math.min.apply(null, arr.filter(Boolean));
  
  // condition1: employee employed for 4 months or more
  var cond1 = employed_since_days >= 120;
  
  // condition1: total number of requests per month
  var cond2 = max_nb_requests <= 0 || nb_requests < max_nb_requests;

  // condition2: remaining balance is lower than the minimum withdrawal amount allowed
  if (max_allowed_bis < min_allowed) {
    var cond3 = false;
  } else {
    var cond3 = true;
  }

  // condition3: input in range
  var cond4 = input_val > 0 && input_val >= min_allowed && input_val <= max_allowed_bis;

  // compiling all
  if (cond1 == false) {
    return {status: false, error: "You are employed since " + employed_since_days + " days. You need to fulfill 4 months at least to be eligible to submit requests after cutoff days"};
  } else if (cond2 == false) {
    return {status: false, error: "You have exceeded the maximum number of requests allowed per month"};
  } else if (cond3 == false) {
    return {status: false, error: "The remaining balance (" + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ") is lower than the minimum withdrawal amount allowed (" + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")"};
  } else if (cond4 == false && max_allowed > 0) {
    return {status: false, error: "Please provide an amount between " + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " and " + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")};
  } else if (cond4 == false) {
    return {status: false, error: "Please provide an amount greater than " + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")};
  } else {
    return { status: true };
  }
};

function display_message (json_obj) {
  if (json_obj["status"] == false) {
    var error_msg = json_obj["error"];
    $(".error-message-custom").hide();
    $(".validation-message-custom").hide();
    $("<div class='error-message-custom'><strong>" + error_msg + "</strong></div>").insertBefore($("#view_133 form > ul"));
    // setTimeout(hide_error, 5000);
  }

  if (json_obj["status"] == true) {
    $(".error-message-custom").hide();
    $(".validation-message-custom").hide();
    $("<div class='validation-message-custom'><strong>All inputs are correct</strong></div>").insertBefore($("#view_133 form > ul"));
    $("#view_133 .kn-button.is-primary").prop("disabled", false);
  } else {
    $("#view_133 .kn-button.is-primary").prop("disabled", true);
  }
};

// Function that updates the proceed button state on jsignature field change


$("#view_133-field_119").change(function () {
  var base30Data = $("#view_133-field_119").jSignature('getData','base30')[1];
  if (base30Data.trim() == "") {
    $('#next-cutoff-btn').prop("disabled", true);
    $('#next-cutoff-btn').addClass("disabled");
  } else {
    $('#next-cutoff-btn').prop("disabled", false);
    $('#next-cutoff-btn').removeClass("disabled");
  }
});

// Append a "Proceed" button to the form

$("#view_133 .kn-button.is-primary").wrap('<div id="buttons-wrapper" class="buttons-wrapper"></div>');

$("#buttons-wrapper").prepend("<button id='back-cutoff-btn'>Back</button>");
$("#buttons-wrapper").prepend("<button id='next-cutoff-btn' class='disabled' disabled>Proceed</button>");

proceed_to_from = function() {
  $("#view_133 #kn-input-field_18").css({"visibility":"unset", "position":"unset"});
  $("#view_133 #kn-input-field_59").css({"visibility":"unset", "position":"unset"});
  $("#view_133 #kn-input-field_92").css({"visibility":"unset", "position":"unset"});
  $("#view_133 #kn-input-field_80").css({"visibility":"unset", "position":"unset"});
  $("#view_133 form .kn-section-break").css({"visibility":"hidden", "position":"absolute"});
  $("#view_133 #kn-input-field_119").css({"visibility":"hidden", "position":"absolute"});
  $("#view_133 .buttons-wrapper #next-cutoff-btn").css({"display":"none"});
  $("#view_133 .buttons-wrapper #back-cutoff-btn").css({"display":"unset"});
  $("#view_133 .buttons-wrapper .kn-button.is-primary").css({"display":"unset"});
}
$("#view_133 #next-cutoff-btn").on("click", proceed_to_from);

back_to_conditions = function() {
  $("#view_133 #kn-input-field_18").css({"visibility":"hidden", "position":"absolute"});
  $("#view_133 #kn-input-field_59").css({"visibility":"hidden", "position":"absolute"});
  $("#view_133 #kn-input-field_92").css({"visibility":"hidden", "position":"absolute"});
  $("#view_133 #kn-input-field_80").css({"visibility":"hidden", "position":"absolute"});
  $("#view_133 form .kn-section-break").css({"visibility":"unset", "position":"unset"});
  $("#view_133 #kn-input-field_119").css({"visibility":"unset", "position":"unset"});
  $("#view_133 .buttons-wrapper #next-cutoff-btn").css({"display":"unset"});
  $("#view_133 .buttons-wrapper #back-cutoff-btn").css({"display":"none"});
  $("#view_133 .buttons-wrapper .kn-button.is-primary").css({"display":"none"});
}
$("#view_133 #back-cutoff-btn").on("click", back_to_conditions);

// Add placeholders + classes to the form view (view_133)

($('.view_133 form #field_18').attr("placeholder", "Amount"));
($('.view_133 form #field_80').attr("placeholder", "Withdrawal Remark"));

var currency = $("#view_64 .field_122 .kn-detail-body").text();

var normal_fee_setting = parseFloat($("#view_64 .field_93 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_93 .kn-detail-body").text().replace(/,/g, ""));
var fast_fee_setting = parseFloat($("#view_64 .field_94 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_94 .kn-detail-body").text().replace(/,/g, ""));
var cutoff_fee_setting = parseFloat($("#view_64 .field_120 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_120 .kn-detail-body").text().replace(/,/g, ""));

var normal_withdrawal_speed = $("#view_64 .field_96 .kn-detail-body").text();
var fast_withdrawal_speed = $("#view_64 .field_97 .kn-detail-body").text();
var cutoff_withdrawal_speed = $("#view_64 .field_121 .kn-detail-body").text();

if (normal_fee_setting == 0) {
  var normal_fee_message = "There is no service fee";
} else {
  var normal_fee_message = "There is a fee of " + normal_fee_setting + " " + currency + " per disbursement";
}

if (fast_fee_setting == 0) {
  var fast_fee_message = "There is no service fee";
} else {
  var fast_fee_message = "There is a fee of " + fast_fee_setting + " " + currency + " per disbursement";
}

if (cutoff_fee_setting == 0) {
  var cutoff_fee_message = "There is no service fee";
} else {
  var cutoff_fee_message = "There is a fee of " + cutoff_fee_setting + " " + currency + " per disbursement";
}

$('.view_133 form .kn-input .kn-radio .control').each(function () {
  let radioContent = $(this).find('.option.radio div');
  let radioContentText = $(radioContent).text().trim().split('-');

  if ($(radioContent).text().toLowerCase().indexOf("normal") > -1) {
      var fee_message = normal_fee_message;
      var withdrawal_speed = normal_withdrawal_speed;
      var speed_type = "normal";
  } else if ($(radioContent).text().toLowerCase().indexOf("fast") > -1) {
    var fee_message = fast_fee_message;
    var withdrawal_speed = fast_withdrawal_speed;
    var speed_type = "fast";
  } else {
    $(this).addClass("selected");
    $(this).find( "input" ).prop("checked", true);
    var fee_message = cutoff_fee_message;
    var withdrawal_speed = cutoff_withdrawal_speed;
    var speed_type = "cutoff";
  }

  var newContentTemplate = `
      <div class='${speed_type}'>
          <span class='widthdrawl-radio'>
              <span class='wr-title'>${radioContentText[0]}</span>
              <span class='wr-desc'>${radioContentText[1].replace('{withdrawal_fee}', fee_message).replace('{withdrawal_speed}', withdrawal_speed)}</span>
          </span>
      </div>
  `;
  $(radioContent).html(newContentTemplate);
});

/* $('.view_133 form .kn-radio input[type=radio][name=view_133-field_92]').change(function (e) {
  $('.view_133 form .kn-radio input').each(function () {
      $(this).closest('.control').removeClass('selected');
  });
  if (!$(e.target).closest('.control').hasClass('selected'))
      $(e.target).closest('.control').addClass('selected');
}); */

// Hide error and validation message on form submit
$(document).on("knack-form-submit.view_133", function (event, view, record) {
  $(".error-message-custom").hide();
  $(".validation-message-custom").hide();
});

// Disable the Submission Button
$("#view_133 .kn-button.is-primary").prop("disabled", true);

// Variables for Global Conditions
var requested_transactions = parseInt($("#view_66 .kn-pivot-calc:eq(1)").text().replace(/,/g, "") == "" ? 0 : $("#view_66 .kn-pivot-calc:eq(1)").text().replace(/,/g, ""));
var max_number_requests = parseFloat($("#view_64 .field_91 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_91 .kn-detail-body").text().replace(/,/g, ""));
var input_val = 0;

var current_month = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1));
var next_month = (new Date().getMonth() == 11
               ? (new Date().getFullYear() + 1) + "-01"
               : new Date().getFullYear() + "-" + ((new Date().getMonth() + 2) < 10 ? "0" + (new Date().getMonth() + 2) : (new Date().getMonth() + 2)));

var cutoff_day = "-";

var months = $("#view_97 .kn-table tbody td.field_88 span");
var cutoffs = $("#view_97 .kn-table tbody td.field_82 span");
var paydays = $("#view_97 .kn-table tbody td.field_76 span");

$.each(months, function(i,v) {
if (v.textContent.trim() == current_month) {
  cutoff_day = cutoffs[i].textContent.trim();
  payday = paydays[i].textContent.trim();
} else if (v.textContent.trim() == next_month) {
  next_payday = paydays[i].textContent.trim();
}
});

var cutoff_day = cutoff_day == "" ? "-" : cutoff_day;
var payday = payday == "" ? "-" : payday;
var next_payday = next_payday == "" ? "-" : next_payday;

$("#view_133 form .kn-input.kn-input-section_break.control").replaceWith($("#view_133 form .kn-input.kn-input-section_break.control").html().replace("{payday_current}", payday).replace("{payday_next}", next_payday));

// Calculate Withdrawable Amount Variables
var base_salary = parseFloat($("#view_65 .field_44 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_44 .kn-detail-body").text().replace(/,/g, ""));
var requested_amount = parseFloat($("#view_66 .kn-pivot-calc:eq(0)").text().replace(/,/g, "") == "" ? 0 : $("#view_66 .kn-pivot-calc:eq(0)").text().replace(/,/g, ""));
var withdrawable_threshold = parseFloat($("#view_64 .field_89 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_89 .kn-detail-body").text().replace(/,/g, ""));

// Conditions Check Variables
var min_allowed_employee = parseFloat($("#view_65 .field_52 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_52 .kn-detail-body").text().replace(/,/g, ""));
var max_allowed_employee = parseFloat($("#view_65 .field_53 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_53 .kn-detail-body").text().replace(/,/g, ""));
var max_cutoff_allowed_employee = parseFloat($("#view_65 .field_123 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_123 .kn-detail-body").text().replace(/,/g, ""));

var min_allowed_company = parseFloat($("#view_64 .field_87 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_87 .kn-detail-body").text().replace(/,/g, ""));
var max_allowed_company = parseFloat($("#view_64 .field_90 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_90 .kn-detail-body").text().replace(/,/g, ""));
var max_cutoff_allowed_company = parseFloat($("#view_64 .field_124 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_124 .kn-detail-body").text().replace(/,/g, ""));

var employment_start_txt = $("#view_65 .field_78 .kn-detail-body").text().trim();
var employment_start = new Date(employment_start_txt.split("/")[2], employment_start_txt.split("/")[1] - 1, employment_start_txt.split("/")[0]);
var today = new Date();
var employed_since_days = Math.ceil((today - employment_start) / (1000*60*60*24));

if (min_allowed_employee > 0 && min_allowed_company > 0) {
  var min_allowed = Math.max(min_allowed_employee, min_allowed_company);
} else if (min_allowed_employee > 0) {
  var min_allowed = min_allowed_employee;
} else if (min_allowed_company > 0) {
  var min_allowed = min_allowed_company;
} else {
  var min_allowed = 0;
}

if (max_allowed_employee > 0 && max_allowed_company > 0) {
  var max_allowed = Math.min(max_allowed_employee, max_allowed_company);
} else if (max_allowed_employee > 0) {
  var max_allowed = max_allowed_employee;
} else if (max_allowed_company > 0) {
  var max_allowed = max_allowed_company;
} else {
  var max_allowed = 0;
}

if (max_cutoff_allowed_employee > 0 && max_cutoff_allowed_company > 0) {
  var max_cutoff_allowed = Math.min(max_cutoff_allowed_employee, max_cutoff_allowed_company);
} else if (max_cutoff_allowed_employee > 0) {
  var max_cutoff_allowed = max_cutoff_allowed_employee;
} else if (max_cutoff_allowed_company > 0) {
  var max_cutoff_allowed = max_cutoff_allowed_company;
} else {
  var max_cutoff_allowed = 0;
}

// Get withdrawal fee value
var speed = $('input[name="view_133-field_92"]:checked').val();
if (speed.toLowerCase().indexOf("normal") > -1) {
  var withdrawal_fee = normal_fee_setting;
} else if (speed.toLowerCase().indexOf("fast") > -1) {
  var withdrawal_fee = fast_fee_setting;
} else if (speed.toLowerCase().indexOf("cutoff") > -1) {
  var withdrawal_fee = cutoff_fee_setting;
}
$("#view_133 #field_63").attr("value", withdrawal_fee);
var available_amount = calculate_withdrawable(base_salary, requested_amount, withdrawable_threshold);

var arr = [available_amount, max_allowed, max_cutoff_allowed, base_salary*0.1];

console.log("available amount:");
console.log(available_amount);
console.log("max allowed before cutoff:");
console.log(max_allowed);
console.log("max allowed after cutoff:");
console.log(max_cutoff_allowed);
console.log("10% of salary:");
console.log(base_salary*0.1);

var max_allowed_bis = Math.min.apply(null, arr.filter(Boolean));

if (max_allowed > 0) {
  if (max_allowed_bis >= min_allowed) {
    var request_amount = '<span class="amount-info-message">Amount should be between <span>' + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span> and <span>' + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span></span>';
  } else {
    var request_amount = '<span class="amount-info-message">The remaining balance (<span>' + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span>) is lower than the minimum withdrawal amount allowed (<span>" + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span>)</span>";
  }
} else {
  var request_amount = '<span class="amount-info-message">Amount should be greater than <span>' + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span></span>';
}
$(request_amount).insertAfter("#kn-input-field_18 label");

$("input[type=radio][name=view_133-field_92]").change(function () {
  var input_val = $("#field_18").val();
  var speed = $('input[name="view_133-field_92"]:checked').val();
  if (speed.toLowerCase().indexOf("normal") > -1) {
    withdrawal_fee = normal_fee_setting;
  } else if (speed.toLowerCase().indexOf("fast") > -1) {
    withdrawal_fee = fast_fee_setting;
  } else if (speed.toLowerCase().indexOf("cutoff") > -1) {
    withdrawal_fee = cutoff_fee_setting;
  }
  $("#view_133 #field_63").attr("value", withdrawal_fee);
  available_amount = calculate_withdrawable(base_salary, requested_amount, withdrawable_threshold);
  var output = amount_requested_checks(base_salary, employed_since_days, available_amount, min_allowed, max_allowed, max_cutoff_allowed, requested_transactions, max_number_requests, input_val);
  display_message(output);
});

$("input#field_18").on("input", function (e) {
  var input_val = $(this).val();
  var speed = $('input[name="view_133-field_92"]:checked').val();
  if (speed.toLowerCase().indexOf("normal") > -1) {
    withdrawal_fee = normal_fee_setting;
  } else if (speed.toLowerCase().indexOf("fast") > -1) {
    withdrawal_fee = fast_fee_setting;
  } else if (speed.toLowerCase().indexOf("cutoff") > -1) {
    withdrawal_fee = cutoff_fee_setting;
  }
  available_amount = calculate_withdrawable(base_salary, requested_amount, withdrawable_threshold);
  var output = amount_requested_checks(base_salary, employed_since_days, available_amount, min_allowed, max_allowed, max_cutoff_allowed, requested_transactions, max_number_requests, input_val);
  display_message(output);
});