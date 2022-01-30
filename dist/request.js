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

amount_requested_checks = function (withdrawable_amount, min_allowed, max_allowed, cutoff_day, payday, max_nb_requests, input_val) {
  var max_allowed_bis = Math.min(max_allowed, withdrawable_amount);
  
  // condition1 : cutoff date
  if (cutoff_day == "-") {
    var cond1 = false;
  } else {
    var cond1_cutoff = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) <= new Date(cutoff_day.split("/")[2], cutoff_day.split("/")[1] - 1, cutoff_day.split("/")[0]);
    var cond1_payroll = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) > new Date(payday.split("/")[2], payday.split("/")[1] - 1, payday.split("/")[0]);
    var cond1 = cond1_cutoff || cond1_payroll;
  }

  // condition2: total number of requests per month
  var past_requests = {};
  $("#view_66 .kn-report-content table tbody tr").each(function () {
    var day = $(this).find(".kn-pivot-group").text().trim();
    var count = parseInt($(this).find(".kn-pivot-calc:eq(1)").text().trim());
    past_requests[day] = count;
  })
  
  var nb_requests = 0;
  for (var key of Object.keys(past_requests)) {
    if (new Date(2022, key.split("/")[1]-1, key.split("/")[0]) > new Date(payday.split("/")[2], payday.split("/")[1] - 1, payday.split("/")[0])) {
      var nb_requests = nb_requests + past_requests[key];
    }
  }
  var cond2 = max_nb_requests <= 0 || nb_requests < max_nb_requests;
  
  // condition3: remaining balance is lower than the minimum withdrawal amount allowed
  if (max_allowed_bis < min_allowed) {
    var cond3 = false;
  } else {
    var cond3 = true;
  }

  // condition4: input in range
  if (max_allowed > 0) {
    var cond4 = input_val > 0 && input_val >= min_allowed && input_val <= max_allowed_bis && input_val <= withdrawable_amount;
  } else {
    var cond4 = input_val > 0 && input_val >= min_allowed && input_val <= withdrawable_amount;
  }

  // condition5: terms and conditions checked
  if($("#view_133 #kn-input-field_142 input").is(":checked")) {
    var cond5 = true;
  } else {
    var cond5 = false;
  }

  // condition6: signature filled in
  var base30Data = $("#view_133-field_119").jSignature('getData','base30')[1];
  if (base30Data.trim() == "") {
    var cond6 = false;
  } else {
    var cond6 = true;
  }

  // condition7: security clause not empty
  var clause_input = $("#view_133 #kn-input-field_141 input").val();
  if (clause_input.length <= 10) {
    var cond7 = false;
  } else {
    var cond7 = true;
  }

  // Get requests' count per payback status
  var requests_by_payback = {};
  $("#view_147 table tbody tr").each(function () {
      var status = $(this).find(".kn-pivot-group span").attr("class");
      var count = parseInt($(this).find(".kn-pivot-calc").text().trim());
      requests_by_payback[status] = count;
  })

  // condition8: payslips uploaded
  var cond8 = requests_by_payback["not-paid"] == 0;

  // condition9: payslips verified
  var cond9 = requests_by_payback["uploaded"] == 0;

  // compiling all
  if (cond8 == false) {
    return {status: false, error: "Please pay back the advance you have received to be able to submit a new request."};
  } else if (cond9 == false) {
    return {status: false, error: "Please wait until your payslips are approved to be able to submit a new request."};
  } else if (cond1 == false) {
    return {status: false, error: "We are past cutoff date. You can request a new advance requests after you received your next salary."};
  } else if (cond2 == false) {
    return {status: false, error: "You have reached the maximum number of advance requests for this month. You can request a new advance after you received your next salary."};
  } else if (cond3 == false) {
    return {status: false, error: "The remaining balance (" + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ") is lower than the minimum withdrawal amount allowed (" + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ")"};
  } else if (cond4 == false && max_allowed > 0) {
    return {status: false, error: "Please provide an amount between " + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " and " + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")};
  } else if (cond4 == false) {
    return {status: false, error: "Please provide an amount greater than " + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")};
  } else if (cond5 == false || cond7 == false) {
    return {status: false, error: "Please accept the terms & conditions to proceed"};
  } else if (cond6 == false) {
    return {status: false, error: "Please sign the form to proceed"};
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
    $("#view_133 form .kn-submit .kn-button.is-primary").prop("disabled", false);
  } else {
    $("#view_133 form .kn-submit .kn-button.is-primary").prop("disabled", true);
  }
};

// Change the type of the input field of the amount to "number"

$("#view_133 #field_18").prop("type", "number");

// Wrapping the tips amount for styling purposes

$("#kn-input-field_126 .kn-radio .control:lt(3)").wrapAll('<div class="wrapper-tips"></div>');

// Adding tip amounts on load -> all zeros

$('.view_133 form #kn-input-field_126 .wrapper-tips .control').each(function () {
  $("<span class='tip-amt'>฿0</span>").insertAfter($(this).find("label"));
});

// Function that updates the proceed button state on jsignature field change

/* $("#view_133-field_119").change(function () {
  var base30Data = $("#view_133-field_119").jSignature('getData','base30')[1];
  if (base30Data.trim() == "") {
    $('#next-cutoff-btn').prop("disabled", true);
    $('#next-cutoff-btn').addClass("disabled");
  } else {
    $('#next-cutoff-btn').prop("disabled", false);
    $('#next-cutoff-btn').removeClass("disabled");
  }
}); */

var security_clause = `<div id="security-clause">
                        <p class="sc-instructions">Please write <span class="clause">"I will pay back the salary advance on {payday_current} before 10am"</span> below to proceed</p>
                      </div>`;

$(security_clause).insertBefore($("#view_133 #kn-input-field_141"));

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

// Withdrawal Speed

$('.view_133 form #kn-input-field_92.kn-input .kn-radio .control').each(function () {
  let radioContent = $(this).find('.option.radio div');
  let radioContentText = $(radioContent).text().trim().split('-');

  if ($(radioContent).text().toLowerCase().indexOf("normal") > -1) {
      $(this).addClass("selected");
      var fee_message = normal_fee_message;
      var withdrawal_speed = normal_withdrawal_speed.trim();
      var speed_type = "normal";
  } else if ($(radioContent).text().toLowerCase().indexOf("fast") > -1) {
    var fee_message = fast_fee_message;
    var withdrawal_speed = fast_withdrawal_speed.trim();
    var speed_type = "fast";
  } else {
    var fee_message = cutoff_fee_message;
    var withdrawal_speed = cutoff_withdrawal_speed.trim();
    var speed_type = "cutoff";
  }

  let newContentTemplate = `
      <div class='${speed_type}'>
          <span class='widthdrawl-radio'>
              <span class='wr-title'>${radioContentText[0]}</span>
              <span class='wr-desc'>${radioContentText[1].replace('{withdrawal_fee}', fee_message).replace('{withdrawal_speed}', withdrawal_speed)}</span>
          </span>
      </div>
  `;
  $(radioContent).html(newContentTemplate);
});

// Disabling the fast withdrawal option

$("div.fast").parents("label").find("input").attr("disabled", true);

/* $('.view_133 form .kn-radio input[type=radio][name=view_133-field_92]').change(function (e) {
  $('.view_133 form .kn-radio input').each(function () {
      $(this).closest('.control').removeClass('selected');
  });
  if (!$(e.target).closest('.control').hasClass('selected'))
      $(e.target).closest('.control').addClass('selected');
}); */

// Tipping Feature

$('.view_133 form #kn-input-field_126.kn-input .kn-radio .control').each(function () {
  let radioContent = $(this).find('.option.radio div');

  if ($(radioContent).text().toLowerCase().indexOf("10%") > -1) {
    $(this).addClass("selected");
  }
});

$('.view_133 form #kn-input-field_126 .kn-radio input[type=radio][name=view_133-field_126]').change(function (e) {
  $('.view_133 form #kn-input-field_126 .kn-radio input').each(function () {
      $(this).closest('.control').removeClass('selected');
  });

  if (!$(e.target).closest('.control').hasClass('selected'))
      $(e.target).closest('.control').addClass('selected');
});

// Hide error and validation message on form submit

$(document).on("knack-form-submit.view_133", function (event, view, record) {
  $(".error-message-custom").hide();
  $(".validation-message-custom").hide();
});

// Disable the Submission Button
$("#view_133 form .kn-submit .kn-button.is-primary").prop("disabled", true);

// Variables for Global Conditions
// var requested_transactions = parseInt($("#view_66 .kn-pivot-calc:eq(1)").text().replace(/,/g, "") == "" ? 0 : $("#view_66 .kn-pivot-calc:eq(1)").text().replace(/,/g, ""));
var max_number_requests = parseFloat($("#view_64 .field_91 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_91 .kn-detail-body").text().replace(/,/g, ""));
var input_val = 0;

var current_month = new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1));
var cutoff_day = "-";

