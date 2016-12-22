var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var S = require('string');

require('dotenv').config();
var AMSDomain = process.env.AMS_DOMAIN
var AMSStudentPageUrl = process.env.AMS_STUDENT_PAGE_URL
var AMSStudentPageAlternateUrl = process.env.AMS_STUDENT_PAGE_URL_ALTERNATE;

var parseAttendance = function(data) {
	
	return new Promise(function(resolve, reject){
		var attendance = [];
		$ = cheerio.load(data);
		var rows = $;
		var numRows = rows.length;
		for(i=0;i<=numRows;i++){
			
			$('tr').each(function(a, ele){
				var subject = {};
				$(this).children().each(function(n, element){
                    if(n === 0) {
                        subject.code = $(this).find('span').text().replace('\n', '');
                    }
					if(n === 1){
						subject.name = $(this).find('span').text().replace('\n', '');
					}
					if(n === 5){
						subject.attendance = parseInt($(this).find('span').text());
						attendance[a] = subject;
						subject = null;
					}
					
				});
			});
		}
		resolve(attendance);
	});
}

var parseMarks = function(data) {


    return new Promise(function(resolve, reject){
		var marks = [];
		$ = cheerio.load(data);
		var rows = $;
		var numRows = rows.length;
		for(i=0;i<=numRows;i++){
			
			$('tr').each(function(a, ele){
				var subject = {};
				$(this).children().each(function(n, element){
                    if(n === 0) {
                        subject.code = $(this).find('span').text().replace('\n', '');
                    }
					if(n === 1){
						subject.name = $(this).find('span').text().replace('\n', '');
					}
					if(n === 2){
						subject.marks = parseFloat($(this).find('span').text());
						marks[a] = subject;
						subject = null;
					}
					
				});
			});
		}
		resolve(marks);
	});
}

var parseGPA = function(data) {
    return new Promise(function(resolve, reject){
		var gpa = {};
		$ = cheerio.load(data);
		var rows = $;
		var numRows = rows.length;
			
			$('tr').each(function(a, ele){
				var subject = {};
                var seminfo;
				$(this).children().each(function(n, element){
					if(n === 0){
                        seminfo = $(this).find('span').text();
                        seminfo = seminfo.charAt(seminfo.length-1);
					}
					if(n === 1){
                        gpa[seminfo]  = parseFloat($(this).find('span').text());
                        if(isNaN(gpa[seminfo])){
                            gpa[seminfo] = null;
                        }
					}
					
				});
			});
		resolve(gpa);
	});
}

module.exports.getAllData = function(type, username, password){

    var form = {USERNAME:username, PASSWORD:password};

    if(type === "regbirth") {
        AMSStudentPageUrl = AMSStudentPageAlternateUrl;
        form.idValue = username;
        form.birthDate_i18n = password;
        form.birthDate = password;
        delete form.USERNAME;
        delete form.PASSWORD;
    }

    var dataForDB = {};
    dataForDB.marks = [];

    return new Promise(function(resolve, reject){

        var takeSecondAction = function(err, response, body) {
                    
                    if (!err && response.statusCode == 200) {

                        dataForDB.md5value = md5(body);
                    
                        $ = cheerio.load(body);

                        $('table').each(function(i, ele){
                            if(ele.attribs.id === 'ListAttendanceSummary_table') {
                                
                                $('#ListAttendanceSummary_table > script').remove();
                                $('#ListAttendanceSummary_table > thead').remove();
                                parseAttendance($('#ListAttendanceSummary_table').html()).then(function(data){
                                    dataForDB.attendance = data;
                                });
                            }
                            else if(ele.attribs.id === "ListAssessmentScores_table") {
                                $(this).children('thead').remove();
                                $(this).children('script').remove();
                                parseMarks(ele).then(function(res){
                                    dataForDB.marks.push(res);
                                });
                            }
                            else if(ele.attribs.id === "ProgramAdmissionItemSummary_table") {
                                $(this).children('script').remove();
                                parseGPA(ele).then(function(res){
                                    dataForDB.gpa = res;
                                });
                            }
                        });

                        return resolve(dataForDB);
                        
                        
                    }
                    else {
                        return reject('AMS returned ' + response.statusCode + ' status code. Possibly offline.');
                    }
        }

        var takeAction = function(err, response, body){
            if(response.statusCode == 200) {
                $ = cheerio.load(body);

                if($('#loginbox').length >= 1) {
                    return reject('Login unsuccessful');
                }
                
                var link = $('a:contains("Academic Status")').attr('href');
                
                var cookie = response.headers['set-cookie'];

                var options = {url:AMSDomain + link, headers: {'Cookie': cookie}};
                request(options, takeSecondAction);
            }
            else {
                return reject('AMS returned ' + response.statusCode + ' status code. Possibly offline.');
            }
        };

        request.post({url:AMSDomain + AMSStudentPageUrl, form:form}, takeAction);

    });
}