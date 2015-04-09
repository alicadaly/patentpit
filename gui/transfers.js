function process(event) {

	function update(response) {

        request = null;

		$("#stats").empty();
		$("#stats").append("<div class='url'>API URL: " + response['url'] + "</div>");
		$("#stats").append("<div class='stats'>RESULTS: " + response['count'] + " SEARCH TIME: " + response['time_search_ms'] + "ms TOTAL REQUEST TIME: " + (new Date().getTime() - t1) + "ms</div>");

		$("#docs").empty();

		$.each(response['data'], function(idx, r) {
			var s = "<div class='doc'>" +
					"<div class='title'>" + r['patent']['titles'][0] + "</div>" +
					"<div class='detail'>FROM: " + _date(r['owner']['date_from']) + " UNTIL: " + _date(r['owner']['date_to']) + " " + _ids(r) + " </div>" +
					"<div class='detail'>OWNERS: " + _names(r) + "</div>";
			$("#docs").append(_highlight(s));
		});

	}

	var t1 = new Date().getTime()

    // abort previous request
    if (request != null) {
        request.abort();
        request = null;
    }

    var params = {
        "title": _clean($("#search_title").val()),
        "owners": _clean($("#search_owners").val()),
        "dates": _clean($("#search_dates").val()),
    };
//     query = $.param(params);
    query = _encode(params);
    document.location.hash = query;

    // this is for highlighting
    var terms = [];
    terms = terms.concat(_clean($("#search_title").val()).split(","));
    terms = terms.concat(_clean($("#search_owners").val()).split(","));
    terms = terms.concat(_clean($("#search_dates").val()).split(","));
    terms = terms.filter(function(e){return e}); // remove empties
    console.log(terms);
	var matches = terms.map(function(s){ return "\\b" + s.toUpperCase(); }).join("|");
	console.log(matches);
	var highlightRegex = new RegExp("(" + matches + ")", "g");
	console.log(highlightRegex);
    function _highlight(s) {
        return s.replace(highlightRegex, "<em>$1</em>");
    }

	request = $.ajax({
		url: BASE + "/api/owners/docs?" + query,
		type: "GET",
		dataType : "json",
		success: update,
		error: function (response) {
// 			console.log(response.statusText);
			$("#stats").empty();
			$("#docs").empty();
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
var request = null;

$( document ).ready(function() {
	$("#searchform").on("keyup", process);
	$("#searchform").on("submit", process);
});

