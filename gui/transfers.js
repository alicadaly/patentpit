function request(event) {

	var update_docs = function (response) {

        request_docs = null;

		$("#docs").empty();
		$("#docs").append($("<div class='url'></div>").text("API URL: " + response['url']));
		$("#docs").append($("<div class='stats'></div>").text("RESULTS: " + response['count'] + " | SEARCH TIME: " + response['time_search_ms'] + "ms | TOTAL REQUEST TIME: " + (new Date().getTime() - t1) + "ms"  ));

		$.each(response['data'], function(idx, r) {
			if (idx > MAX_RESULTS) return;
			var s = "<div class='doc'>" +
					"<div class='title'>" + r['patent']['titles'][0] + "</div>" +
					"<div class='detail'>FROM: " + _date(r['owner']['date_from']) + " | UNTIL: " + _date(r['owner']['date_to']) + " | OWNER/S: " + _names(r) + " | " + _ids(r) + " </div>"
			$("#docs").append(_hl(s));
		});

        function _date(d) {
            if ((d === "1970-01-01") || (d === "2100-01-01")) {
//                 d = "          ";
                d = "unknown   ";
            }
            return d;
        }

		function _names(record) {
			var names = [];
			$.each(record['owner']['name'], function(idx, n) {
				names.push(n);
			});
			return names.join("; ");
		}

        function _ids(record) {
            var ids = [];
            $.each(record['patent']['ids'], function(idx, i) {
                if ((i['type'] == 'PUB') || (i['type'] == 'PAT')) {
                    ids.push(i['type'] + ":&nbsp;<a href='https://www.google.com/patents/US" + i['number'] + "'>" + i['number'] + "</a>");
                }
                else {
                    ids.push(i['type'] + ":&nbsp;" + i['number']);
                }
            });
            return ids.join(" ");
        }

	}

//     var update_aggs = function (response) {
//
//         request_aggs = null;
//
// 		$("#aggs").empty();
// 		$("#aggs").append($("<div class='url'></div>").text(response['url']));
// 		$("#aggs").append($("<div class='stats'></div>").text(response['count'] + " [" + response['time_search_ms'] + "/" + response['time_server_ms'] + "/" + (new Date().getTime() - t1)  + "ms]"));
//
//         function _agg(key) {
//             var agg = $("<div class='agg'></div>").append("<div class='title'>" + key.toUpperCase() + "</div>");
//             $.each(response['data'][key], function(idx, val) {
//                 agg.append("<div class='detail'>" + _hl(val['key']) + " : " + val['doc_count'] + "</div>");
//             });
//             return agg;
// 	    }
//
//         if (response.count > 0) {
//             $("#aggs").append(_agg("assignors"));
//             $("#aggs").append(_agg("assignees"));
//             $("#aggs").append(_agg("volumes"));
//         }
//
// 	}

	var t1 = new Date().getTime()

    // abort previous request
    if (request_docs != null) {
        request_docs.abort();
        request_docs = null;
    }
//     if (request_aggs != null) {
//         request_aggs.abort();
//         request_aggs = null;
//     }

	var terms = $("#searchbox").val()
		.replace(SPACES, " ")
		.trim()
		.split(" ")
		.join(",")
		.toLowerCase();
    document.location.hash = terms

	var matches = terms
		.toUpperCase()
		.split(",")
		.map(function(s){ return "\\b" + s; })
		.join("|");
	var hl_re = new RegExp("(" + matches + ")", "g");

    function _hl(s) {
        return s.replace(hl_re, "<em>$1</em>");
    }

	request_docs = $.ajax({
		url: BASE + "/api/owners/docs?terms=" + terms,
		type: "GET",
		dataType : "json",
		success: function (response) {
			update_docs(response);
		},
		error: function (response) {
// 			console.log(response.statusText);
			$("#docs").empty();
		}
	});

// 	request_aggs = $.ajax({
// 		url: BASE + "/api/transfers/aggs?terms=" + terms,
// 		type: "GET",
// 		dataType : "json",
// 		success: function (response) {
// 			update_aggs(response);
// 		},
// 		error: function (response) {
// // 			console.log(response.statusText);
// 			$("#aggs").empty();
// 		}
// 	});

}

function ignore(event) {
	if(event.keyCode == 13){
		event.preventDefault();
	}
}

const MAX_RESULTS = 25;

var BASE = "http://" + (document.domain || "localhost:8080");
// var BASE = "http://patentpit.com";
var SPACES = new RegExp("[^A-Za-z0-9_\-]+", "g");
var request_docs = null;
// var request_aggs = null;

$( document ).ready(function() {

	var h = document.location.hash
		.replace(SPACES, " ")
		.trim()
		.toUpperCase();

	if (h != "") {
		$("#searchbox").val(h)
		request(null);
	}

	$("#searchbox").on("keyup", request);
	$("#searchform").on("submit", request);
});

