function request(event) {

	var update_docs = function (response) {

        request_docs = null;

		$("#docs").empty();
		$("#docs").append($("<div class='url'></div>").text(response['url']));
		$("#docs").append($("<div class='stats'></div>").text(response['count'] + " [" + response['time_search_ms'] + "/" + response['time_server_ms'] + "/" + (new Date().getTime() - t1)  + "ms]"));

		$.each(response['data'], function(idx, val) {
			if (idx > MAX_RESULTS) return;
			var s = "<div class='doc'>" +
					"<div class='title'>" + val['title'] + "</div>" +
					"<div class='detail'>" + val['date_recorded'] + " " + _names(val['assignors']) + " > " + _names(val['assignees']) + " (" + val['correspondent'] + ")</div>" +
					"<div class='detail'>APP ID: " + val['id_app']['number'] + " PAT NO: " + val['id_pat']['number'] + " PUB NO: " + val['id_pub']['number'] + " DOC: " + val['uuid'] + "</div>" +
					"</div>"
			$("#docs").append(_hl(s));
		});

		function _names(val) {
			var names = [];
			$.each(val, function(idx, v) {
				names.push(v['name']);
			});
			return names.join("; ");
		}

	}

    var update_aggs = function (response) {

        request_aggs = null;

		$("#aggs").empty();
		$("#aggs").append($("<div class='url'></div>").text(response['url']));
		$("#aggs").append($("<div class='stats'></div>").text(response['count'] + " [" + response['time_search_ms'] + "/" + response['time_server_ms'] + "/" + (new Date().getTime() - t1)  + "ms]"));

        function _agg(key) {
            var agg = $("<div class='agg'></div>").append("<div class='title'>" + key.toUpperCase() + "</div>");
            $.each(response['data'][key], function(idx, val) {
                agg.append("<div class='detail'>" + _hl(val['key']) + " : " + val['doc_count'] + "</div>");
            });
            return agg;
	    }

        if (response.count > 0) {
            $("#aggs").append(_agg("assignors"));
            $("#aggs").append(_agg("assignees"));
            $("#aggs").append(_agg("volumes"));
        }

	}

	var t1 = new Date().getTime()

    // abort previous request
    if (request_docs != null) {
//         console.log("aborting docs request");
        request_docs.abort();
        request_docs = null;
    }
    if (request_aggs != null) {
//         console.log("aborting aggs request");
        request_aggs.abort();
        request_aggs = null;
    }

	var terms = $(this).val().replace(SPACES, " ").trim().split(" ").join(",").toLowerCase();
	var re = new RegExp("(" + terms.toUpperCase().split(",").map(function(s){ return "\\b" + s; }).join("|") + ")", "g")
	console.log(re)

    function _hl(s) {
        return s.replace(re, "<em>$1</em>");
    }

	request_docs = $.ajax({
		url: BASE + "/api/transfers/docs?terms=" + terms,
		type: "GET",
		dataType : "json",
		success: function (response) {
			update_docs(response);
		},
		error: function (response) {
			console.log(response.statusText);
			$("#docs").empty();
		}
	});

	request_aggs = $.ajax({
		url: BASE + "/api/transfers/aggs?terms=" + terms,
		type: "GET",
		dataType : "json",
		success: function (response) {
			update_aggs(response);
		},
		error: function (response) {
			console.log(response.statusText);
			$("#aggs").empty();
		}
	});

}

function ignore(event) {
	if(event.keyCode == 13){
		event.preventDefault();
	}
}

const MAX_RESULTS = 25;

var BASE = "http://" + (document.domain || "localhost:8080");
var SPACES = new RegExp("[^A-Za-z0-9_\-]+", "g");
var request_docs = null;
var request_aggs = null;

$( document ).ready(function() {
	$("#searchbox").on("keyup", request);
	$("#searchform").on("submit", request);
});

