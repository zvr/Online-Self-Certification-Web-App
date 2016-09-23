/**
 * Copyright (c) 2016 Source Auditor Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
*/
// From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// the following was copied from the jqueryUI sample code
function checkRegexp( o, regexp, n ) {
    if ( !( regexp.test( o.val() ) ) ) {
      o.addClass( "ui-state-error" );
      updateTips( n );
      return false;
    } else {
      return true;
    }
  }
function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
      o.addClass( "ui-state-error" );
      updateTips( "Length of " + n + " must be between " +
        min + " and " + max + "." );
      return false;
    } else {
      return true;
    }
  }

function checkEquals(a, b, n) {
	if (a.val() != b.val()) {
		a.addClass( "ui-state-error" );
		b.addClass( "ui-state-error" );
		updateTips(n + " do not match.");
	}
}
function updateTips( t ) {
    tips
      .text( t )
      .addClass( "ui-state-highlight" );
    setTimeout(function() {
      tips.removeClass( "ui-state-highlight", 1500 );
    }, 500 );
  }
var username;
var tips;


function loginUser() {
	username = $("#login-username");
	var password = $("#login-password");
	tips = $(".validateTips");
	tips.text('');
	var valid = true;
	username.removeClass("ui-state-error");
	password.removeClass("ui-state-error");
	valid = valid && checkLength( username, "username", 3, 40 );
	valid = valid && checkLength( password, "password", 8, 60 );
	valid = valid && checkRegexp( username, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
	if (valid) {
		$.ajax({
		    url: "CertificationServlet",
		    data:JSON.stringify({
		        request:  "login",
		        username: username.val(),
		        password: password.val()
		    }),
		    type: "POST",
		    dataType : "json",
		    contentType: "json",
		    async: false, 
		    success: function( json ) {
		    	if ( json.status == "OK" ) {
		    		// redirect to the survey page
		    		window.location = "survey.html";
		    	} else {
		    		displayError( json.error );
		    	} 	
		    },
		    error: function( xhr, status, errorThrown ) {
		    	handleError(xhr, status, errorThrown);
		    }
		});
	}
}
function displayError( error ) {	
	$( "#errors" ).dialog({
		title: "Error",
		resizable: false,
	    height: 250,
	    width: 300,
	    modal: true,
	    buttons: {
	        "Ok" : function () {
	            $( this ).dialog( "close" );
	        }
	    }
	}).text( error ).parent().addClass( "ui-state-error" );
}

function handleError(xhr, status, errorThrown, msg) {
	if ( msg === undefined ) {
		if ( xhr.responseText != null && xhr.responseText!= "" ) {
			msg = "Sorry - there was a problem loading data: " + xhr.responseText;
		} else {
			msg = "Sorry - there was a problem loading data: " + errorThrown;
		}
	}
	if ( xhr.status == 401 ) {
		openSignInDialog();	// open the login dialog
	} else {
		displayError( msg );
        console.log( "Error: " + xhr.responseText );
        console.log( "Status: " + status );
        console.dir( xhr );
	}	
}

function signout() {
	$.ajax({
	    url: "CertificationServlet",
	    data:JSON.stringify({
	        request:  "logout"
	    }),
	    type: "POST",
	    dataType : "json",
	    contentType: "json",
	    async: false, 
	    success: function( json ) {
	    	if ( json.status == "OK" ) {
	    		createNavMenu();	// recreate the menu for logged out
	    		var certForm = $("#CertForm");
	    		if (certForm) {
	    			certForm.empty();
	    		}
	    		// redirect to home
	    		window.location = "index.html";
	    	} else {
	    		displayError( json.error );
	    	} 	
	    },
	    error: function( xhr, status, errorThrown ) {
	    	handleError(xhr, status, errorThrown);
	    }
	});
}

function signupUser() {
	username = $("#signup-username");
	var password = $("#signup-password");
	var passwordVerify = $("#signup-passwordverify");
	var name = $("#signup-name");
	var organization = $("#signup-organization");
	var email = $("#signup-email");
	var address = $("#signup-address");
	tips = $(".validateTips");
	tips.text('');
	var valid = true;
	username.removeClass("ui-state-error");
	password.removeClass("ui-state-error");
	passwordVerify.removeClass("ui-state-error");
	name.removeClass("ui-state-error");
	organization.removeClass("ui-state-error");
	email.removeClass("ui-state-error");
	address.removeClass("ui-state-error");
	valid = valid && checkLength( username, "username", 3, 40 );
	valid = valid && checkLength( password, "password", 8, 60 );
	valid = valid && checkLength( passwordVerify, "password", 8, 60 );
	valid = valid && checkLength( name, "Name", 3, 100 );
	valid = valid && checkLength( organization, "Organization", 1, 100 );
	valid = valid && checkLength( email, "email", 3, 100 );
	valid = valid && checkLength( address, "address", 3, 500 );
	checkEquals(password, passwordVerify, "passwords");
	valid = valid && checkRegexp( username, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
	valid = valid && checkRegexp( email, emailRegex, "e.g. user@linux-foundation.org");
	if (valid) {
		signup(username.val(), password.val(), name.val(), address.val(), organization.val(), email.val());
	}
}

function signup(username, password, name, address, organization, email) {
	$.ajax({
	    url: "CertificationServlet",
	    data:JSON.stringify({
	        request:  "signup",
	        username: username,
	        password: password,
	        name: name,
	        address: address,
	        organization: organization,
	        email: email
	    }),
	    type: "POST",
	    dataType : "json",
	    contentType: "json",
	    async: false, 
	    success: function( json ) {
	    	if ( json.status == "OK" ) {
	    		$("#signup").dialog("close");
	    		// redirect to the successful signup page
	    		window.location = "signupsuccess.html";
	    	} else {
	    		displayError( json.error );
	    	} 	
	    },
	    error: function( xhr, status, errorThrown ) {
	    	handleError(xhr, status, errorThrown);
	    }
	});
}

function openSignupDialog() {
	$("#signup").dialog("open");
}

function openSignInDialog() {
	$("#login").dialog("open");
}

/**
 * Create a navigation menu based on whether the user is logged in
 */
function createNavMenu() {
	$.ajax({
	    url: "CertificationServlet",
	    data: {
	        request: "getuser"
	    },
	    type: "GET",
	    dataType : "json",
	    success: function( json ) {
	    	html = '';
	    	if (json.loggedIn) {
	    		html += '<li id="user-dropdown_signout"><a href="javascript:void(0);"><span class="ui-icon-closethick">&nbsp;Sign out</span></a></li>\n';
	    	} else {
	    		html += '<li id="user-dropdown_signin"><a href="javascript:void(0);"><span class="ui-icon-plusthick">&nbsp;Sign in</span></a></li>\n';
	    		html += '<li id="user-dropdown_signup"><a href="javascript:void(0);"><span class="ui-icon-pencil">&nbsp;Sign up</span></a></li>\n';
	    	}
	    	html += '</ul>\n';
	    	$("#user-dropdown_menu").html(html);
	    	$("#usermenu").jui_dropdown( {
	    	    launcher_id: 'user-dropdown_launcher',
	    	    launcher_container_id: 'user-dropdown_container',
	    	    menu_id: 'user-dropdown_menu',
	    	    containerClass: 'user-dropdown_container',
	    	    menuClass: 'user-dropdown_menu',
	    	    launchOnMouseEnter: true,
	    	    onSelect: function( event, data ) {
	    	    	if ( data.id == "user-dropdown_signup" ) {
	    	    		openSignupDialog();
	    	    	} else if ( data.id == "user-dropdown_signout" ) {
	    	    		signout();
	    	    	} else if (data.id == "user-dropdown_signin") {
	    	    		openSignInDialog();
	    	    	}
	    	    }
	    	  });
	    },
	    error: function( xhr, status, errorThrown ) {
	    	handleError( xhr, status, errorThrown);
	    }
	});
}

function getVersion() {
	$.ajax({
	    url: "CertificationServlet",
	    data: {
	        request: "version"
	    },
	    type: "GET",
	    dataType : "json",
	    success: function( json ) {
	    	$( "#version" ).text( json );
	    },
	    error: function( xhr, status, errorThrown ) {
	    	handleError( xhr, status, errorThrown);
	    }
	});
}

function getQuestionFormHtml(questions) {
	var html = '<table>\n<col class=number_col /><col class=question_col />\n';
	for (var i = 0; i < questions.length; i++) {
		html += '<tr><td>' + questions[i].number + ':</td><td>' + questions[i].question + '</td>';
		html += '<td><input type="radio" name="answer-' + questions[i].number + '" id="answer-' + questions[i].number + '_yes" value="yes" />';
		html += '<label for="answer-' + questions[i].number + '_yes">Yes</label></td>';
		html += '<td><input type="radio" name="answer-' + questions[i].number + '" id="answer-' + questions[i].number + '_no" value="no" />';
		html += '<label for="answer-' + questions[i].number + '_no">No</label></td></tr>\n';
	}
	html += '</table>\n';
	return html;
}
function getSurvey() {
	var certForm = $("#CertForm");
	if (!certForm) {
		return;
	}
	$.ajax({
	    url: "CertificationServlet",
	    data: {
	        request: "getsurvey"
	    },
	    type: "GET",
	    dataType : "json",
	    success: function( survey ) {
	    	certForm.empty();
	    	var htmlList = '<ul>\n';
	    	var htmlDivs = '';
	    	var sections = survey.sections;
	    	for ( var i = 0; i < sections.length; i++ ) {
	    		var tabReference = 'section_' + sections[i].name;
	    		htmlList += '<li><a href="#' + tabReference + '">Section '+sections[i].name + '</a></li>\n';
	    		htmlDivs += '<div id="' + tabReference + '">\n';
	    		htmlDivs += '<h3>' + sections[i].name + ': ' + sections[i].title + "</h3>\n";
	    		htmlDivs += getQuestionFormHtml(sections[i].questions);
	    		var saveButtonText = 'Save & Continue';
	    		htmlDivs += '<div style="text-align:center"><button type="button" id="save_answers_'+sections[i].name+'" class="ui-button">'+saveButtonText+'</button></div>\n';
	    		htmlDivs += '</div>\n';
	    	}
	    	htmlList += '</ul>\n';
	    	certForm.html(htmlList + htmlDivs);
	    	certForm.tabs();
	    	// Add actions to the buttons
	    	for ( var i = 0; i < sections.length; i++ ) {
	    		$("#save_answers_"+sections[i].name).click(function() {
	    			var answers = [];
	    			$(this).parent().parent().find(":input").each(function(index) {
	    				var id = $(this).attr('id');
	    				if (id.substring(0,7) == 'answer-') {
	    					var value = $(this).attr('value');
	    					var checked = this.checked;
	    					var questionNumber = id.substring(7,id.lastIndexOf('_'));
		    				answers.push({'questionNumber':questionNumber, 'value':value, 'checked':checked});
	    				}
	    			});
	    			var data = JSON.stringify({request: "updateAnswers", 'answers': answers});
	    			$.ajax({
	    			    url: "CertificationServlet",
	    			    data: data,
	    			    contentType: "json",
	    			    type: "POST",
	    			    dataType : "json",
	    			    success: function( json ) {		    	
	    			    	//TODO: Move to the next tab
	    			    	if (json.status == "OK") {
	    			    		$( "#status" ).dialog({
		    			    		title: "Status",
		    			    		resizable: false,
		    			    	    height: 150,
		    			    	    width: 200,
		    			    	    modal: true,
		    			    	    buttons: {
		    			    	        "Ok" : function () {
		    			    	            $( this ).dialog( "close" );
		    			    	        }
		    			    	    }
		    			    	}).text('Updated answer for section '+json.sectionName);
	    			    	} else {
	    			    		displayError(json.error);
	    			    	}
	    			    	
	    			    },
	    		    error: function( xhr, status, errorThrown ) {
	    		    	handleError( xhr, status, errorThrown);
	    		    }
	    		  });
	    		});
	    	}
	    },
	    error: function( xhr, status, errorThrown ) {
	    	handleError( xhr, status, errorThrown);
	    }
	});
}

$(document).ready( function() {
	$("#login").dialog({
		title: "Login",
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: [{
			text: "Login",
			click: function() {
				loginUser();
			}
		}, {
			text: "Cancel",
			click: function() {
				$(this).dialog("close");
			}
		}]
	}).find("form").on("submit", function(event) {
		event.preventDefault();
		loginUser();
	});
        
	$("#signup").dialog({
		title: "Sign Up",
		autoOpen: false,
		height: 600,
		width: 400,
		modal: true,
		buttons: [{
			text: "Sign Up",
			click: function() {
				signupUser();
			}
		}, {
			text: "Cancel",
			click: function() {
				$(this).dialog("close");
			}
		}]
	}).find("form").on("submit", function(event) {
		event.preventDefault();
		signupUser();
	});
	getVersion();
	createNavMenu();
	getSurvey();
//    $("#myform").dform('CertificationServlet?request=getsurveyform', function(data) {

//    });
//	getSurvey();
    
          //TODO: Add display of errors on 500

});