var months = $("#view_97 .kn-table tbody td.field_88 span");
var cutoffs = $("#view_97 .kn-table tbody td.field_82 span");
var paydays = $("#view_97 .kn-table tbody td.field_76 span");

$.each(months, function(i,v) {
  if (v.textContent.trim() == current_month) {
    cutoff_day = cutoffs[i].textContent.trim();
    payday = paydays[i].textContent.trim();
  }
});

var cutoff_day = cutoff_day == "" ? "-" : cutoff_day;
var payday = payday == "" ? "-" : payday;

var new_clause_html = $("#view_133 #security-clause p.sc-instructions").html().replace("{payday_current}", payday);
$("#view_133 #security-clause p.sc-instructions").replaceWith('<p class="sc-instructions">' + new_clause_html + "</p>");

// Calculate Withdrawable Amount Variables
var base_salary = parseFloat($("#view_65 .field_44 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_44 .kn-detail-body").text().replace(/,/g, ""));
var requested_amount = parseFloat($("#view_66 .kn-pivot-calc:eq(0)").text().replace(/,/g, "") == "" ? 0 : $("#view_66 .kn-pivot-calc:eq(0)").text().replace(/,/g, ""));
var withdrawable_threshold = parseFloat($("#view_64 .field_89 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_89 .kn-detail-body").text().replace(/,/g, ""));

