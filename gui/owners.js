function process(event) {

	function updateDocs(response) {

        docsRequest = null;

		$("#docs .stats").empty();
		$("#docs .stats").append("<div>API URL: " + response['url'] + "</div>");
		$("#docs .stats").append("<div>RESULTS: " + response['count'] + " SEARCH TIME: " + response['time_search_ms'] + "ms TOTAL REQUEST TIME: " + (new Date().getTime() - t1) + "ms</div>");

		$("#docs .data").empty();

		$.each(response['data'], function(idx, r) {
			var s = "<div class='item'>" +
					"<div class='title'>" + r['patent']['titles'][0] + "</div>" +
					"<div class='detail'>FROM: " + _date(r['owner']['date_from']) + " UNTIL: " + _date(r['owner']['date_to']) + " " + _ids(r) + " </div>" +
					"<div class='detail'>OWNERS: " + _names(r) + "</div>";
			$("#docs .data").append(_highlight(s));
		});

	}

	function updateAggs(response) {

        aggsRequest = null;

		$("#aggs .stats").empty();
		$("#aggs .stats").append("<div>API URL: " + response['url'] + "</div>");
		$("#aggs .stats").append("<div>RESULTS: " + response['count'] + " SEARCH TIME: " + response['time_search_ms'] + "ms TOTAL REQUEST TIME: " + (new Date().getTime() - t1) + "ms</div>");

		$("#aggs .data").empty();


		$.each(response['data']['owners'], function(idx, r) {
			var s = "<div class='title'>" + r['key'] + ": " + r['doc_count'] + "</div>";
			$("#aggs .data").append(_highlight(s));
		});

	}

	var t1 = new Date().getTime()

    if (docsRequest != null) {
        docsRequest.abort();
        docsRequest = null;
    }

    if (aggsRequest != null) {
        aggsRequest.abort();
        aggsRequest = null;
    }

    $("#docs .stats").empty().append("processing documents...");
    $("#docs .data").empty();

    $("#aggs .stats").empty().append("processing aggregations...");
    $("#aggs .data").empty();

    var params = {
        "title": _clean($("#search_title").val()),
        "owners": _clean($("#search_owners").val()),
        "dates": _clean($("#search_dates").val()),
    };
    query = _encode(params);
    document.location.hash = query;

    // this is for highlighting
    var terms = [];
    terms = terms.concat(_clean($("#search_title").val()).split(","));
    terms = terms.concat(_clean($("#search_owners").val()).split(","));
    terms = terms.concat(_clean($("#search_dates").val()).split(","));
    terms = terms.filter(function(e){return e}); // remove empties
//     console.log(terms);
	var matches = terms.map(function(s){ return "\\b" + s.toUpperCase(); }).join("|");
// 	console.log(matches);
	var highlightRegex = new RegExp("(" + matches + ")", "g");
	console.log(highlightRegex);
    function _highlight(s) {
        return s.replace(highlightRegex, "<em>$1</em>");
    }

	docsRequest = $.ajax({
		url: BASE + "/api/owners/docs?" + query,
		type: "GET",
		dataType : "json",
		success: updateDocs,
		error: function (response) {
// 			console.log(response.statusText);
			$("#docs .stats").empty();
			$("#docs .data").empty();
		}
	});

	aggsRequest = $.ajax({
		url: BASE + "/api/owners/aggs?" + query,
		type: "GET",
		dataType : "json",
		success: updateAggs,
		error: function (response) {
// 			console.log(response.statusText);
			$("#aggs .stats").empty();
			$("#aggs .data").empty();
		}
	});

}

function _date(d) {
    if ((d === "1970-01-01") || (d === "2100-01-01")) {
        d = "unknown   ";
    }
    return d;
}

function _names(record) {
    var names = [];
    $.each(record['owner']['names'], function(idx, n) {
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

SPACES = new RegExp("[^A-Za-z0-9_\-]+", "g");
function _clean(s) {
    s = s
        .replace(SPACES, " ")
        .trim()
        .split(" ")
        .join(",")
        .toLowerCase();
    return s;
}

function _encode(p) {
    var s = "";
    $.each(p, function(k, v) {
        s += k + "=" + v + "&";
    });
    return s.slice(0,-1)
}

function _decode(s) {
    var params = {}
    $.each(s.split("&"), function(_, v) {
        kv = v.split("=");
        if (kv[0] != "") {
            params[kv[0]] = kv[1];
        }
    });
    return params
}

function ignore(event) {
	if(event.keyCode == 13){
		event.preventDefault();
	}
}

var BASE = "http://" + (document.domain || "localhost:8080");
// var BASE = "http://patentpit.com";
var docsRequest = null;
var aggsRequest = null;

$( document ).ready(function() {

    var params = _decode(document.location.hash.slice(1).replace(",", " "));
    $("#search_title").val(params['title'])
    $("#search_owners").val(params['owners'])
    $("#search_dates").val(params['dates'])

	$("#searchform").on("keyup", process);
	$("#searchform").on("submit", process);

	process();

});