// Conditions Check Variables
var min_allowed_employee = parseFloat($("#view_65 .field_52 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_52 .kn-detail-body").text().replace(/,/g, ""));
var max_allowed_employee = parseFloat($("#view_65 .field_53 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_53 .kn-detail-body").text().replace(/,/g, ""));
// var max_cutoff_allowed_employee = parseFloat($("#view_65 .field_123 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_65 .field_123 .kn-detail-body").text().replace(/,/g, ""));

var min_allowed_company = parseFloat($("#view_64 .field_87 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_87 .kn-detail-body").text().replace(/,/g, ""));
var max_allowed_company = parseFloat($("#view_64 .field_90 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_90 .kn-detail-body").text().replace(/,/g, ""));
// var max_cutoff_allowed_company = parseFloat($("#view_64 .field_124 .kn-detail-body").text().replace(/,/g, "") == "" ? 0 : $("#view_64 .field_124 .kn-detail-body").text().replace(/,/g, ""));

// var employment_start_txt = $("#view_65 .field_78 .kn-detail-body").text().trim();
// var employment_start = new Date(employment_start_txt.split("/")[2], employment_start_txt.split("/")[1] - 1, employment_start_txt.split("/")[0]);
// var today = new Date();
// var employed_since_days = Math.ceil((today - employment_start) / (1000*60*60*24));

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

// Tipping amount

var tipping_options = $('input[name="view_133-field_126"]:checked').val();
if (tipping_options.toLowerCase().indexOf("5%") > -1) {
  var tip_perc = 0.05;
} else if (tipping_options.toLowerCase().indexOf("10%") > -1) {
  var tip_perc = 0.1;
} else if (tipping_options.toLowerCase().indexOf("20%") > -1) {
  var tip_perc = 0.2;
} else {
  var tip_perc = 0;
}

$("#view_133 #field_127").attr("value", (Math.round(requested_amount*tip_perc*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

$("input[type=radio][name=view_133-field_126]").change(function () {
  var input_val = $("#field_18").val();
  var tipping_options = $('input[name="view_133-field_126"]:checked').val();
  if (tipping_options.toLowerCase().indexOf("5%") > -1) {
    var tip_perc = 0.05;
  } else if (tipping_options.toLowerCase().indexOf("10%") > -1) {
    var tip_perc = 0.1;
  } else if (tipping_options.toLowerCase().indexOf("20%") > -1) {
    var tip_perc = 0.2;
  } else {
    var tip_perc = 0;
  }
  $("#view_133 #field_127").attr("value", (input_val*tip_perc).toFixed(2));
});

if (max_allowed > 0) {
  var max_allowed_bis = Math.min(max_allowed, available_amount);
  if (max_allowed_bis >= min_allowed) {
    var request_amount = '<span class="amount-info-message">Amount should be between <span>฿' + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span> and <span>฿' + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span></span>';
  } else {
    var request_amount = '<span class="amount-info-message">The remaining balance (<span>฿' + (Math.round(max_allowed_bis*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span>) is lower than the minimum withdrawal amount allowed (<span>฿" + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</span>)</span>";
  }
} else {
  var request_amount = '<span class="amount-info-message">Amount should be greater than <span>฿' + (Math.round(min_allowed*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span></span>';
}
$(request_amount).insertAfter("#kn-input-field_18 label");
var increase_statement = `<div class="information-increase">
                            <span class="material-icons">info</span>
                            <span class="text-info">Your limit will gradually increase up to <b>฿4,000</b> if you pay back your salary advance on time every month.</span>
                          </div>`;
$(increase_statement).insertAfter("#view_133 #field_18");

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
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
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
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);

  $('.view_133 form #kn-input-field_126 .wrapper-tips .control').each(function () {
    var perc = $(this).find("label div").text().replace("%","")/100;
    var tip_amount = perc*input_val;
    $(this).find("span.tip-amt").text("฿" + (Math.round(tip_amount*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  var tipping_options = $('input[name="view_133-field_126"]:checked').val();
  if (tipping_options.toLowerCase().indexOf("5%") > -1) {
    var tip_perc = 0.05;
  } else if (tipping_options.toLowerCase().indexOf("10%") > -1) {
    var tip_perc = 0.1;
  } else if (tipping_options.toLowerCase().indexOf("20%") > -1) {
    var tip_perc = 0.2;
  } else {
    var tip_perc = 0;
  }
  $("#view_133 #field_127").attr("value", (input_val*tip_perc).toFixed(2));
});

// Validation of the security clause, T&C checkbox and signature

$("#view_133 #kn-input-field_141 input").on("input", function (e) {
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
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);
});

$("#view_133 #kn-input-field_142 input").change(function () {
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
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);
})

$("#view_133-field_119").change(function () {
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
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);
  var output = amount_requested_checks(available_amount, min_allowed, max_allowed, cutoff_day, payday, max_number_requests, input_val);
  display_message(output);
})